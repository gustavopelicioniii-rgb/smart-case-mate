import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

function getClientId(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('google_calendar_client_id') || '';
}

export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    location?: string;
    hangoutLink?: string;
    htmlLink?: string;
    status?: string;
    attendees?: { email: string; displayName?: string; responseStatus?: string }[];
}

interface GoogleCalendarEventBody {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: string;
    attendees?: { email: string }[];
    conferenceData?: {
        createRequest: { requestId: string; conferenceSolutionKey: { type: string } };
    };
}

export function useGoogleCalendar() {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
    const [accessToken, setAccessToken] = useState<string | null>(
        () => typeof window !== 'undefined' ? sessionStorage.getItem('google_calendar_token') : null
    );
    const { toast } = useToast();
    const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

    const cleanupAuthListeners = useCallback(() => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
        if (messageHandlerRef.current) {
            window.removeEventListener('message', messageHandlerRef.current);
            messageHandlerRef.current = null;
        }
    }, []);

    const disconnect = useCallback(() => {
        sessionStorage.removeItem('google_calendar_token');
        setAccessToken(null);
        setIsConnected(false);
        setEvents([]);
        toast({ title: 'Google Calendar desconectado' });
    }, [toast]);

    const fetchEvents = useCallback(async (token: string) => {
        setIsLoading(true);
        try {
            const now = new Date();
            const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString();

            const res = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
                `timeMin=${encodeURIComponent(timeMin)}` +
                `&timeMax=${encodeURIComponent(timeMax)}` +
                `&singleEvents=true` +
                `&orderBy=startTime` +
                `&maxResults=50`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) {
                if (res.status === 401) {
                    disconnect();
                    toast({ title: 'Sessão expirada', description: 'Conecte novamente ao Google Calendar.', variant: 'destructive' });
                }
                throw new Error('Falha ao buscar eventos');
            }

            const data = await res.json();
            setEvents(data.items || []);
        } catch {
            // Token may be invalid — silently fail
        } finally {
            setIsLoading(false);
        }
    }, [disconnect, toast]);

    useEffect(() => {
        if (accessToken) {
            setIsConnected(true);
            fetchEvents(accessToken);
        }
    }, [accessToken, fetchEvents]);

    useEffect(() => {
        return () => cleanupAuthListeners();
    }, [cleanupAuthListeners]);

    const connect = useCallback(async () => {
        const clientId = getClientId();
        if (!clientId) {
            toast({
                title: 'Client ID não configurado',
                description: 'Vá em Configurações e insira o Google Client ID.',
                variant: 'destructive',
            });
            return;
        }

        cleanupAuthListeners();

        const codeVerifier = crypto.randomUUID() + crypto.randomUUID();
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        sessionStorage.setItem('pkce_code_verifier', codeVerifier);

        const redirectUri = window.location.origin;
        const state = crypto.randomUUID();
        sessionStorage.setItem('oauth_state', state);

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=token` +
            `&scope=${encodeURIComponent(SCOPES)}` +
            `&state=${encodeURIComponent(state)}` +
            `&prompt=consent`;

        const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
        if (!popup) {
            toast({ title: 'Pop-up bloqueado', description: 'Permita pop-ups para conectar ao Google Calendar.', variant: 'destructive' });
            return;
        }

        const handleToken = (token: string) => {
            sessionStorage.setItem('google_calendar_token', token);
            setAccessToken(token);
            setIsConnected(true);
            fetchEvents(token);
            toast({ title: 'Google Calendar conectado!' });
            cleanupAuthListeners();
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'google-auth-callback' && event.data.token) {
                handleToken(event.data.token);
            }
        };
        messageHandlerRef.current = handleMessage;
        window.addEventListener('message', handleMessage);

        checkIntervalRef.current = setInterval(() => {
            try {
                if (popup && popup.location.href.includes('access_token')) {
                    const hash = popup.location.hash;
                    const params = new URLSearchParams(hash.replace('#', ''));
                    const token = params.get('access_token');
                    if (token) {
                        handleToken(token);
                        popup.close();
                    }
                }
            } catch {
                // cross-origin — popup hasn't redirected yet
            }
            if (popup?.closed) {
                cleanupAuthListeners();
            }
        }, 500);
    }, [toast, fetchEvents, cleanupAuthListeners]);

    const createEvent = useCallback(async (params: {
        summary: string;
        description?: string;
        startDateTime: string;
        endDateTime: string;
        location?: string;
        createMeet?: boolean;
        attendees?: string[];
    }) => {
        if (!accessToken) {
            toast({ title: 'Conecte o Google Calendar primeiro', variant: 'destructive' });
            return null;
        }

        const body: GoogleCalendarEventBody = {
            summary: params.summary,
            description: params.description,
            start: { dateTime: params.startDateTime, timeZone: 'America/Sao_Paulo' },
            end: { dateTime: params.endDateTime, timeZone: 'America/Sao_Paulo' },
        };

        if (params.location) body.location = params.location;
        if (params.attendees?.length) {
            body.attendees = params.attendees.map(email => ({ email }));
        }
        if (params.createMeet) {
            body.conferenceData = {
                createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } },
            };
        }

        try {
            const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
                (params.createMeet ? '?conferenceDataVersion=1' : '');

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Falha ao criar evento');

            const created = await res.json();
            toast({
                title: 'Evento criado no Google Calendar!',
                description: params.createMeet && created.hangoutLink
                    ? `Meet: ${created.hangoutLink}`
                    : created.summary,
            });

            fetchEvents(accessToken);
            return created;
        } catch (err) {
            toast({ title: 'Erro ao criar evento', description: err instanceof Error ? err.message : 'Erro desconhecido', variant: 'destructive' });
            return null;
        }
    }, [accessToken, fetchEvents, toast]);

    const refresh = useCallback(() => {
        if (accessToken) fetchEvents(accessToken);
    }, [accessToken, fetchEvents]);

    return {
        isConnected,
        isLoading,
        events,
        connect,
        disconnect,
        createEvent,
        refresh,
    };
}

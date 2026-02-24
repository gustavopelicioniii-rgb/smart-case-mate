const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Extract keys from .env.local
function getEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.join('=').trim();
        }
    });
    return env;
}

const env = getEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugSync() {
    const testNumber = 'DEBUG-' + Date.now();
    console.log('1. Inserting test process:', testNumber);

    const { data: processo, error: pError } = await supabase
        .from('processos')
        .insert({
            number: testNumber,
            client: 'Debug Client',
            court: 'Debug Court',
            value: 999.88,
            status: 'Em andamento',
            subject: 'Debug Subject',
            class: 'Debug Class'
        })
        .select()
        .single();

    if (pError) {
        console.error('Error inserting process:', pError.message);
        return;
    }

    console.log('2. Process inserted. ID:', processo.id, 'Value:', processo.value);
    console.log('Waiting 3 seconds for trigger...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('3. Checking for fee entry with process_number:', testNumber);
    const { data: fee, error: fError } = await supabase
        .from('fees')
        .select('*')
        .eq('process_number', testNumber)
        .maybeSingle();

    if (fError) {
        console.error('Error checking fees:', fError.message);
    } else if (!fee) {
        console.error('FAIL: Fee entry NOT found. The sync trigger is likely NOT active or failed silently.');
    } else {
        console.log('SUCCESS: Fee entry found!', {
            id: fee.id,
            client: fee.client,
            value: fee.value,
            description: fee.description
        });
    }

    // Cleanup
    console.log('4. Cleaning up test data...');
    await supabase.from('processos').delete().eq('number', testNumber);
    console.log('Done.');
}

debugSync();

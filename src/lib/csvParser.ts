/**
 * Generic CSV parser — handles CSV and semicolon-separated files.
 * Returns an array of objects keyed by header name.
 */

export function parseCSV(text: string): Record<string, string>[] {
    // Detect delimiter (comma vs semicolon)
    const firstLine = text.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = parseLine(lines[0], delimiter).map(h => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i], delimiter);
        const row: Record<string, string> = {};
        headers.forEach((header, j) => {
            row[header] = (values[j] ?? '').trim();
        });
        rows.push(row);
    }

    return rows;
}

/** Parse a single CSV line, handling quoted fields */
function parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

/** Try to parse a value as a number (handles pt-BR: 1.234,56) */
export function parseNumber(value: string): number {
    if (!value) return 0;
    // Remove currency symbols and spaces
    let clean = value.replace(/[R$\s]/g, '');
    // If has both . and , → pt-BR format (1.234,56)
    if (clean.includes('.') && clean.includes(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
        clean = clean.replace(',', '.');
    }
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}

/** Try to parse a date string (dd/mm/yyyy or yyyy-mm-dd) */
export function parseDate(value: string): string | null {
    if (!value) return null;
    // dd/mm/yyyy
    const brMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
        const [, day, month, year] = brMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    // yyyy-mm-dd (already ISO)
    const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}$/);
    if (isoMatch) return value;
    return null;
}

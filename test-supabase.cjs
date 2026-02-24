const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser since we have issues with dotenv/tsx
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
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
    console.log('Testing connection to:', supabaseUrl);

    const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });

    if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "profiles" does not exist')) {
            console.error('ERROR: The "profiles" table does NOT exist. You probably didn\'t run the SQL migration yet.');
        } else {
            console.error('ERROR connecting to Supabase:', error.message);
        }
    } else {
        console.log('SUCCESS: Connected to Supabase and "profiles" table exists.');
    }
}

testConnection();

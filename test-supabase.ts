import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

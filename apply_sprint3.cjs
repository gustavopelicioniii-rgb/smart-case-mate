const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing configuration');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
    const sqlPath = path.join(__dirname, 'supabase_sprint3_init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying Sprint 3 migrations...');

    // O rpc 'exec_sql' deve estar disponível no seu Supabase
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error applying migration:', error.message);
        console.log('Tentando via comandos individuais se o RPC falhar...');
        // Fallback: se o RPC falhar, o usuário pode precisar rodar manualmente ou eu posso tentar outra abordagem
    } else {
        console.log('Migrations applied successfully!');
    }
}

applyMigrations();

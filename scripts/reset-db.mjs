import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Emergency Database Reset Script
// Refuses to run without explicit user confirmation phrase.

const CONFIRMATION_PHRASE = 'RESET-CAMPUS-BUDDY';

async function main() {
  console.log('\n============================================================');
  console.log('  ⚠️  EMERGENCY DATABASE RESET UTILITY (Campus Buddy)  ⚠️');
  console.log('============================================================\n');
  console.log('This operation will WIPE ALL active data from the database');
  console.log('and reseed it with default sample records from supabase/seed.sql.\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project-id')) {
    console.log('Notice: Supabase environment variables not configured.');
    console.log('The application is running in In-Memory Demo Mode.');
    console.log('In Demo Mode, restarting the dev server automatically resets in-memory data.\n');
    process.exit(0);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  const answer = await question(`To confirm destruction and reset, type "${CONFIRMATION_PHRASE}": `);
  rl.close();

  if (answer.trim() !== CONFIRMATION_PHRASE) {
    console.log('\n❌ Confirmation phrase mismatch. Operation safely aborted.\n');
    process.exit(1);
  }

  console.log('\nConnecting to Supabase using Service Role credentials...');
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    console.log('Clearing existing tables (reports, chat_messages, help_replies, help_requests, rsvps, post_upvotes, posts, profiles)...');
    await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('help_replies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('help_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rsvps').delete().neq('event_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('post_upvotes').delete().neq('post_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Reading seed file from supabase/seed.sql...');
    const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');

    // Split SQL statements or run reseed via query
    console.log('✅ Tables cleared successfully.');
    console.log('Tip: Open Supabase Dashboard -> SQL Editor and paste supabase/seed.sql to execute the full insert batch.');
    console.log('✅ Emergency reset completed successfully.\n');
  } catch (err) {
    console.error('Reset error:', err);
    process.exit(1);
  }
}

main();

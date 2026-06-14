import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ajwvgqpfmtlpntgdqfvn.supabase.co', 'sb_publishable_U2zVxvnAFpcVZILCvuX7BQ_fdjZz4x7');

async function check() {
  const { data, error } = await supabase.from('messages').select('*').limit(1);
  if (error) {
    console.log("Error or table doesn't exist:", error);
  } else {
    console.log("Table exists! Data:", data);
  }
}
check();

import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ajwvgqpfmtlpntgdqfvn.supabase.co', 'sb_publishable_U2zVxvnAFpcVZILCvuX7BQ_fdjZz4x7');
supabase.auth.signInWithPassword({ email: 'test@test.com', password: 'test' }).then(console.log);

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// URL limpia, sin el /rest/v1/ al final
const supabaseUrl = 'https://kyarktxrwfmlpevvvarb.supabase.co'; 
const supabaseKey = 'sb_publishable_lvKGK8-gxkbs8M-4Ouo2yg_iBhbTqEN';

export const supabase = createClient(supabaseUrl, supabaseKey);
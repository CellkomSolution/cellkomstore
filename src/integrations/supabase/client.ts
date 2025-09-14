import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rsdvsmcvizbmzqeogmpa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZHZzbWN2aXpibXpxZW9nbXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNzkzMjcsImV4cCI6MjA3Mjg1NTMyN30.jeZlkJQIqyt_iN3h25AGv5DfHv3K30dq7i96w3PmBfw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
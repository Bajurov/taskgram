import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oupltfkyzaikaxrimezj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cGx0Zmt5emFpa2F4cmltZXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MTY1NjMsImV4cCI6MjA2MjM5MjU2M30.ugZJP7W3If776tqb0giqEfAOWpgUTboFHmg6NnsURkM';

export const supabase = createClient(supabaseUrl, supabaseKey); 
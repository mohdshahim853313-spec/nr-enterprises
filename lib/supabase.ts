import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ycykuweoprcspzwvcezw.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljeWt1d2VvcHJjc3B6d3ZjZXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1Nzk5NjMsImV4cCI6MjExMDE1NTk2M30.GmpLl4yc0PGUAU4Yh0PlQsTl4CJRNEvfaJnKTIuDDNE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

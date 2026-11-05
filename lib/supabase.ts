import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qjpjltaiazwybhsmnkve.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcGpsdGFpYXp3eWJoc21ua3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MzE1MjQsImV4cCI6MjEwMjUwNzUyNH0.2BiNade49az4aGj2keveLF78kQLLk3VG2Rql5GubQWw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
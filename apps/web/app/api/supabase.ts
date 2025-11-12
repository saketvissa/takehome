
import { createClient as createClientSupabase } from "@supabase/supabase-js";

// Initialize Supabase client for frontend (uses anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const createClient = () => createClientSupabase(supabaseUrl, supabaseKey);
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が未設定でもアプリは動きます(保存はされません)
export const supabase = url && key ? createClient(url, key) : null;

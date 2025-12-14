import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { Database } from "@/database.types";

const supabaseURL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseURL || !supabasePublishableKey) {
    throw new Error("Missing supabase environment variables");
}

export const supabase = createClient<Database>(supabaseURL, supabasePublishableKey, {
    auth: {
        flowType: "pkce",
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

AppState.addEventListener("change", (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

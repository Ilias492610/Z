import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

interface SupabaseContextType {
    session: Session | null;
    login: (email: string, password: string) => Promise<void>;
    loginWithProvider: (provider: 'google') => Promise<void>;
    logout: () => Promise<void>;
    loggingIn: boolean;
    initializing: boolean;
    register: (email: string, password: string) => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType>({
    session: null,
    login: async(_email: string, _password: string) => {},
    loginWithProvider: async() => {},
    logout: async() => {},
    loggingIn: false,
    initializing: false,
    register: async(_email: string, _password: string) => {}
});

const SupabaseProvider = ({children} : { children: ReactNode}) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const [initializing, setInitializing] = useState<boolean>(true);

    const router = useRouter();
    
    useEffect(() => {
        WebBrowser.maybeCompleteAuthSession();
    }, []);

    const setSessionFromRedirectUrl = async (redirectUrl: string) => {
        const [base, fragment] = redirectUrl.split("#", 2);
        const query = base.includes("?") ? base.split("?", 2)[1] : "";
        const queryParams = new URLSearchParams(query);
        const code = queryParams.get("code");

        if (code) {
            await supabase.auth.exchangeCodeForSession(redirectUrl);
            return;
        }

        if (!fragment) return;
        const fragmentParams = new URLSearchParams(fragment);
        const access_token = fragmentParams.get("access_token");
        const refresh_token = fragmentParams.get("refresh_token");

        if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
        }
    };

    useEffect(() => {
        let cancelled = false; 

        const init = async() => {
            try {
                const { data } = await supabase.auth.getSession();
                if (cancelled) return;
                setSession(data.session);
            } catch (e) {
            } finally {
                if (cancelled) return;
                setInitializing(false);
            }
        }

        init();

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (cancelled) return;
            setSession(newSession);
            if (event === "SIGNED_IN" || (event === "INITIAL_SESSION" && newSession)) {
                router.replace("/dashboard");
            }
            
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        }
    }, []);


    const register = async(email: string, password: string) => {
        const emailRedirectTo = Linking.createURL("/auth/callback");
        await supabase.auth.signUp({email, password, options: { emailRedirectTo }});
    }

    const login = async(email: string, password: string) => {
        setLoggingIn(true);
        try {
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
        } finally {
            setLoggingIn(false);
        }
    }

    const loginWithProvider = async(provider: 'google') => {
        const redirectTo = Linking.createURL("/auth/callback");

        const { data } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
                skipBrowserRedirect: true,
            },
        });
        if (!data?.url) return;

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== "success" || !result.url) return;

        await setSessionFromRedirectUrl(result.url);
    }

    const logout = async() => {
        await supabase.auth.signOut();
    }

    return (
        <SupabaseContext.Provider value={{register, initializing, session, loggingIn, login, loginWithProvider, logout}}>
            {children}
        </SupabaseContext.Provider>
    )

}

export const useSupabase = () => {
    const context = useContext(SupabaseContext);
    if (context === undefined) {
        throw new Error("useSupabase must be used within a SupabaseProvider");
    }
    return context;
}

export default SupabaseProvider;

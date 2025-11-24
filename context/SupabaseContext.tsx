import { supabase } from "@/lib/supabase";
import { useRoute } from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface SupabaseContextType {
    session: Session | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loggingIn: boolean;
    initializing: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
    session: null,
    login: async(email: string, password: string) => {},
    logout: async() => {},
    loggingIn: false,
    initializing: false
});

const SupabaseProvider = ({children} : { children: ReactNode}) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const [initializing, setInitializing] = useState<boolean>(true);
    const router = useRouter();
    
    useEffect(() => {
        let cancelled = false; 

        const init = async() => {
            try {
                const { data } = await supabase.auth.getSession();
                if (cancelled) return; // Ignore the session because cancelled
                setSession(data.session);
            } catch (e) {
                console.log("Error fetching session", e);
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
            if (event === "SIGNED_IN") {
                router.replace("/dashboard");                
            } else if (event === "INITIAL_SESSION") {
                router.replace("/dashboard");
            } else if (event === "SIGNED_OUT") {
                router.replace("/login");
            }
            
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        }
    }, []);

    const login = async(email: string, password: string) => {
        setLoggingIn(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (error) throw error;
        } finally {
            setLoggingIn(false);
        }
    }

    const logout = async() => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (err) {
            console.error("Error signing out", err);
        }
    }

    return (
        <SupabaseContext.Provider value={{initializing, session, loggingIn, login, logout}}>
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
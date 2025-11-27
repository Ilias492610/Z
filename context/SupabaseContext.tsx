import { Database } from "@/database.types";
import { supabase } from "@/lib/supabase";
import { AddLandmark, Landmark } from "@/types";
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
    landmarks: Landmark[],
    loading: boolean;
    error: Error | null;
    addLandmark: (landmark: AddLandmark) => Promise<void>,
    register: (email: string, password: string) => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType>({
    session: null,
    login: async(email: string, password: string) => {},
    logout: async() => {},
    loggingIn: false,
    initializing: false,
    landmarks: [],
    loading: false,
    error: null,
    addLandmark: async(landmark: AddLandmark) => {},
    register: async(email,password) => {}
});

const SupabaseProvider = ({children} : { children: ReactNode}) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const [initializing, setInitializing] = useState<boolean>(true);

    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [trigger, setTrigger] = useState<number>(0);

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


    useEffect(() => {
        let cancelled = false;
        const fetchLandmarks = async() => {
            setError(null);
            try {
                setLoading(true);
                const {data, error} = await supabase.from("landmarks").select("*");

                if (error) {
                    throw error;
                }
                if (cancelled) return;
                setLandmarks(data);

            } catch (e) {
                console.error(e);
                setError(e as Error);
            } finally {
                setLoading(false)
            }
        }
        fetchLandmarks();


        return () => {
            cancelled = true;
        }
    },[trigger]);

    const addLandmark = async(landmark: AddLandmark) => {
        try {
            const { error } = await supabase.from("landmarks").insert(landmark);
            if (error) {
                throw error;
            }
            setTrigger(trigger => trigger + 1);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    const register = async(email: string, password: string) => {
        try {
            await supabase.auth.signUp({email, password});
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

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
        <SupabaseContext.Provider value={{register, initializing, session, loggingIn, login, logout, landmarks, loading, error, addLandmark}}>
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
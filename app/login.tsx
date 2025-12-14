import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { SocialConnections } from "@/components/social-connections";
import { useSupabase } from "@/context/SupabaseContext";
import { Redirect, Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Screen() {
    const { login, loggingIn, session, initializing } = useSupabase();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (initializing) return <ActivityIndicator animating />;
    if (session) {
        return <Redirect href="/dashboard" />;
    }

    const handleLogin = async () => {
        await login(email.trim(), password);
    };

    return (
        <>
            <Stack.Screen options={{ title: "Login" }} />
            <View className="flex-1 items-center justify-center p-8 gap-4">
                <View className="w-full max-w-md gap-4">
                    <View className="items-center">
                        <Text className="text-6xl font-black text-foreground tracking-tight">Z</Text>
                    </View>
                    <Text className="text-2xl font-semibold">Sign in</Text>
                    <View className="gap-2">
                        <Text>Email</Text>
                        <Input
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                        />
                    </View>
                    <View className="gap-2">
                        <Text>Password</Text>
                        <Input
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                        />
                    </View>
                    <Button onPress={handleLogin} disabled={loggingIn}>
                        <Text>{loggingIn ? "Signing in..." : "Sign in"}</Text>
                    </Button>
                    <SocialConnections />
                    <Button variant="link" onPress={() => router.push("/register")}>
                        <Text>No account? Register</Text>
                    </Button>
                </View>
            </View>
        </>
    );
}

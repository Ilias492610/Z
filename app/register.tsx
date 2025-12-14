import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useSupabase } from "@/context/SupabaseContext";
import { Redirect, Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function RegisterScreen() {
    const { register, session, initializing } = useSupabase();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (initializing) return null;
    if (session) return <Redirect href="/dashboard" />;

    const handleRegister = async () => {
        setLoading(true);
        try {
            await register(email.trim(), password);
            router.replace("/login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: "Register" }} />
            <View className="flex-1 items-center justify-center p-8">
                <View className="w-full max-w-md gap-4">
                    <Text className="text-2xl font-semibold">Create account</Text>
                    <View className="gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                        />
                    </View>
                    <View className="gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                        />
                    </View>
                    <View className="gap-2">
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input
                            id="confirmPassword"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Repeat your password"
                        />
                    </View>
                    <Button onPress={handleRegister} disabled={loading}>
                        <Text>{loading ? "Registering..." : "Register"}</Text>
                    </Button>
                    <Button variant="link" onPress={() => router.back()}>
                        <Text>Already have an account? Sign in</Text>
                    </Button>
                </View>
            </View>
        </>
    );
}

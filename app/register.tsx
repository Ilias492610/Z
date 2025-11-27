import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { supabase } from '@/lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useState } from "react";
import { Alert, type TextInput, View } from 'react-native';

const SCREEN_OPTIONS = {
    title: 'Register',
    headerTransparent: true,
    headerRight: () => <ThemeToggle />,
};

export default function RegisterScreen() {
    const { colorScheme } = useColorScheme();
    const router = useRouter();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const passwordInputRef = React.useRef<TextInput>(null);
    const confirmPasswordInputRef = React.useRef<TextInput>(null);

    const handleRegister = async () => {
        // Validation
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) throw error;

            Alert.alert(
                "Success", 
                "Registration successful! Please check your email to verify your account.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/login")
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert("Registration Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const onEmailSubmitEditing = () => {
        passwordInputRef.current?.focus();
    };

    const onPasswordSubmitEditing = () => {
        confirmPasswordInputRef.current?.focus();
    };

    return (
        <>
            <Stack.Screen options={SCREEN_OPTIONS} />
            <View className="flex-1 items-center justify-center p-8">
                <View className="w-full max-w-md gap-6">
                    <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
                        <CardHeader>
                            <CardTitle className="text-center text-xl sm:text-left">Create Account</CardTitle>
                            <CardDescription className="text-center sm:text-left">
                                Enter your details to register
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="gap-6">
                            <View className="gap-6">
                                <View className="gap-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="m@example.com"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                        onSubmitEditing={onEmailSubmitEditing}
                                        returnKeyType="next"
                                        submitBehavior="submit"
                                        editable={!loading}
                                    />
                                </View>
                                <View className="gap-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        ref={passwordInputRef}
                                        id="password"
                                        placeholder="Enter your password"
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        onSubmitEditing={onPasswordSubmitEditing}
                                        returnKeyType="next"
                                        editable={!loading}
                                    />
                                </View>
                                <View className="gap-1.5">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        ref={confirmPasswordInputRef}
                                        id="confirmPassword"
                                        placeholder="Confirm your password"
                                        secureTextEntry
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        onSubmitEditing={handleRegister}
                                        returnKeyType="send"
                                        editable={!loading}
                                    />
                                </View>
                                <Button 
                                    className="w-full" 
                                    onPress={handleRegister}
                                    disabled={loading}
                                >
                                    <Text>{loading ? "Registering..." : "Register"}</Text>
                                </Button>
                                <Button 
                                    variant="link" 
                                    className="w-full"
                                    onPress={() => router.back()}
                                    disabled={loading}
                                >
                                    <Text>Already have an account? Sign in</Text>
                                </Button>
                            </View>
                        </CardContent>
                    </Card>
                </View>
            </View>
        </>
    );
}

const THEME_ICONS = {
    light: SunIcon,
    dark: MoonStarIcon,
};

function ThemeToggle() {
    const { colorScheme, toggleColorScheme } = useColorScheme();

    return (
        <Button
            onPressIn={toggleColorScheme}
            size="icon"
            variant="ghost"
            className="ios:size-9 rounded-full web:mx-4">
            <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
        </Button>
    );
}
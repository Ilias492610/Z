import { SignInForm } from "@/components/sign-in-form";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from "@/components/ui/input";
import { Text } from '@/components/ui/text';
import { useSupabase } from "@/context/SupabaseContext";
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useState } from "react";
import { Image, type ImageStyle, TextInput, View } from 'react-native';

const LOGO = {
    light: require('@/assets/images/react-native-reusables-light.png'),
    dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS = {
    title: 'React Native Reusables',
    headerTransparent: true,
    headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
    height: 76,
    width: 76,
};

interface AlertViewProps {
    text: string
}

export default function Screen() {
    const { colorScheme } = useColorScheme();

    const { login } = useSupabase();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLogin = async() => {
        try {
            await login(email, password);
        } catch (e) {
            alert(e);
        }
    }

    return (
        <>
            <Stack.Screen options={SCREEN_OPTIONS} />
            <View className="flex-1 items-center justify-center p-8 gap-2">
                
                <Text>Email: </Text>
                <Input inputMode="email" value={email} onChangeText={(email) => setEmail(email)}/ >

                <Text>Password</Text>
                <Input secureTextEntry={true} value={password} onChangeText={(password) => setPassword(password)}/ >


                <Button onPress={handleLogin}><Text>Login</Text></Button>
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

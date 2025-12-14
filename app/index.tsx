import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useTwitter } from '@/context/TwitterContext';
import { useSupabase } from '@/context/SupabaseContext';
import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, type ImageStyle, View } from 'react-native';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS = {
  title: 'Twitter Clone',
  headerTransparent: true,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

const BYPASS_LOGIN = false;

export default function Screen() {
  const { session, initializing: supaInit } = useSupabase();
  const { token, defaultEmail, initializing, requestingToken, requestToken, setTokenManually } = useTwitter();
  const [email, setEmail] = useState(defaultEmail);
  const [manualToken, setManualToken] = useState('');

  if (BYPASS_LOGIN) {
    return <Redirect href="/dashboard" />;
  }

  if (supaInit || initializing) {
    return <ActivityIndicator animating />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (token) {
    return <Redirect href="/dashboard" />;
  }

  const handleRequestToken = async () => {
    await requestToken(email);
  };

  const handleSaveToken = async () => {
    if (!manualToken.trim()) return;
    await setTokenManually(manualToken.trim());
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center p-8 gap-6">
        <Image source={LOGO.light} style={IMAGE_STYLE} />
        <View className="w-full max-w-md gap-4">
          <Text className="text-xl font-semibold">API token ophalen</Text>
          <Text>
            Gebruik je AP-mail om een bearer token op te halen voor de Sample APIs. We bewaren hem lokaal in
            AsyncStorage.
          </Text>
          <View className="gap-2">
            <Text className="font-semibold">AP e-mailadres</Text>
            <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>
          <Button onPress={handleRequestToken} disabled={requestingToken}>
            <Text>{requestingToken ? 'Bezig met ophalen...' : 'Vraag token aan'}</Text>
          </Button>
          <View className="gap-2">
            <Text className="font-semibold">Heb je al een token?</Text>
            <Input
              value={manualToken}
              onChangeText={setManualToken}
              placeholder="Plak hier je bearer token"
              autoCapitalize="none"
            />
            <Button variant="outline" onPress={handleSaveToken}>
              <Text>Bewaar token</Text>
            </Button>
          </View>
        </View>
      </View>
    </>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_EMAIL, fetchProfiles, fetchTokenForEmail, fetchTweets, postTweet } from '@/lib/twitter';
import { CreateTweetInput, Profile, Tweet } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const TOKEN_KEY = 'twitter-api-token';

interface TwitterContextType {
  token: string | null;
  defaultEmail: string;
  initializing: boolean;
  requestingToken: boolean;
  tweets: Tweet[];
  tweetsLoading: boolean;
  profiles: Profile[];
  profilesLoading: boolean;
  requestToken: (email: string) => Promise<void>;
  setTokenManually: (token: string) => Promise<void>;
  refreshTweets: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  publishTweet: (input: CreateTweetInput) => Promise<void>;
  clearToken: () => Promise<void>;
}

const TwitterContext = createContext<TwitterContextType | undefined>(undefined);

const TwitterProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [requestingToken, setRequestingToken] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (cancelled) return;
        setToken(storedToken);
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    loadToken();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setTweets([]);
      setProfiles([]);
      return;
    }

    refreshTweets();
    refreshProfiles();
  }, [token]);

  const saveToken = async (value: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, value);
    setToken(value);
  };

  const requestToken = async (email: string) => {
    setRequestingToken(true);
    try {
      const newToken = await fetchTokenForEmail(email);
      if (!newToken) return;
      await saveToken(newToken);
    } catch {
    } finally {
      setRequestingToken(false);
    }
  };

  const setTokenManually = async (value: string) => {
    if (!value) return;
    await saveToken(value);
  };

  const refreshTweets = async () => {
    if (!token) return;
    setTweetsLoading(true);
    try {
      const data = await fetchTweets(token);
      setTweets(data);
    } catch {
    } finally {
      setTweetsLoading(false);
    }
  };

  const publishTweet = async (input: CreateTweetInput) => {
    if (!token) return;
    const createdAt = new Date().toISOString();

    let author = input.author;
    let handle = input.handle;
    let avatar = input.avatar;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      const email = sessionData.session?.user?.email ?? undefined;

      if (userId && (!author || !handle || !avatar)) {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('name,handle,avatar_url')
          .eq('user_id', userId)
          .maybeSingle();

        author = author ?? profileRow?.name ?? (email ? email.split('@')[0] : 'You');
        handle =
          handle ??
          profileRow?.handle ??
          (email ? email.split('@')[0].replace(/[^A-Za-z0-9_]/g, '_') : `user_${userId.slice(0, 8)}`);
        avatar = avatar ?? profileRow?.avatar_url ?? undefined;
      }
    } catch {
    }

    if (avatar?.startsWith('data:')) {
      avatar = undefined;
    }

    const optimisticTweet: Tweet = {
      id: -Date.now(),
      author: author ?? 'You',
      handle: handle ?? 'you',
      avatar,
      text: input.text,
      image: input.image ?? undefined,
      createdAt,
      likes: 0,
    };

    setTweets((current) => [optimisticTweet, ...current]);

    await postTweet(token, { ...input, author, handle, avatar }).catch(() => {});
    const data = await fetchTweets(token).catch(() => null);
    if (!data) return;

    const found = data.some(
      (t) =>
        (t.text || '').trim() === optimisticTweet.text.trim() &&
        (t.handle || '').toLowerCase() === (optimisticTweet.handle || '').toLowerCase()
    );
    setTweets(found ? data : [optimisticTweet, ...data]);
  };

  const refreshProfiles = async () => {
    if (!token) return;
    setProfilesLoading(true);
    try {
      const data = await fetchProfiles(token);
      setProfiles(data);
    } catch {
    } finally {
      setProfilesLoading(false);
    }
  };

  const clearToken = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTweets([]);
    setProfiles([]);
  };

  return (
    <TwitterContext.Provider
      value={{
        token,
        defaultEmail: DEFAULT_EMAIL,
        initializing,
        requestingToken,
        tweets,
        tweetsLoading,
        profiles,
        profilesLoading,
        requestToken,
        setTokenManually,
        refreshTweets,
        refreshProfiles,
        publishTweet,
        clearToken,
      }}>
      {children}
    </TwitterContext.Provider>
  );
};

export const useTwitter = () => {
  const context = useContext(TwitterContext);
  if (context === undefined) {
    throw new Error('useTwitter moet binnen een TwitterProvider gebruikt worden');
  }
  return context;
};

export default TwitterProvider;

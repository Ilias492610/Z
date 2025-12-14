import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { TweetCard } from "@/components/tweet-card";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/context/SupabaseContext";
import { useTwitter } from "@/context/TwitterContext";
import { Profile, Tweet } from "@/types";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, View, type ListRenderItem } from "react-native";
import { PlusIcon } from "lucide-react-native";

const FeedScreen = () => {
    const { tweets, tweetsLoading, refreshTweets, token, profiles, refreshProfiles } = useTwitter();
    const { session } = useSupabase();
    const router = useRouter();
    const [myProfile, setMyProfile] = useState<{ name: string | null; avatar_url: string | null } | null>(null);

    const loadMyProfile = useCallback(async () => {
        const userId = session?.user?.id;
        if (!userId) {
            setMyProfile(null);
            return;
        }
        const { data } = await supabase
            .from("profiles")
            .select("name,avatar_url")
            .eq("user_id", userId)
            .maybeSingle();
        setMyProfile(data ? { name: data.name ?? null, avatar_url: data.avatar_url ?? null } : null);
    }, [session?.user?.id]);

    useEffect(() => {
        refreshTweets();
        refreshProfiles();
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            loadMyProfile();
        }, [loadMyProfile])
    );

    const sortedTweets = useMemo(() => {
        return [...tweets].sort((a, b) => {
            const rawA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const rawB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const timeA = Number.isFinite(rawA) ? rawA : 0;
            const timeB = Number.isFinite(rawB) ? rawB : 0;
            return timeB - timeA;
        });
    }, [tweets]);

    const findProfile = (tweet: Tweet): Profile | null => {
        const handle = (tweet.handle || tweet.author || "").toLowerCase();
        return profiles.find((p) => (p.handle || "").toLowerCase() === handle) ?? null;
    };

    const goToProfile = (handle?: string) => {
        const safeHandle = handle || "";
        if (!safeHandle) return;
        router.push(`/dashboard/user/${safeHandle}`);
    };

    const myInitial = useMemo(() => {
        const base = (myProfile?.name || session?.user?.email || "U").trim();
        return base.slice(0, 1).toUpperCase();
    }, [myProfile?.name, session?.user?.email]);

    const HeaderAvatar = () => (
        <Pressable onPress={() => router.push("/dashboard/profile")} style={{ marginLeft: 12, paddingTop: 14 }}>
            {myProfile?.avatar_url ? (
                <Image
                    source={{ uri: myProfile.avatar_url }}
                    className="h-10 w-10 rounded-full bg-muted"
                    resizeMode="cover"
                />
            ) : (
                <View className="h-10 w-10 rounded-full bg-muted items-center justify-center">
                    <Text className="font-semibold text-muted-foreground">{myInitial}</Text>
                </View>
            )}
        </Pressable>
    );

    const renderItem: ListRenderItem<Tweet> = ({ item }) => (
        <TweetCard
            tweet={item}
            profile={findProfile(item)}
            onPressProfile={() => goToProfile(findProfile(item)?.handle || item.handle || item.author)}
        />
    );

    if (!token) {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerShadowVisible: false,
                        headerStyle: { backgroundColor: "transparent", height: 110 } as any,
                        headerTitle: () => (
                            <View style={{ paddingTop: 14 }}>
                                <Text className="text-4xl font-black text-foreground tracking-tight">Z</Text>
                            </View>
                        ),
                        headerLeft: () => <HeaderAvatar />,
                    }}
                />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-lg font-semibold text-center">No API token yet</Text>
                    <Text className="text-center text-muted-foreground mt-2">Go back to the home screen to request or paste your Sample API token.</Text>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: "transparent", height: 110 } as any,
                    headerTitle: () => (
                        <View style={{ paddingTop: 14 }}>
                            <Text className="text-4xl font-black text-foreground tracking-tight">Z</Text>
                        </View>
                    ),
                    headerLeft: () => <HeaderAvatar />,
                }}
            />
            <View className="flex-1 bg-background">
                {tweetsLoading && tweets.length === 0 ? (
                    <ActivityIndicator animating />
                ) : (
                    <>
                        <FlatList
                            data={sortedTweets}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
                            refreshControl={<RefreshControl refreshing={tweetsLoading} onRefresh={refreshTweets} />}
                            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-10">
                                    <Text className="text-muted-foreground">No tweets yet.</Text>
                                    <Button className="mt-4" onPress={refreshTweets}>
                                        <Text>Try again</Text>
                                    </Button>
                                </View>
                            }
                        />
                        <Button
                            className="absolute right-6 bottom-10 h-14 w-14 rounded-full bg-purple-500 shadow-lg shadow-black/20"
                            size="icon"
                            onPress={() => router.push("/dashboard/create")}
                            accessibilityLabel="Compose new tweet">
                            <Icon as={PlusIcon} className="size-6 text-white" />
                        </Button>
                    </>
                )}
            </View>
        </>
    );
};

export default FeedScreen;

import { TweetCard } from "@/components/tweet-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useTwitter } from "@/context/TwitterContext";
import { Profile, Tweet } from "@/types";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";

const UserScreen = () => {
    const { handle } = useLocalSearchParams<{ handle?: string }>();
    const { token, profiles, profilesLoading, refreshProfiles, tweets, tweetsLoading, refreshTweets } = useTwitter();

    useEffect(() => {
        if (!profiles.length) {
            refreshProfiles();
        }
        if (!tweets.length) {
            refreshTweets();
        }
    }, [token]);

    if (!token) {
        return <Redirect href="/" />;
    }

    const normalizedHandle = (handle || "").toLowerCase();
    const profile: Profile | undefined = useMemo(
        () => profiles.find((p) => (p.handle || "").toLowerCase() === normalizedHandle),
        [profiles, normalizedHandle]
    );

    const userTweets: Tweet[] = useMemo(
        () => tweets.filter((t) => (t.handle || t.author || "").toLowerCase() === normalizedHandle),
        [tweets, normalizedHandle]
    );

    return (
        <>
            <Stack.Screen
                options={{
                    title: profile ? profile.name : handle,
                }}
            />
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 24, gap: 16 }}>
                {profilesLoading || tweetsLoading ? <ActivityIndicator animating /> : null}

                {profile ? (
                    <Card className="border border-border bg-white/90 dark:bg-zinc-900/70">
                        <CardHeader>
                            <CardTitle className="text-xl">{profile.name}</CardTitle>
                            <CardDescription>@{profile.handle}</CardDescription>
                        </CardHeader>
                        <CardContent className="gap-3">
                            {profile.banner ? (
                                <View className="overflow-hidden rounded-lg border border-border">
                                    <Image source={{ uri: profile.banner }} className="h-36 w-full" resizeMode="cover" />
                                </View>
                            ) : null}
                            <View className="flex-row items-center gap-3">
                                {profile.avatar ? (
                                    <Image source={{ uri: profile.avatar }} className="h-16 w-16 rounded-full bg-muted" />
                                ) : (
                                    <View className="h-16 w-16 rounded-full bg-muted" />
                                )}
                                <View className="gap-1">
                                    <Text className="font-semibold text-lg">{profile.name}</Text>
                                    <Text className="text-muted-foreground">@{profile.handle}</Text>
                                </View>
                            </View>
                            {profile.bio ? <Text>{profile.bio}</Text> : null}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent>
                            <Text>No profile found for @{handle}</Text>
                        </CardContent>
                    </Card>
                )}

                <View className="gap-3">
                    <Text className="text-xl font-semibold">Tweets</Text>
                    {userTweets.length ? (
                        userTweets.map((tweet) => (
                            <TweetCard key={tweet.id} tweet={tweet} profile={profile} />
                        ))
                    ) : (
                        <Text className="text-muted-foreground">No tweets for this user yet.</Text>
                    )}
                </View>
            </ScrollView>
        </>
    );
};

export default UserScreen;

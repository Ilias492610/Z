import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { FeedControls, type SortOption } from "@/components/feed-controls";
import { Pagination } from "@/components/pagination";
import { TweetCard } from "@/components/tweet-card";
import { useTwitter } from "@/context/TwitterContext";
import { Profile, Tweet } from "@/types";
import { Redirect, Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View, type ListRenderItem } from "react-native";

const PAGE_SIZE = 5;

const SearchScreen = () => {
    const { tweets, tweetsLoading, refreshTweets, token, profiles, refreshProfiles } = useTwitter();
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortOption>("newest");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        refreshTweets();
        refreshProfiles();
    }, [token]);

    useEffect(() => {
        setCurrentPage(1);
    }, [query, sort, tweets.length]);

    const filteredTweets = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const filtered = normalizedQuery
            ? tweets.filter((tweet) => {
                  const text = tweet.text?.toLowerCase() ?? "";
                  const author = tweet.author?.toLowerCase() ?? "";
                  const handle = tweet.handle?.toLowerCase() ?? "";
                  return text.includes(normalizedQuery) || author.includes(normalizedQuery) || handle.includes(normalizedQuery);
              })
            : tweets;

        const withSort = [...filtered].sort((a, b) => {
            const likesA = typeof a.likes === "number" ? a.likes : 0;
            const likesB = typeof b.likes === "number" ? b.likes : 0;
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            if (sort === "oldest") return timeA - timeB;
            if (sort === "most_liked") return likesB - likesA;
            return timeB - timeA;
        });

        return withSort;
    }, [tweets, query, sort]);

    const pageCount = Math.max(1, Math.ceil(filteredTweets.length / PAGE_SIZE));

    useEffect(() => {
        if (currentPage > pageCount) {
            setCurrentPage(pageCount);
        }
    }, [pageCount, currentPage]);

    const paginatedTweets = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredTweets.slice(start, start + PAGE_SIZE);
    }, [filteredTweets, currentPage]);

    const findProfile = (tweet: Tweet): Profile | null => {
        const handle = (tweet.handle || tweet.author || "").toLowerCase();
        return profiles.find((p) => (p.handle || "").toLowerCase() === handle) ?? null;
    };

    const goToProfile = (handle?: string) => {
        const safeHandle = handle || "";
        if (!safeHandle) return;
        router.push(`/dashboard/user/${safeHandle}`);
    };

    const renderItem: ListRenderItem<Tweet> = ({ item }) => (
        <TweetCard
            tweet={item}
            profile={findProfile(item)}
            onPressProfile={() => goToProfile(findProfile(item)?.handle || item.handle || item.author)}
        />
    );

    if (!token) {
        return <Redirect href="/" />;
    }

    return (
        <>
            <Stack.Screen options={{ title: "Search" }} />
            <View className="flex-1 bg-background">
                {tweetsLoading && tweets.length === 0 ? (
                    <ActivityIndicator animating />
                ) : (
                    <FlatList
                        data={paginatedTweets}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                        refreshControl={<RefreshControl refreshing={tweetsLoading} onRefresh={refreshTweets} />}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        ListHeaderComponent={
                            <View className="gap-4 mb-4">
                                <FeedControls
                                    query={query}
                                    sort={sort}
                                    onChangeQuery={setQuery}
                                    onSubmitSearch={() => setCurrentPage(1)}
                                    onChangeSort={(value) => setSort(value)}
                                />
                                <Pagination pageCount={pageCount} currentPage={currentPage} onChange={setCurrentPage} />
                            </View>
                        }
                        ListFooterComponent={
                            <View className="mt-6">
                                <Pagination pageCount={pageCount} currentPage={currentPage} onChange={setCurrentPage} />
                            </View>
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center py-10">
                                <Text className="text-muted-foreground">Geen resultaten voor je zoekopdracht.</Text>
                                <Button className="mt-4" onPress={() => setQuery("")}>
                                    <Text>Reset zoeken</Text>
                                </Button>
                            </View>
                        }
                    />
                )}
            </View>
        </>
    );
};

export default SearchScreen;

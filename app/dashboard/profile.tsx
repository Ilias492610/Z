import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { supabase } from "@/lib/supabase";
import { useTwitter } from "@/context/TwitterContext";
import { useSupabase } from "@/context/SupabaseContext";
import { Redirect, Stack, useRouter } from "expo-router";
import { ImagePlusIcon, ImageIcon, SaveIcon } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = () => {
    const { clearToken, token } = useTwitter();
    const { logout, session, initializing } = useSupabase();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [handle, setHandle] = useState("");
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [bannerUri, setBannerUri] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);

    const userId = session?.user?.id ?? null;
    const email = session?.user?.email ?? "";

    const initials = useMemo(() => {
        const base = (name || email || "U").trim();
        return base.slice(0, 1).toUpperCase();
    }, [name, email]);

    useEffect(() => {
        let cancelled = false;
        if (!userId) return;

        const load = async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", userId)
                    .maybeSingle();

                if (!data) {
                    const fallbackHandle = (email.split("@")[0] || `user_${userId.slice(0, 8)}`)
                        .replace(/[^A-Za-z0-9_]/g, "_")
                        .slice(0, 30);
                    const fallbackName = email ? email.split("@")[0] : "New user";
                    const { data: created } = await supabase
                        .from("profiles")
                        .insert({ user_id: userId, handle: fallbackHandle, name: fallbackName })
                        .select("*")
                        .single();
                    if (cancelled) return;
                    setHandle(created?.handle ?? "");
                    setName(created?.name ?? "");
                    setBio(created?.bio ?? "");
                    setAvatarUrl(created?.avatar_url ?? null);
                    setBannerUrl(created?.banner_url ?? null);
                } else {
                    if (cancelled) return;
                    setHandle(data.handle ?? "");
                    setName(data.name ?? "");
                    setBio(data.bio ?? "");
                    setAvatarUrl(data.avatar_url ?? null);
                    setBannerUrl(data.banner_url ?? null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [userId, email]);

    if (initializing) return null;
    if (!session) {
        return <Redirect href="/login" />;
    }

    const pickImage = async (type: "avatar" | "banner") => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"] as any,
            base64: true,
            quality: 0.6,
            allowsEditing: true,
            aspect: type === "banner" ? [3, 1] : [1, 1],
        });
        if (result.canceled) return;
        const asset = result.assets?.[0];
        const base64 = asset?.base64 ?? null;
        const mime = asset?.mimeType ?? "image/jpeg";
        if (!base64) return;
        const dataUrl = `data:${mime};base64,${base64}`;
        if (type === "avatar") setAvatarUri(dataUrl);
        else setBannerUri(dataUrl);
    };

    const handleSave = async () => {
        if (!userId) return;

        setSaving(true);
        try {
            let nextAvatarUrl = avatarUrl;
            let nextBannerUrl = bannerUrl;

            if (avatarUri) {
                nextAvatarUrl = avatarUri;
            }
            if (bannerUri) {
                nextBannerUrl = bannerUri;
            }

            await supabase
                .from("profiles")
                .update({
                    handle: handle.trim(),
                    name: name.trim(),
                    bio: bio.trim(),
                    avatar_url: nextAvatarUrl,
                    banner_url: nextBannerUrl,
                })
                .eq("user_id", userId);

            setAvatarUrl(nextAvatarUrl);
            setBannerUrl(nextBannerUrl);
            setAvatarUri(null);
            setBannerUri(null);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: "Profile" }} />
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 24 }}>
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Your profile</CardTitle>
                        <CardDescription>Update your profile info and images.</CardDescription>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View className="gap-3">
                            <View className="overflow-hidden rounded-xl border border-border bg-muted">
                                {bannerUri || bannerUrl ? (
                                    <Image
                                        source={{ uri: bannerUri ?? bannerUrl ?? undefined }}
                                        className="h-24 w-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="h-24 w-full bg-muted" />
                                )}
                            </View>

                            <View className="-mt-10 flex-row items-end justify-between">
                                <View className="h-20 w-20 overflow-hidden rounded-full border-4 border-background bg-muted items-center justify-center">
                                    {avatarUri || avatarUrl ? (
                                        <Image
                                            source={{ uri: avatarUri ?? avatarUrl ?? undefined }}
                                            className="h-full w-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Text className="text-2xl font-bold text-muted-foreground">{initials}</Text>
                                    )}
                                </View>
                                <View className="flex-row gap-2">
                                    <Button variant="outline" onPress={() => pickImage("avatar")}>
                                        <View className="flex-row items-center gap-2">
                                            <Icon as={ImageIcon} className="size-4 text-foreground" />
                                            <Text>Avatar</Text>
                                        </View>
                                    </Button>
                                    <Button variant="outline" onPress={() => pickImage("banner")}>
                                        <View className="flex-row items-center gap-2">
                                            <Icon as={ImagePlusIcon} className="size-4 text-foreground" />
                                            <Text>Banner</Text>
                                        </View>
                                    </Button>
                                </View>
                            </View>
                        </View>

                        <View className="gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChangeText={setName} placeholder="Your name" />
                        </View>
                        <View className="gap-2">
                            <Label htmlFor="handle">Handle</Label>
                            <Input
                                id="handle"
                                value={handle}
                                onChangeText={setHandle}
                                autoCapitalize="none"
                                placeholder="your_handle"
                            />
                        </View>
                        <View className="gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Input
                                id="bio"
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Write something about yourself..."
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                className="h-24"
                            />
                        </View>

                        {loading ? <Text className="text-muted-foreground">Loading...</Text> : null}

                        <Button onPress={handleSave} disabled={saving || loading}>
                            <View className="flex-row items-center gap-2">
                                <Icon as={SaveIcon} className="size-4 text-white" />
                                <Text>{saving ? "Saving..." : "Save changes"}</Text>
                            </View>
                        </Button>

                        <View className="flex-row gap-2">
                            <Button
                                variant="destructive"
                                onPress={async () => {
                                    await logout();
                                    router.replace("/login");
                                }}>
                                <Text>Log out</Text>
                            </Button>
                        </View>
                    </CardContent>
                </Card>

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Sample API token</CardTitle>
                        <CardDescription>Used for the class Sample APIs feed (not your Supabase account).</CardDescription>
                    </CardHeader>
                    <CardContent className="gap-3">
                        <Text className="text-muted-foreground">
                            {token ? "Token is saved on this device." : "No token saved yet."}
                        </Text>
                        <Button variant="ghost" onPress={clearToken}>
                            <Text>Reset token</Text>
                        </Button>
                    </CardContent>
                </Card>
            </ScrollView>
        </>
    );
};

export default ProfileScreen;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useTwitter } from "@/context/TwitterContext";
import { Redirect, Stack } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import { Image, Platform, ScrollView, View } from "react-native";
import { CameraIcon, ImagePlusIcon } from "lucide-react-native";

const CreateTweetScreen = () => {
    const { publishTweet, token } = useTwitter();
    const [, requestCameraPermission] = useCameraPermissions();
    const [, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();

    const cameraRef = useRef<CameraView>(null);

    const [text, setText] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    useEffect(() => {
        Notifications.requestPermissionsAsync().catch(() => {});
        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.DEFAULT,
            }).catch(() => {});
        }
    }, []);

    const pickImage = async () => {
        const permission = await requestMediaPermission();
        if (!permission?.granted) {
            const retry = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!retry.granted) return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"] as any,
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0]?.uri ?? null);
        }
    };

    const openCamera = async () => {
        const permission = await requestCameraPermission();
        if (!permission?.granted) {
            const retry = await requestCameraPermission();
            if (!retry?.granted) return;
        }
        setShowCamera(true);
    };

    const takePhoto = async () => {
        if (!cameraRef.current) return;
        const photo = await cameraRef.current.takePictureAsync();
        setImageUri(photo.uri);
        setShowCamera(false);
    };

    const handlePublish = async () => {
        if (!text.trim()) return;

        setSending(true);
        await publishTweet({ text, image: imageUri });
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Tweet sent",
                body: "Your post is live in the feed.",
                sound: true,
            },
            trigger:
                Platform.OS === "android"
                    ? {
                          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                          channelId: "default",
                          seconds: 1,
                          repeats: false,
                      }
                    : { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1, repeats: false },
        }).catch(() => {});
        setText("");
        setImageUri(null);
        setSending(false);
    };

    if (!token) {
        return <Redirect href="/" />;
    }

    return (
        <>
            <Stack.Screen options={{ title: "Tweet" }} />
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 32, gap: 12 }}>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Create a tweet</CardTitle>
                        <CardDescription>Share an update and attach a photo if you want.</CardDescription>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View className="gap-2">
                            <Label htmlFor="tweet">What’s happening?</Label>
                            <Input
                                id="tweet"
                                value={text}
                                onChangeText={setText}
                                placeholder="Share something with your followers..."
                                className="h-32"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View className="flex-row gap-2">
                            <Button variant="outline" onPress={pickImage} className="flex-1">
                                <Icon as={ImagePlusIcon} className="size-4 text-foreground" />
                                <Text>Add photo</Text>
                            </Button>
                            <Button variant="outline" onPress={openCamera} className="flex-1">
                                <Icon as={CameraIcon} className="size-4 text-foreground" />
                                <Text>Camera</Text>
                            </Button>
                            {imageUri ? (
                                <Button variant="ghost" onPress={() => setImageUri(null)}>
                                    <Text>Remove</Text>
                                </Button>
                            ) : null}
                        </View>

                        {showCamera ? (
                            <View className="h-72 overflow-hidden rounded-lg border border-border">
                                <CameraView ref={cameraRef} className="flex-1" facing="back" />
                                <View className="flex-row justify-between bg-background/80 p-2">
                                    <Button onPress={() => setShowCamera(false)} variant="ghost">
                                        <Text>Close</Text>
                                    </Button>
                                    <Button onPress={takePhoto}>
                                        <Text>Take photo</Text>
                                    </Button>
                                </View>
                            </View>
                        ) : null}

                        {imageUri ? (
                            <View className="overflow-hidden rounded-lg border border-border">
                                <Image source={{ uri: imageUri }} className="h-64 w-full" resizeMode="cover" />
                            </View>
                        ) : null}
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button className="w-full" onPress={handlePublish} disabled={sending}>
                            <Text>{sending ? "Posting..." : "Post tweet"}</Text>
                        </Button>
                    </CardFooter>
                </Card>
            </ScrollView>
        </>
    );
};

export default CreateTweetScreen;

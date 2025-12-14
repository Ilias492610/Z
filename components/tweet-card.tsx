import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Profile, Tweet } from '@/types';
import { HeartIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, View } from 'react-native';

const formatDateTime = (value?: string) => {
  if (!value) return 'now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

type Props = {
  tweet: Tweet;
  profile?: Profile | null;
  onPressProfile?: () => void;
};

export function TweetCard({ tweet, profile, onPressProfile }: Props) {
  const likes = typeof tweet.likes === 'number' ? tweet.likes : 0;
  const author = profile?.name || tweet.author || 'Unknown user';
  const handle = profile?.handle || tweet.handle || 'user';
  const avatar = profile?.avatar || tweet.avatar;

  return (
    <Card className="bg-white/90 dark:bg-zinc-900/70 border border-border">
      <CardHeader className="flex-row gap-3 pb-2">
        <Pressable className="flex-row flex-1 gap-3 items-center" onPress={onPressProfile}>
          {avatar ? (
            <Image source={{ uri: avatar }} className="h-10 w-10 rounded-full bg-muted" />
          ) : (
            <View className="h-10 w-10 rounded-full bg-muted" />
          )}
          <View className="flex-1">
            <CardTitle className="text-base">{author}</CardTitle>
            <Text className="text-muted-foreground">@{handle}</Text>
          </View>
        </Pressable>
        <Text className="text-xs text-muted-foreground ml-2">{formatDateTime(tweet.createdAt)}</Text>
      </CardHeader>
      <CardContent className="gap-3">
        <Text className="text-base text-foreground">{tweet.text}</Text>
        {tweet.image ? (
          <View className="overflow-hidden rounded-lg border border-border">
            <Image source={{ uri: tweet.image }} className="h-56 w-full" resizeMode="cover" />
          </View>
        ) : null}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">{likes} likes</Text>
          <View className="flex-row items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              accessibilityLabel="Like"
              onPress={() => {}}>
              <Icon as={ThumbsUpIcon} className="size-4 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              accessibilityLabel="Dislike"
              onPress={() => {}}>
              <Icon as={ThumbsDownIcon} className="size-4 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              accessibilityLabel="Favorite"
              onPress={() => {}}>
              <Icon as={HeartIcon} className="size-4 text-muted-foreground" />
            </Button>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

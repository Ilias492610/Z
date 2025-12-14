import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';

type SortOption = 'newest' | 'oldest' | 'most_liked';

interface FeedControlsProps {
  query: string;
  sort: SortOption;
  onChangeQuery: (value: string) => void;
  onSubmitSearch: () => void;
  onChangeSort: (value: SortOption) => void;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most liked', value: 'most_liked' },
];

export function FeedControls({ query, sort, onChangeQuery, onSubmitSearch, onChangeSort }: FeedControlsProps) {
  return (
    <View className="w-full gap-3">
      <View className="flex-row items-center gap-2">
        <Input
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search tweets..."
          className="flex-1"
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={onSubmitSearch}
        />
        <Button onPress={onSubmitSearch} className="px-3">
          <Text>Search</Text>
        </Button>
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        <Text className="text-sm text-muted-foreground">Sort by:</Text>
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={option.value === sort ? 'default' : 'outline'}
            onPress={() => onChangeSort(option.value)}>
            <Text>{option.label}</Text>
          </Button>
        ))}
      </View>
    </View>
  );
}

export type { SortOption };

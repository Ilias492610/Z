import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ pageCount, currentPage, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <View className="flex-row flex-wrap items-center justify-center gap-2">
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
        <Button
          key={page}
          size="sm"
          variant={page === currentPage ? 'default' : 'outline'}
          onPress={() => onChange(page)}>
          <Text>{page}</Text>
        </Button>
      ))}
    </View>
  );
}

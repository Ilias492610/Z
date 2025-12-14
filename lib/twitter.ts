import { CreateTweetInput, Profile, Tweet } from '@/types';

const API_ROOT = 'https://sampleapis.assimilate.be';
const TWITTER_BASE = `${API_ROOT}/twitter`;

export const DEFAULT_EMAIL = 's145651@ap.be';

const buildHeaders = (token?: string, extra?: Record<string, string>) => {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const normalizeTweet = (item: any, index: number): Tweet => {
  const createdAt = item?.createdAt ?? item?.created_at ?? item?.date ?? item?.time ?? undefined;
  const likes =
    typeof item?.likes === 'number'
      ? item.likes
      : typeof item?.favorites === 'number'
        ? item.favorites
        : Math.floor(Math.random() * 100);

  return {
    id: Number(item?.id ?? index),
    author: item?.author ?? item?.user ?? item?.username ?? item?.name ?? 'Unknown user',
    handle: item?.handle ?? item?.username ?? `user${item?.id ?? index}`,
    text: item?.text ?? item?.tweet ?? item?.message ?? '',
    avatar: item?.avatar ?? item?.profileImage ?? item?.image,
    image: item?.image ?? item?.media ?? item?.photo,
    createdAt: createdAt ? String(createdAt) : undefined,
    likes,
  };
};

const normalizeProfile = (item: any, index: number): Profile => {
  return {
    id: Number(item?.id ?? index),
    name: item?.name ?? item?.fullName ?? item?.username ?? 'Unknown user',
    handle: item?.handle ?? item?.username ?? `user${item?.id ?? index}`,
    bio: item?.bio ?? item?.description ?? '',
    avatar: item?.avatar ?? item?.avatarUrl ?? item?.photo ?? item?.image,
    banner: item?.banner ?? item?.bannerUrl ?? item?.cover,
    location: item?.location ?? item?.city ?? item?.country ?? '',
    followers: typeof item?.followers === 'number' ? item.followers : undefined,
    following: typeof item?.following === 'number' ? item.following : undefined,
  };
};

export async function fetchTokenForEmail(email: string): Promise<string> {
  const trimmedEmail = email.trim();
  const response = await fetch(`${API_ROOT}/token?email=${encodeURIComponent(trimmedEmail)}`);

  if (!response.ok) return '';

  const text = await response.text();
  let payload: any;

  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  const token =
    typeof payload === 'string'
      ? payload
      : payload?.token ?? payload?.access_token ?? payload?.key ?? payload?.bearer;

  return token ?? '';
}

export async function fetchTweets(token?: string): Promise<Tweet[]> {
  const response = await fetch(`${TWITTER_BASE}/tweets`, {
    headers: buildHeaders(token, { Accept: 'application/json' }),
  });

  if (!response.ok) return [];

  const payload = await response.json().catch(() => []);
  if (!Array.isArray(payload)) return [];

  return payload.map(normalizeTweet);
}

export async function postTweet(token: string, input: CreateTweetInput): Promise<void> {
  const body = {
    text: input.text,
    image: input.image,
    author: input.author,
    handle: input.handle,
    avatar: input.avatar,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const response = await fetch(`${TWITTER_BASE}/tweets`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });

  if (!response.ok) return;
}

export async function fetchProfiles(token?: string): Promise<Profile[]> {
  const response = await fetch(`${TWITTER_BASE}/profiles`, {
    headers: buildHeaders(token, { Accept: 'application/json' }),
  });

  if (!response.ok) return [];

  const payload = await response.json().catch(() => []);
  if (!Array.isArray(payload)) return [];

  return payload.map(normalizeProfile);
}

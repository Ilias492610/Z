export type Tweet = {
  id: number;
  author: string;
  handle: string;
  text: string;
  avatar?: string;
  image?: string;
  createdAt?: string;
  likes?: number;
};

export type CreateTweetInput = {
  text: string;
  image?: string | null;
  author?: string;
  handle?: string;
  avatar?: string;
};

export type Profile = {
  id: number;
  name: string;
  handle: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  location?: string;
  followers?: number;
  following?: number;
};

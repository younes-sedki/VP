// Tweet type definition (twitter-clone inspired)
export interface Tweet {
  id: string;
  text: string;
  images?: string[] | null;
  parent?: {
    id: string;
    username: string;
  } | null;
  likes: string[]; // userId array
  createdBy: string; // userId
  createdAt: string; // ISO string
  updatedAt?: string | null;
  replies: string[]; // reply ids
  retweets: string[]; // userId array
  comments?: Comment[];
}

export interface TweetWithUser extends Tweet {
  user: User;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  verified?: boolean;
  photoURL?: string;
}

export interface Comment {
  id: string;
  author: string;
  handle: string;
  content: string;
  created_at: string;
  avatar?: string;
}

export interface AuthUser {
  email: string;
  name: string;
}

// News types
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  author?: string;
  publishedAt: string;
  imageUrl?: string;
  tags?: string[];
  category: 'webdev' | 'ai' | 'tech' | 'general';
}
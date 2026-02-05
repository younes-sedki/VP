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

// ─── Newsletter Types ────────────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: number;
  email: string;
  is_active: boolean;
  confirmed_at: string | null;
  unsubscribe_token: string;
  created_at: string;
  updated_at: string;
}

export interface SubscribeRequest {
  email: string;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface UnsubscribeRequest {
  token: string;
  email: string;
}

export interface UnsubscribeResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface EmailMessage {
  sender: string;
  sender_name: string;
  recipient: string;
  subject: string;
  html_body: string;
  text_body: string;
}
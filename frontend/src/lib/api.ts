import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
});

export type FeedPost = {
  id: string;
  caption: string | null;
  user: {
    username: string;
  };
  media: Array<{
    id: string;
    type: "image" | "video";
    url: string;
  }>;
  likes: Array<{ id: string }>;
  comments: Array<{ id: string }>;
};

export async function fetchFeed(): Promise<FeedPost[]> {
  const response = await apiClient.get<FeedPost[]>("/feed");
  return response.data;
}

export async function fetchProfile(username: string) {
  const response = await apiClient.get(`/profiles/${username}`);
  return response.data;
}

export async function fetchProfilePosts(username: string) {
  const response = await apiClient.get(`/profiles/${username}/posts`);
  return response.data;
}

export async function fetchProfileAlbums(username: string) {
  const response = await apiClient.get(`/profiles/${username}/albums`);
  return response.data;
}

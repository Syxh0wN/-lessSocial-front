import axios from "axios";
import {
  BuildMockProfileAlbumsData,
  BuildMockProfileData,
  BuildMockProfilePostsData,
  MockFeedData,
} from "./mockData";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
});

const UseMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

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
  if (UseMockData) {
    return MockFeedData;
  }
  try {
    const response = await apiClient.get<FeedPost[]>("/feed");
    return response.data;
  } catch {
    return MockFeedData;
  }
}

export async function fetchProfile(username: string) {
  if (UseMockData) {
    return BuildMockProfileData(username);
  }
  try {
    const response = await apiClient.get(`/profiles/${username}`);
    return response.data;
  } catch {
    return BuildMockProfileData(username);
  }
}

export async function fetchProfilePosts(username: string) {
  if (UseMockData) {
    return BuildMockProfilePostsData(username);
  }
  try {
    const response = await apiClient.get(`/profiles/${username}/posts`);
    return response.data;
  } catch {
    return BuildMockProfilePostsData(username);
  }
}

export async function fetchProfileAlbums(username: string) {
  if (UseMockData) {
    return BuildMockProfileAlbumsData(username);
  }
  try {
    const response = await apiClient.get(`/profiles/${username}/albums`);
    return response.data;
  } catch {
    return BuildMockProfileAlbumsData(username);
  }
}

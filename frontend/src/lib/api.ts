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
    name?: string;
    bio?: string;
    avatarUrl?: string;
    profile?: {
      name?: string;
      bio?: string;
      avatarUrl?: string;
    };
  };
  media: Array<{
    id: string;
    type: "image" | "video";
    url: string;
  }>;
  likes: Array<{ id: string }>;
  comments: Array<{ id: string }>;
};

export type PostDetail = {
  id: string;
  caption: string | null;
  createdAt: string;
  user: {
    username: string;
    profile?: {
      name?: string;
      bio?: string;
      avatarUrl?: string;
    };
  };
  media: Array<{
    id: string;
    type: "image" | "video";
    url: string;
  }>;
  likes: Array<{
    id: string;
    user: {
      username: string;
    };
  }>;
  comments: Array<{
    id: string;
    content: string;
    user: {
      username: string;
      profile?: {
        avatarUrl?: string;
      };
    };
    replies: Array<{
      id: string;
      content: string;
      user: {
        username: string;
      };
    }>;
  }>;
};

export async function fetchFeed(accessToken?: string): Promise<FeedPost[]> {
  if (UseMockData) {
    return MockFeedData;
  }
  try {
    const response = await apiClient.get<FeedPost[]>("/feed", {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
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

export async function fetchPostById(
  postId: string,
  accessToken?: string,
): Promise<PostDetail | null> {
  if (UseMockData) {
    const mockPost = MockFeedData.find((post) => post.id === postId) ?? MockFeedData[0];
    return {
      id: mockPost.id,
      caption: mockPost.caption,
      createdAt: new Date().toISOString(),
      user: {
        username: mockPost.user.username,
        profile: {
          name: mockPost.user.name ?? mockPost.user.username,
          bio: mockPost.user.bio ?? "Perfil de demonstracao",
          avatarUrl: mockPost.user.avatarUrl,
        },
      },
      media: mockPost.media,
      likes: mockPost.likes.map((likeItem) => ({
        id: likeItem.id,
        user: {
          username: likeItem.id === "like_1" ? "maria" : likeItem.id === "like_2" ? "joao" : "carol",
        },
      })),
      comments: [
        {
          id: "mock_comment_1",
          content: "Muito bom esse post",
          user: {
            username: "amigo1",
          },
          replies: [
            {
              id: "mock_reply_1",
              content: "Concordo",
              user: {
                username: "amigo2",
              },
            },
          ],
        },
      ],
    };
  }
  try {
    const response = await apiClient.get<PostDetail>(`/posts/${postId}`, {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    return response.data;
  } catch {
    return null;
  }
}

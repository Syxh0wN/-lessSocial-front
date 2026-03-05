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

export type FeedPageResponse = {
  items: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ProfileResponse = {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  xUrl?: string;
  twitchUrl?: string;
  kickUrl?: string;
  user: {
    id: string;
    username: string;
  };
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
  const firstPage = await fetchFeedPage(undefined, 10, accessToken);
  return firstPage.items;
}

export async function fetchFeedPage(
  cursor?: string,
  limit = 10,
  accessToken?: string,
): Promise<FeedPageResponse> {
  if (UseMockData) {
    return buildMockFeedPage(cursor, limit);
  }
  try {
    const response = await apiClient.get<FeedPageResponse>("/feed", {
      params: {
        cursor,
        limit,
      },
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    return response.data;
  } catch {
    return buildMockFeedPage(cursor, limit);
  }
}

export function buildMockFeedPage(cursor?: string, limit = 10): FeedPageResponse {
  const safeLimit = Math.min(Math.max(limit, 1), 20);
  const startIndex = Number.parseInt(cursor ?? "0", 10);
  const safeStartIndex = Number.isNaN(startIndex) ? 0 : Math.max(startIndex, 0);
  const endIndex = safeStartIndex + safeLimit;
  const items = MockFeedData.slice(safeStartIndex, endIndex);
  const hasMore = endIndex < MockFeedData.length;
  const nextCursor = hasMore ? String(endIndex) : null;
  return {
    items,
    nextCursor,
    hasMore,
  };
}

export async function fetchProfile(username: string): Promise<ProfileResponse> {
  if (UseMockData) {
    return BuildMockProfileData(username);
  }
  try {
    const response = await apiClient.get<ProfileResponse>(`/profiles/${username}`);
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

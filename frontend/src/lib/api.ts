import axios from "axios";
import {
  BuildMockProfileAlbumsData,
  BuildMockProfileData,
  BuildMockProfilePostsData,
  BuildMockTestimonialsData,
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
      instagramUrl?: string;
      facebookUrl?: string;
      youtubeUrl?: string;
      xUrl?: string;
      twitchUrl?: string;
      kickUrl?: string;
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

export type NotificationItem = {
  id: string;
  type: "postLike" | "postComment" | "friendRequest" | "testimonial";
  createdAt: string;
  actorUsername: string;
  message: string;
  targetId?: string;
};

export type NotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

export type TestimonialResponse = {
  id: string;
  content: string;
  createdAt: string;
  fromUser: {
    username: string;
    profile?: {
      name?: string;
      avatarUrl?: string;
    };
  };
};

export type TestimonialPageResponse = {
  items: TestimonialResponse[];
  hasMore: boolean;
  nextCursor: string | null;
  totalCount: number;
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
    const feedUser = MockFeedData.find(
      (postItem) => postItem.user.username === username,
    )?.user;
    if (feedUser) {
      return {
        id: `profile_${username}`,
        userId: `user_${username}`,
        name: feedUser.name ?? username,
        bio: feedUser.bio ?? "Perfil de demonstracao para ambiente sem deploy.",
        avatarUrl: feedUser.avatarUrl,
        instagramUrl: feedUser.profile?.instagramUrl,
        facebookUrl: feedUser.profile?.facebookUrl,
        youtubeUrl: feedUser.profile?.youtubeUrl,
        xUrl: feedUser.profile?.xUrl,
        twitchUrl: feedUser.profile?.twitchUrl,
        kickUrl: feedUser.profile?.kickUrl,
        user: {
          id: `user_${username}`,
          username,
        },
      };
    }
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
    const postsFromFeed = MockFeedData.filter(
      (postItem) => postItem.user.username === username,
    ).map((postItem) => ({
      id: postItem.id,
      caption: postItem.caption,
      media: postItem.media,
      likes: postItem.likes,
      comments: postItem.comments,
    }));
    if (postsFromFeed.length > 0) {
      return postsFromFeed;
    }
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

export async function fetchProfileTestimonials(
  username: string,
): Promise<TestimonialResponse[]> {
  const firstPage = await fetchProfileTestimonialsPage(username, undefined, 8);
  return firstPage.items;
}

export async function fetchProfileTestimonialsPage(
  username: string,
  cursor?: string,
  limit = 8,
): Promise<TestimonialPageResponse> {
  if (UseMockData) {
    const mockItems = BuildMockTestimonialsData(username);
    const safeLimit = Math.min(Math.max(limit, 1), 20);
    const startIndex = Number.parseInt(cursor ?? "0", 10);
    const safeStartIndex = Number.isNaN(startIndex) ? 0 : Math.max(startIndex, 0);
    const endIndex = safeStartIndex + safeLimit;
    const items = mockItems.slice(safeStartIndex, endIndex);
    const hasMore = endIndex < mockItems.length;
    return {
      items,
      hasMore,
      nextCursor: hasMore ? String(endIndex) : null,
      totalCount: mockItems.length,
    };
  }
  try {
    const response = await apiClient.get<TestimonialPageResponse>(
      `/profiles/${username}/testimonials`,
      {
        params: {
          cursor,
          limit,
        },
      },
    );
    return response.data;
  } catch {
    const mockItems = BuildMockTestimonialsData(username);
    return {
      items: mockItems.slice(0, limit),
      hasMore: mockItems.length > limit,
      nextCursor: mockItems.length > limit ? String(limit) : null,
      totalCount: mockItems.length,
    };
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

export async function fetchNotifications(
  accessToken?: string,
): Promise<NotificationsResponse> {
  if (UseMockData) {
    return {
      unreadCount: 3,
      items: [
        {
          id: "mock_notification_1",
          type: "postLike",
          createdAt: new Date().toISOString(),
          actorUsername: "mariaDev",
          message: "curtiu sua postagem",
          targetId: "post_1",
        },
        {
          id: "mock_notification_2",
          type: "postComment",
          createdAt: new Date().toISOString(),
          actorUsername: "joaoTech",
          message: "comentou na sua postagem",
          targetId: "post_1",
        },
        {
          id: "mock_notification_3",
          type: "testimonial",
          createdAt: new Date().toISOString(),
          actorUsername: "carolSys",
          message: "enviou um depoimento para voce",
        },
      ],
    };
  }
  try {
    const response = await apiClient.get<NotificationsResponse>("/notifications", {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    return response.data;
  } catch {
    return {
      unreadCount: 0,
      items: [],
    };
  }
}

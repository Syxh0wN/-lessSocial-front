import axios from "axios";
import {
  BuildMockProfileAlbumsData,
  BuildMockProfileData,
  BuildMockProfilePostsData,
  BuildMockTestimonialsData,
  MockFeedData,
} from "./mockData";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/ls",
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
  type: "postLike" | "postComment" | "friendRequest" | "testimonial" | "mention";
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
  isPrivate: boolean;
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
  followersCount?: number;
  followingCount?: number;
  followers?: Array<{
    username: string;
    name: string;
    avatarUrl?: string | null;
  }>;
  following?: Array<{
    username: string;
    name: string;
    avatarUrl?: string | null;
  }>;
  recentVisitors?: Array<{
    username: string;
    avatarUrl?: string | null;
    visitedAt: string;
  }>;
};

export type ProfilePreviewResponse = {
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string | null;
};

export type ProfileSearchItem = {
  userId?: string;
  username: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export type ProfileSuggestionItem = {
  userId: string;
  username: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export type PostDetail = {
  id: string;
  caption: string | null;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
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
      profile?: {
        name?: string;
        avatarUrl?: string;
        bio?: string;
      };
    };
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      username: string;
      profile?: {
        avatarUrl?: string;
      };
    };
    replies: Array<{
      id: string;
      content: string;
      createdAt: string;
      updatedAt: string;
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

export async function fetchHashtagPosts(
  tag: string,
  accessToken?: string,
): Promise<FeedPost[]> {
  if (UseMockData) {
    const safeTag = tag.trim().toLowerCase();
    return MockFeedData.filter((postItem) =>
      (postItem.caption ?? "").toLowerCase().includes(`#${safeTag}`),
    );
  }
  try {
    const response = await apiClient.get<FeedPost[]>(`/hashtags/${encodeURIComponent(tag)}/posts`, {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    return response.data;
  } catch {
    return [];
  }
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
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
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

export async function fetchProfile(
  username: string,
  accessToken?: string,
): Promise<ProfileResponse> {
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
        isPrivate: false,
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
        recentVisitors: [
          {
            username: "mariaDev",
            avatarUrl:
              "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=300&auto=format&fit=crop",
            visitedAt: new Date().toISOString(),
          },
          {
            username: "joaoTech",
            avatarUrl:
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
            visitedAt: new Date().toISOString(),
          },
          {
            username: "carolSys",
            avatarUrl:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
            visitedAt: new Date().toISOString(),
          },
          {
            username: "anaDevOps",
            avatarUrl:
              "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop",
            visitedAt: new Date().toISOString(),
          },
        ],
      };
    }
    return BuildMockProfileData(username);
  }
  try {
    const response = await apiClient.get<ProfileResponse>(`/profiles/${username}`, {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    return response.data;
  } catch {
    throw new Error("fetch profile failed");
  }
}

export async function fetchProfilePreview(
  username: string,
): Promise<ProfilePreviewResponse | null> {
  if (UseMockData) {
    const feedUser = MockFeedData.find((postItem) => postItem.user.username === username)?.user;
    if (!feedUser) {
      return null;
    }
    return {
      username,
      name: feedUser.name ?? username,
      bio: feedUser.bio ?? "Perfil de demonstracao para ambiente sem deploy.",
      avatarUrl: feedUser.avatarUrl ?? null,
    };
  }
  try {
    const response = await apiClient.get<ProfileResponse>(`/profiles/${username}`);
    return {
      username: response.data.user.username,
      name: response.data.name,
      bio: response.data.bio,
      avatarUrl: response.data.avatarUrl ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchProfileSearch(query: string): Promise<ProfileSearchItem[]> {
  const safeQuery = query.trim().toLowerCase();
  if (!safeQuery) {
    return [];
  }
  if (UseMockData) {
    const uniqueUsers = new Map<string, ProfileSearchItem>();
    for (const postItem of MockFeedData) {
      if (!uniqueUsers.has(postItem.user.username)) {
        uniqueUsers.set(postItem.user.username, {
          username: postItem.user.username,
          name: postItem.user.name ?? postItem.user.username,
          bio: postItem.user.bio ?? null,
          avatarUrl: postItem.user.avatarUrl ?? null,
        });
      }
    }
    return [...uniqueUsers.values()]
      .filter(
        (userItem) =>
          userItem.username.toLowerCase().includes(safeQuery) ||
          userItem.name.toLowerCase().includes(safeQuery),
      )
      .slice(0, 8);
  }
  try {
    const response = await apiClient.get<ProfileSearchItem[]>("/profiles/search", {
      params: {
        query: safeQuery,
      },
    });
    return response.data;
  } catch {
    return [];
  }
}

export async function fetchProfileSuggestions(limit = 8): Promise<ProfileSuggestionItem[]> {
  const response = await fetch(`/api/profile-suggestions?limit=${encodeURIComponent(String(limit))}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as ProfileSuggestionItem[];
}

export async function fetchProfilePosts(username: string, accessToken?: string) {
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
    const response = await apiClient.get(`/profiles/${username}/posts`, {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    return response.data;
  } catch {
    return [];
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
    return [];
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
    return {
      items: [],
      hasMore: false,
      nextCursor: null,
      totalCount: 0,
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
      updatedAt: new Date().toISOString(),
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
          profile: {
            name: likeItem.id === "like_1" ? "Maria" : likeItem.id === "like_2" ? "Joao" : "Carol",
            avatarUrl:
              likeItem.id === "like_1"
                ? "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=300&auto=format&fit=crop"
                : likeItem.id === "like_2"
                  ? "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"
                  : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
            bio: "Curtiu essa publicacao",
          },
        },
      })),
      likesCount: mockPost.likes.length,
      viewerHasLiked: false,
      comments: [
        {
          id: "mock_comment_1",
          content: "Muito bom esse post",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            username: "amigo1",
          },
          replies: [
            {
              id: "mock_reply_1",
              content: "Concordo",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
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
        {
          id: "mock_notification_4",
          type: "mention",
          createdAt: new Date().toISOString(),
          actorUsername: "anaDevOps",
          message: "mencionou voce em uma publicacao",
          targetId: "post_1",
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

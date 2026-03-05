import type { FeedPost } from "./api";

export type ProfileData = {
  id: string;
  userId: string;
  name: string;
  bio: string;
  avatarUrl: string;
  user: {
    id: string;
    username: string;
  };
};

export type ProfilePostData = {
  id: string;
  caption: string | null;
  media: Array<{
    id: string;
    type: "image" | "video";
    url: string;
  }>;
  likes: Array<{ id: string }>;
  comments: Array<{ id: string }>;
};

export type AlbumData = {
  id: string;
  name: string;
  items: Array<{
    id: string;
    mediaUrl: string;
    mediaType: "image" | "video";
  }>;
};

const BaseUsername = "eusouleo";

export const MockFeedData: FeedPost[] = [
  {
    id: "post_1",
    caption: "Primeiro post de teste para o portfolio",
    user: { username: BaseUsername },
    media: [
      {
        id: "media_1",
        type: "image",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    likes: [{ id: "like_1" }, { id: "like_2" }, { id: "like_3" }],
    comments: [{ id: "comment_1" }, { id: "comment_2" }],
  },
  {
    id: "post_2",
    caption: "MockData ativo sem deploy do backend",
    user: { username: "devuser" },
    media: [
      {
        id: "media_2",
        type: "image",
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    likes: [{ id: "like_4" }],
    comments: [{ id: "comment_3" }],
  },
];

export function BuildMockProfileData(username: string): ProfileData {
  return {
    id: `profile_${username}`,
    userId: `user_${username}`,
    name: username === BaseUsername ? "Leo" : "Usuario Demo",
    bio: "Perfil de demonstracao para ambiente sem deploy.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    user: {
      id: `user_${username}`,
      username,
    },
  };
}

export function BuildMockProfilePostsData(username: string): ProfilePostData[] {
  return [
    {
      id: `profile_post_1_${username}`,
      caption: `Post de ${username}`,
      media: [
        {
          id: `profile_media_1_${username}`,
          type: "image",
          url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
        },
      ],
      likes: [{ id: "like_profile_1" }, { id: "like_profile_2" }],
      comments: [{ id: "comment_profile_1" }],
    },
  ];
}

export function BuildMockProfileAlbumsData(username: string): AlbumData[] {
  return [
    {
      id: `album_1_${username}`,
      name: "AlbumPrincipal",
      items: [
        {
          id: `album_item_1_${username}`,
          mediaUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
          mediaType: "image",
        },
      ],
    },
  ];
}

import type { FeedPost } from "./api";

export type ProfileData = {
  id: string;
  userId: string;
  name: string;
  bio: string;
  avatarUrl: string;
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

export type TestimonialData = {
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

const BaseUsername = "eusouleo";

export const MockFeedData: FeedPost[] = [
  {
    id: "post_1",
    caption: "Primeiro post de teste para o portfolio",
    user: {
      username: BaseUsername,
      name: "Leo",
      bio: "Criador do LessSocial",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    },
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
    user: {
      username: "devuser",
      name: "Dev User",
      bio: "Perfil de teste para preview no feed",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop",
    },
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
  {
    id: "post_3",
    caption: "Treino de backend finalizado hoje",
    user: {
      username: "marinaCode",
      name: "Marina Code",
      bio: "API, testes e performance",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    },
    media: [
      {
        id: "media_3",
        type: "image",
        url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    likes: [{ id: "like_5" }, { id: "like_6" }],
    comments: [{ id: "comment_4" }, { id: "comment_5" }],
  },
  {
    id: "post_4",
    caption: "Novo setup para stream e pair programming",
    user: {
      username: "gabrielLive",
      name: "Gabriel Live",
      bio: "Coding e streaming diario",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    },
    media: [
      {
        id: "media_4",
        type: "image",
        url: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    likes: [{ id: "like_7" }],
    comments: [{ id: "comment_6" }],
  },
  {
    id: "post_5",
    caption: "Deploy da semana no ar",
    user: {
      username: "anaDevOps",
      name: "Ana DevOps",
      bio: "Cloud, CI e automacao",
      avatarUrl:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop",
    },
    media: [
      {
        id: "media_5",
        type: "image",
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    likes: [{ id: "like_8" }, { id: "like_9" }, { id: "like_10" }],
    comments: [{ id: "comment_7" }, { id: "comment_8" }],
  },
  {
    id: "post_6",
    caption: "Interface nova do app pronta para review",
    user: {
      username: "uxleo",
      name: "Leo UX",
      bio: "UI limpa e experiencia simples",
      avatarUrl:
        "https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=300&auto=format&fit=crop",
    },
    media: [
      {
        id: "media_6",
        type: "image",
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    likes: [{ id: "like_11" }, { id: "like_12" }],
    comments: [{ id: "comment_9" }],
  },
  {
    id: "post_7",
    caption: "Sessao de estudo de arquitetura hoje a noite",
    user: {
      username: "carolSys",
      name: "Carol Systems",
      bio: "Arquitetura e escalabilidade",
      avatarUrl:
        "https://images.unsplash.com/photo-1542204625-de293a05b0d3?q=80&w=300&auto=format&fit=crop",
    },
    media: [
      {
        id: "media_7",
        type: "image",
        url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    likes: [{ id: "like_13" }],
    comments: [{ id: "comment_10" }, { id: "comment_11" }],
  },
  {
    id: "post_8",
    caption: "Checklist de seguranca aplicado no projeto",
    user: {
      username: "secbruno",
      name: "Bruno Security",
      bio: "Seguranca de aplicacoes web",
      avatarUrl:
        "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=300&auto=format&fit=crop",
    },
    media: [
      {
        id: "media_8",
        type: "image",
        url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    likes: [{ id: "like_14" }, { id: "like_15" }, { id: "like_16" }],
    comments: [{ id: "comment_12" }],
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
    instagramUrl: "https://instagram.com/eusouleo",
    youtubeUrl: "https://youtube.com/@eusouleo",
    xUrl: "https://x.com/eusouleo",
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

export function BuildMockTestimonialsData(username: string): TestimonialData[] {
  return [
    {
      id: `testimonial_1_${username}`,
      content: "Pessoa dedicada, parceira e com entrega sempre organizada.",
      createdAt: new Date().toISOString(),
      fromUser: {
        username: "mariaDev",
        profile: {
          name: "Maria Dev",
          avatarUrl:
            "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=300&auto=format&fit=crop",
        },
      },
    },
    {
      id: `testimonial_2_${username}`,
      content: "Excelente comunicacao e muita qualidade tecnica no projeto.",
      createdAt: new Date().toISOString(),
      fromUser: {
        username: "joaoTech",
        profile: {
          name: "Joao Tech",
          avatarUrl:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
        },
      },
    },
  ];
}

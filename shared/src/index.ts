import { z } from "zod";

export const UsernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_-]+$/);

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(180).optional(),
  avatarUrl: z.string().url().optional(),
});

export const CreatePostSchema = z.object({
  caption: z.string().max(500).optional(),
  visibility: z.enum(["public", "friends", "private"]).default("public"),
  media: z
    .array(
      z.object({
        type: z.enum(["image", "video"]),
        url: z.string().url(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        duration: z.number().positive().optional(),
      }),
    )
    .min(1),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

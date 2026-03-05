import { z } from "zod";
export declare const UsernameSchema: z.ZodString;
export declare const UpdateProfileSchema: z.ZodObject<{
    name: z.ZodString;
    bio: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    bio?: string | undefined;
    avatarUrl?: string | undefined;
}, {
    name: string;
    bio?: string | undefined;
    avatarUrl?: string | undefined;
}>;
export declare const CreatePostSchema: z.ZodObject<{
    caption: z.ZodOptional<z.ZodString>;
    visibility: z.ZodDefault<z.ZodEnum<["public", "friends", "private"]>>;
    media: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["image", "video"]>;
        url: z.ZodString;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "image" | "video";
        url: string;
        width?: number | undefined;
        height?: number | undefined;
        duration?: number | undefined;
    }, {
        type: "image" | "video";
        url: string;
        width?: number | undefined;
        height?: number | undefined;
        duration?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    visibility: "public" | "friends" | "private";
    media: {
        type: "image" | "video";
        url: string;
        width?: number | undefined;
        height?: number | undefined;
        duration?: number | undefined;
    }[];
    caption?: string | undefined;
}, {
    media: {
        type: "image" | "video";
        url: string;
        width?: number | undefined;
        height?: number | undefined;
        duration?: number | undefined;
    }[];
    caption?: string | undefined;
    visibility?: "public" | "friends" | "private" | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

function ResolveExtensionFromMime(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }
  if (mimeType === "image/jpeg") {
    return "jpg";
  }
  if (mimeType === "image/webp") {
    return "webp";
  }
  if (mimeType === "image/gif") {
    return "gif";
  }
  if (mimeType === "video/mp4") {
    return "mp4";
  }
  if (mimeType === "video/webm") {
    return "webm";
  }
  if (mimeType === "video/ogg") {
    return "ogv";
  }
  return "";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const fileItem = formData.get("file");
  if (!(fileItem instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  const mimeType = fileItem.type || "";
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "unsupported media type" }, { status: 400 });
  }
  const extension = ResolveExtensionFromMime(mimeType);
  if (!extension) {
    return NextResponse.json({ error: "unsupported file extension" }, { status: 400 });
  }
  const fileBuffer = Buffer.from(await fileItem.arrayBuffer());
  const uploadsDirectoryPath = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDirectoryPath, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  const savedFilePath = path.join(uploadsDirectoryPath, fileName);
  await writeFile(savedFilePath, fileBuffer);
  const requestUrl = new URL(request.url);
  const publicUrl = `${requestUrl.origin}/uploads/${fileName}`;
  return NextResponse.json({
    url: publicUrl,
    type: isImage ? "image" : "video",
  });
}

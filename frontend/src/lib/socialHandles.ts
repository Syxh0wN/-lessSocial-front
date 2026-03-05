function ExtractHandle(value?: string) {
  if (!value) {
    return "";
  }
  const safeValue = value.trim();
  if (!safeValue) {
    return "";
  }
  if (safeValue.startsWith("@")) {
    return safeValue;
  }
  if (safeValue.startsWith("http://") || safeValue.startsWith("https://")) {
    try {
      const parsedUrl = new URL(safeValue);
      const pathPart = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? "";
      if (!pathPart) {
        return "";
      }
      return `@${pathPart}`;
    } catch {
      return "";
    }
  }
  return `@${safeValue.replace(/^@+/, "")}`;
}

export function NormalizeSocialHandle(value?: string) {
  const handle = ExtractHandle(value).replace(/[^@a-z0-9._-]/gi, "");
  if (!/^@[a-z0-9._-]{1,30}$/i.test(handle)) {
    return "";
  }
  return handle;
}

export function SocialHandleToUrl(platform: string, value?: string) {
  const handle = NormalizeSocialHandle(value);
  if (!handle) {
    return "";
  }
  const normalized = handle.slice(1);
  if (platform === "instagram") {
    return `https://instagram.com/${normalized}`;
  }
  if (platform === "facebook") {
    return `https://facebook.com/${normalized}`;
  }
  if (platform === "youtube") {
    return `https://youtube.com/@${normalized}`;
  }
  if (platform === "x") {
    return `https://x.com/${normalized}`;
  }
  if (platform === "twitch") {
    return `https://twitch.tv/${normalized}`;
  }
  if (platform === "kick") {
    return `https://kick.com/${normalized}`;
  }
  return "";
}

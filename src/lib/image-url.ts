export function normalizeImageUrl(url: string | null | undefined) {
  if (!url) return "";

  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1200`;
  }

  const driveOpenMatch = url.match(/[?&]id=([^&]+)/);
  if (url.includes("drive.google.com") && driveOpenMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${driveOpenMatch[1]}&sz=w1200`;
  }

  return url;
}

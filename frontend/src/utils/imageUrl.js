/**
 * Safely resolves signature and image paths to absolute URLs
 * Handles base64 data URLs, full HTTP(S) URLs, and relative upload paths
 */
export const getSignatureImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return null;
  }

  const trimmed = path.trim();

  // If already a base64 data URL from canvas
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // If already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Clean relative path (ensure single leading slash)
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // Get backend host from env or default to port 5000
  const envApiUrl = import.meta.env.VITE_API_URL;
  let backendOrigin = 'http://localhost:5000';

  if (envApiUrl && envApiUrl.startsWith('http')) {
    try {
      const url = new URL(envApiUrl);
      backendOrigin = url.origin;
    } catch {
      backendOrigin = 'http://localhost:5000';
    }
  }

  return `${backendOrigin}${cleanPath}`;
};

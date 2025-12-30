// Default images for different types of content
export const DEFAULT_IMAGES = {
  tournament: '/images/tournaments/default-tournament.jpg',
  post: '/android-chrome-192x192.png',
  avatar: '/android-chrome-192x192.png',
  game: '/images/games/default-game.jpg',
} as const

/**
 * Get a valid image URL or return a default image
 * @param url The image URL to validate
 * @param type The type of content (tournament, post, avatar, game)
 * @returns A valid image URL
 */
export const getValidImageUrl = (
  url: string | null | undefined,
  type: keyof typeof DEFAULT_IMAGES = 'post'
): string => {
  if (!url || url.trim() === '') {
    return DEFAULT_IMAGES[type]
  }

  // Check if URL is valid
  try {
    const urlObj = new URL(url)
    // Check if it's a relative URL
    if (url.startsWith('/')) {
      return url
    }
    // Check if it's a valid HTTP(S) URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return DEFAULT_IMAGES[type]
    }
    return url
  } catch {
    // If URL is invalid or relative without starting slash, return default image
    return DEFAULT_IMAGES[type]
  }
}

/**
 * Check if an image URL is from an allowed domain
 * @param url The image URL to check
 * @returns boolean
 */
export const isAllowedImageDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    const allowedDomains = [
      'efootballhub.net',
      'api.dicebear.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'unsplash.com'
    ]
    return allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`))
  } catch {
    return false
  }
} 
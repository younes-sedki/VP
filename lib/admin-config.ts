/**
 * Admin configuration
 * Store admin settings here (profile picture, name, etc.)
 */

export const ADMIN_CONFIG = {
  name: 'Younes SEDKI',
  handle: '@younes_dev',
  profilePicture: '/icon.png', // Admin profile picture path
  avatar: 'admin',
}

/**
 * Check if a user is admin
 */
export function isAdmin(userName: string): boolean {
  return userName === ADMIN_CONFIG.name || userName.toLowerCase() === ADMIN_CONFIG.name.toLowerCase()
}

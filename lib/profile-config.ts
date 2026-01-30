/**
 * Profile information configuration
 */

export interface ProfileInfo {
  fullName: string
  role: string
  age: number
  profilePicture: string
  linkedin?: string
  github?: string
  website?: string
  bio?: string
}

export const ADMIN_PROFILE: ProfileInfo = {
  fullName: 'Younes SEDKI',
  role: 'Full Stack Developer',
  age: 20, // Update with your actual age
  profilePicture: '/apple-touch-icon.png', // or your profile picture path
  linkedin: 'https://www.linkedin.com/in/younes-sedki', // Update with your LinkedIn
  github: 'https://github.com/younes-sedki', // Update with your GitHub
  website: 'https://www.sedkiy.dev',
  bio: 'Building in public and sharing the process. Full stack developer passionate about DevOps, modern web technologies, and creating impactful solutions.',
}

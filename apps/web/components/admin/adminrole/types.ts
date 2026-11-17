export interface AdminProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  location: string
  avatarUrl?: string
  role?: string
  bio?: string
  socials: { provider: 'Google' | 'Facebook' | 'X'; linked: boolean }[]
}

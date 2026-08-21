export interface AdminProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  location: string
  avatarUrl?: string
  socials: { provider: 'Google' | 'Facebook' | 'X'; linked: boolean }[]
}
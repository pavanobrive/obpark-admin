import localFont from 'next/font/local'
import { Michroma } from 'next/font/google'

export const michroma = Michroma({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-michroma',
  display: 'swap',
  preload: true,
})

export const microgrammaBold = localFont({
  src: '../public/fonts/microgramma-bold.otf',
  weight: '800',
  display: 'swap',
})
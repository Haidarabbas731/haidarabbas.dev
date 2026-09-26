import { Github, Linkedin, type LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import DiscordIcon from '@/components/icons/DiscordIcon'
import XIcon from '@/components/icons/XIcon'

export interface Social {
  label: string
  href: string
  Icon: LucideIcon | ComponentType<{ size?: number }>
  /** Brand colour the icon takes on hover; falls back to the foreground colour */
  hover?: string
}

export const socials: Social[] = [
  { label: 'GitHub', href: 'https://github.com/haidarabbas731', Icon: Github },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/haidarabbas-balospura/',
    Icon: Linkedin,
    hover: '#0A66C2',
  },
  { label: 'X', href: 'https://x.com/itz_hb_731', Icon: XIcon },
  {
    label: 'Discord',
    href: 'https://discord.com/users/782117153699659816',
    Icon: DiscordIcon,
    hover: '#5865F2',
  },
]

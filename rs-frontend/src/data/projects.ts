export interface LanguageShare {
  name: string
  color: string
  share: number
}

export interface Contributor {
  login: string
  avatarUrl: string
}

export interface Project {
  name: string
  owner: string
  ownerAvatarUrl?: string
  description: string
  category: string
  /** Raw GitHub topics; the recommendation model's strongest signal. */
  topics?: string[]
  stars: number
  forks: number
  watchers: number
  languages: LanguageShare[]
  contributors: Contributor[]
  contributorsCount: number
  url: string
  image?: string
  /** Ordered fallbacks from the README, best candidate first. */
  images?: string[]
}

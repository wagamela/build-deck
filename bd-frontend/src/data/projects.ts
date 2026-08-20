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
  stars: number
  forks: number
  watchers: number
  languages: LanguageShare[]
  contributors: Contributor[]
  contributorsCount: number
  url: string
  image?: string
}

export const fallbackProjects: Project[] = [
  {
    name: 'Nimbus',
    owner: 'mika-codes',
    ownerAvatarUrl: 'https://github.com/mika-codes.png?size=96',
    description:
      'Review and approve pull requests from your terminal before they ever merge.',
    category: 'Developer Tools',
    stars: 12800,
    forks: 984,
    watchers: 210,
    contributors: [
      { login: 'mika-codes', avatarUrl: 'https://github.com/mika-codes.png?size=96' },
      { login: 'rajdev-99', avatarUrl: 'https://github.com/rajdev-99.png?size=96' },
      { login: 'lenabuilds', avatarUrl: 'https://github.com/lenabuilds.png?size=96' },
    ],
    contributorsCount: 34,
    languages: [
      { name: 'TypeScript', color: '#3178c6', share: 58 },
      { name: 'JavaScript', color: '#f1e05a', share: 26 },
      { name: 'Shell', color: '#89e051', share: 16 },
    ],
    url: 'https://github.com/mika-codes/nimbus',
  },
  {
    name: 'Fermata',
    owner: 'elliotruns',
    ownerAvatarUrl: 'https://github.com/elliotruns.png?size=96',
    description:
      'A dead-simple music player that plays local files and looks beautiful doing it.',
    category: 'Productivity',
    stars: 6412,
    forks: 512,
    watchers: 95,
    contributors: [
      { login: 'elliotruns', avatarUrl: 'https://github.com/elliotruns.png?size=96' },
      { login: 'samoshka', avatarUrl: 'https://github.com/samoshka.png?size=96' },
      { login: 'yuki-koder', avatarUrl: 'https://github.com/yuki-koder.png?size=96' },
    ],
    contributorsCount: 19,
    languages: [
      { name: 'Rust', color: '#dea584', share: 82 },
      { name: 'TypeScript', color: '#3178c6', share: 14 },
      { name: 'HTML', color: '#e34c26', share: 4 },
    ],
    url: 'https://github.com/elliotruns/fermata',
  },
  {
    name: 'Herbivore',
    owner: 'shelbymai',
    ownerAvatarUrl: 'https://github.com/shelbymai.png?size=96',
    description:
      'Turn whatever is already in your pantry into a shopping list and a week of meals.',
    category: 'Lifestyle',
    stars: 8900,
    forks: 743,
    watchers: 160,
    contributors: [
      { login: 'shelbymai', avatarUrl: 'https://github.com/shelbymai.png?size=96' },
      { login: 'togunz', avatarUrl: 'https://github.com/togunz.png?size=96' },
      { login: 'vihaanpatel', avatarUrl: 'https://github.com/vihaanpatel.png?size=96' },
    ],
    contributorsCount: 27,
    languages: [
      { name: 'Python', color: '#3572a5', share: 76 },
      { name: 'JavaScript', color: '#f1e05a', share: 19 },
      { name: 'HTML', color: '#e34c26', share: 5 },
    ],
    url: 'https://github.com/shelbymai/herbivore',
  },
  {
    name: 'Kilo',
    owner: 'daniroder',
    ownerAvatarUrl: 'https://github.com/daniroder.png?size=96',
    description:
      'A habit tracker that puts real money on the line and donates your misses to charity.',
    category: 'Health & Fitness',
    stars: 21400,
    forks: 1902,
    watchers: 340,
    contributors: [
      { login: 'daniroder', avatarUrl: 'https://github.com/daniroder.png?size=96' },
      { login: 'kenn_os', avatarUrl: 'https://github.com/kenn_os.png?size=96' },
      { login: 'priyacodes', avatarUrl: 'https://github.com/priyacodes.png?size=96' },
    ],
    contributorsCount: 41,
    languages: [
      { name: 'TypeScript', color: '#3178c6', share: 64 },
      { name: 'Swift', color: '#f05138', share: 21 },
      { name: 'JavaScript', color: '#f1e05a', share: 15 },
    ],
    url: 'https://github.com/daniroder/kilo',
  },
  {
    name: 'Cove',
    owner: 'nadiapark',
    ownerAvatarUrl: 'https://github.com/nadiapark.png?size=96',
    description:
      'A real-time whiteboard that keeps remote teams in sync without the meeting.',
    category: 'Collaboration',
    stars: 15800,
    forks: 1331,
    watchers: 260,
    contributors: [
      { login: 'nadiapark', avatarUrl: 'https://github.com/nadiapark.png?size=96' },
      { login: 'gitron', avatarUrl: 'https://github.com/gitron.png?size=96' },
      { login: 'miranda-q', avatarUrl: 'https://github.com/miranda-q.png?size=96' },
    ],
    contributorsCount: 23,
    languages: [
      { name: 'TypeScript', color: '#3178c6', share: 71 },
      { name: 'CSS', color: '#563d7c', share: 17 },
      { name: 'JavaScript', color: '#f1e05a', share: 12 },
    ],
    url: 'https://github.com/nadiapark/cove',
  },
  {
    name: 'Moonpath',
    owner: 'kylefitz',
    ownerAvatarUrl: 'https://github.com/kylefitz.png?size=96',
    description:
      'Night-friendly public transit navigation that tells you when the next bus actually comes.',
    category: 'Mobility',
    stars: 4700,
    forks: 388,
    watchers: 70,
    contributors: [
      { login: 'kylefitz', avatarUrl: 'https://github.com/kylefitz.png?size=96' },
      { login: 'beto_dev', avatarUrl: 'https://github.com/beto_dev.png?size=96' },
      { login: 'hannalee', avatarUrl: 'https://github.com/hannalee.png?size=96' },
    ],
    contributorsCount: 15,
    languages: [
      { name: 'Dart', color: '#00b4ab', share: 52 },
      { name: 'Go', color: '#00add8', share: 33 },
      { name: 'TypeScript', color: '#3178c6', share: 15 },
    ],
    url: 'https://github.com/kylefitz/moonpath',
  },
  {
    name: 'Sprout',
    owner: 'monicareyes',
    ownerAvatarUrl: 'https://github.com/monicareyes.png?size=96',
    description:
      'Plan your garden, track planting windows, and get watering reminders that make sense.',
    category: 'Home & Garden',
    stars: 7300,
    forks: 590,
    watchers: 120,
    contributors: [
      { login: 'monicareyes', avatarUrl: 'https://github.com/monicareyes.png?size=96' },
      { login: 'faruk-7', avatarUrl: 'https://github.com/faruk-7.png?size=96' },
      { login: 'juliahsu', avatarUrl: 'https://github.com/juliahsu.png?size=96' },
    ],
    contributorsCount: 18,
    languages: [
      { name: 'Vue', color: '#41b883', share: 44 },
      { name: 'JavaScript', color: '#f1e05a', share: 31 },
      { name: 'TypeScript', color: '#3178c6', share: 25 },
    ],
    url: 'https://github.com/monicareyes/sprout',
  },
  {
    name: 'Echo',
    owner: 'tzunamii',
    ownerAvatarUrl: 'https://github.com/tzunamii.png?size=96',
    description:
      'Record voice notes that transcribe themselves and sort into topics automatically.',
    category: 'Productivity',
    stars: 9900,
    forks: 821,
    watchers: 175,
    contributors: [
      { login: 'tzunamii', avatarUrl: 'https://github.com/tzunamii.png?size=96' },
      { login: 'marcus-s', avatarUrl: 'https://github.com/marcus-s.png?size=96' },
      { login: 'anikagupta', avatarUrl: 'https://github.com/anikagupta.png?size=96' },
    ],
    contributorsCount: 12,
    languages: [
      { name: 'Swift', color: '#f05138', share: 68 },
      { name: 'Python', color: '#3572a5', share: 22 },
      { name: 'JavaScript', color: '#f1e05a', share: 10 },
    ],
    url: 'https://github.com/tzunamii/echo',
  },
]
export interface LanguageShare {
  name: string
  color: string
  share: number
}

export interface Project {
  name: string
  owner: string
  description: string
  category: string
  stars: number
  forks: number
  languages: LanguageShare[]
  url: string
  image?: string
}

export const fallbackProjects: Project[] = [
  {
    name: 'Nimbus',
    owner: 'mika-codes',
    description:
      'Review and approve pull requests from your terminal before they ever merge.',
    category: 'Developer Tools',
    stars: 12800,
    forks: 984,
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
    description:
      'A dead-simple music player that plays local files and looks beautiful doing it.',
    category: 'Productivity',
    stars: 6412,
    forks: 512,
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
    description:
      'Turn whatever is already in your pantry into a shopping list and a week of meals.',
    category: 'Lifestyle',
    stars: 8900,
    forks: 743,
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
    description:
      'A habit tracker that puts real money on the line and donates your misses to charity.',
    category: 'Health & Fitness',
    stars: 21400,
    forks: 1902,
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
    description:
      'A real-time whiteboard that keeps remote teams in sync without the meeting.',
    category: 'Collaboration',
    stars: 15800,
    forks: 1331,
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
    description:
      'Night-friendly public transit navigation that tells you when the next bus actually comes.',
    category: 'Mobility',
    stars: 4700,
    forks: 388,
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
    description:
      'Plan your garden, track planting windows, and get watering reminders that make sense.',
    category: 'Home & Garden',
    stars: 7300,
    forks: 590,
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
    description:
      'Record voice notes that transcribe themselves and sort into topics automatically.',
    category: 'Productivity',
    stars: 9900,
    forks: 821,
    languages: [
      { name: 'Swift', color: '#f05138', share: 68 },
      { name: 'Python', color: '#3572a5', share: 22 },
      { name: 'JavaScript', color: '#f1e05a', share: 10 },
    ],
    url: 'https://github.com/tzunamii/echo',
  },
]
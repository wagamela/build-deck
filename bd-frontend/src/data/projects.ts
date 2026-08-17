export interface Project {
  name: string
  description: string
  category: string
  technologies: string[]
  image: string
}

export const projects: Project[] = [
  {
    name: 'Nimbus',
    description: 'Review and approve pull requests from your terminal before they ever merge.',
    category: 'Developer Tools',
    technologies: ['TypeScript', 'Node.js', 'React'],
    image: '☁️',
  },
  {
    name: 'Fermata',
    description: 'A dead-simple music player that plays local files and looks beautiful doing it.',
    category: 'Productivity',
    technologies: ['Rust', 'Tauri', 'Web Audio'],
    image: '🎵',
  },
  {
    name: 'Herbivore',
    description: 'Turn whatever is already in your pantry into a shopping list and a week of meals.',
    category: 'Lifestyle',
    technologies: ['Python', 'Django', 'PostgreSQL'],
    image: '🥗',
  },
  {
    name: 'Kilo',
    description: 'A habit tracker that puts real money on the line and donates your misses to charity.',
    category: 'Health & Fitness',
    technologies: ['React Native', 'TypeScript', 'Firebase'],
    image: '⚡',
  },
  {
    name: 'Cove',
    description: 'A real-time whiteboard that keeps remote teams in sync without the meeting.',
    category: 'Collaboration',
    technologies: ['TypeScript', 'React', 'WebSockets'],
    image: '📝',
  },
  {
    name: 'Moonpath',
    description: 'Night-friendly public transit navigation that tells you when the next bus actually comes.',
    category: 'Mobility',
    technologies: ['Go', 'Flutter', 'GraphQL'],
    image: '🌙',
  },
  {
    name: 'Sprout',
    description: 'Plan your garden, track planting windows, and get watering reminders that make sense.',
    category: 'Home & Garden',
    technologies: ['Vue', 'Supabase', 'Mapbox'],
    image: '🌱',
  },
  {
    name: 'Echo',
    description: 'Record voice notes that transcribe themselves and sort into topics automatically.',
    category: 'Productivity',
    technologies: ['Swift', 'Whisper', 'Core ML'],
    image: '🎙️',
  },
]
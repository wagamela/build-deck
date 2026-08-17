import type { Project } from '../data/projects'

const GRADIENTS = [
  'from-mint-light to-lavender-light',
  'from-lavender-light to-mint-light',
  'from-mint-pale to-lavender-light',
  'from-lavender to-mint-light',
]

function gradientFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

interface SwipeCardProps {
  project: Project
}

export default function SwipeCard({ project }: SwipeCardProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_60px_-16px_rgba(35,38,53,0.35)]">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFor(project.name)}`} />
        <span
          className="absolute inset-0 flex select-none items-center justify-center text-[6.5rem] drop-shadow-sm"
          aria-hidden="true"
        >
          {project.image}
        </span>
        <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink backdrop-blur-sm">
          {project.category}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-6 pb-6 pt-4">
        <h2 className="text-2xl font-bold tracking-tight text-ink">{project.name}</h2>
        <p className="text-sm leading-relaxed text-ink/70">{project.description}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <span
              key={technology}
              className="rounded-full bg-lavender-light/50 px-3 py-1 text-xs font-medium text-ink/80"
            >
              {technology}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
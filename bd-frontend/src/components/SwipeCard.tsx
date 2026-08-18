import type { Project } from '../data/projects'

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

function ForkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
    </svg>
  )
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3.75 13a.75.75 0 0 1 0-1.5h7.5V4.06a.75.75 0 0 1 1.5 0v8a.75.75 0 0 1-.75.75h-8.25Zm0-8.97a.75.75 0 0 0 0 1.5h5.69L4.22 10.5a.75.75 0 1 0 1.06 1.06L10.5 6.81v5.69a.75.75 0 0 0 1.5 0V4.03a.75.75 0 0 0-.75-.75h-7.5Z" />
    </svg>
  )
}

function formatCount(count: number) {
  if (count >= 1000) {
    const rounded = (count / 1000).toFixed(1).replace(/\.0$/, '')
    return `${rounded}k`
  }
  return String(count)
}

const MARK_TINTS = ['#dffcd9', '#d8d5ed', '#f1ffe8', '#c7caeb', '#cef5d3', '#b3b6e3']

function tintFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return MARK_TINTS[Math.abs(hash) % MARK_TINTS.length]
}

function ProjectPreview({ project }: { project: Project }) {
  return (
    <div className="relative min-h-0 flex-1">
      {project.image ? (
        <img
          src={project.image}
          alt={`${project.name} screenshot`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backgroundColor: tintFor(project.name) }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgb(255 255 255 / 0.55) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.55) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <span className="font-display text-[2.75rem] font-semibold leading-none text-ink/60">
              {project.name.charAt(0)}
            </span>
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ink/45">
              {project.category}
            </span>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 flex h-1.5"
            role="img"
            aria-label={`Language mix: ${project.languages.map((language) => `${language.name} ${language.share}%`).join(', ')}`}
          >
            {project.languages.map((language) => (
              <span
                key={language.name}
                className="h-full"
                style={{ width: `${language.share}%`, backgroundColor: language.color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SwipeCardProps {
  project: Project
  position: number
  total: number
}

export default function SwipeCard({ project, position, total }: SwipeCardProps) {
  const titleSize =
    project.name.length >= 9
      ? 'text-[2.2rem]'
      : project.name.length >= 7
        ? 'text-[2.6rem]'
        : 'text-[3rem]'

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-ink/[0.07] bg-paper shadow-deck">
      <div className="flex min-h-0 flex-1 flex-col px-7 pb-5 pt-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink/60">
            <GitHubMark className="h-3.5 w-3.5 text-ink/70" />
            {project.category}
          </span>
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
            {String(position).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>

        <div className="mt-7">
          <p className="text-xs font-medium tracking-[0.14em] text-ink/60">by {project.owner}</p>
          <h2
            className={`mt-1.5 font-display text-ink ${titleSize}`}
            style={{ fontWeight: 650, lineHeight: 1.02, letterSpacing: '-0.02em', textWrap: 'balance' }}
          >
            {project.name}
          </h2>
        </div>

        <div className="mt-6 flex min-h-24 flex-1 flex-col overflow-hidden rounded-[0.9rem] border border-ink/[0.09] bg-white">
          <ProjectPreview project={project} />
        </div>

        <div className="mt-5 flex items-center gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-[1.25rem] font-semibold text-ink">
              <StarIcon className="h-[1em] w-[1em] text-ink/65" />
              {formatCount(project.stars)}
            </p>
            <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink/60">
              Stars
            </p>
          </div>
          <span className="h-8 w-px bg-ink/10" aria-hidden="true" />
          <div>
            <p className="flex items-center gap-1.5 text-[1.25rem] font-semibold text-ink">
              <ForkIcon className="h-[1em] w-[1em] text-ink/65" />
              {formatCount(project.forks)}
            </p>
            <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink/60">
              Forks
            </p>
          </div>
        </div>

        <p className="mt-5 line-clamp-3 font-display text-[1.05rem] leading-[1.55] text-ink/75">
          {project.description}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {project.languages.map((language) => (
              <span
                key={language.name}
                className="flex items-center gap-1.5 text-xs font-medium text-ink/70"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: language.color }}
                  aria-hidden="true"
                />
                {language.name}
              </span>
            ))}
          </div>
          <div
            className="mt-3 flex h-1 w-full overflow-hidden rounded-full"
            role="img"
            aria-label={`Language mix: ${project.languages.map((language) => `${language.name} ${language.share}%`).join(', ')}`}
          >
            {project.languages.map((language) => (
              <span
                key={language.name}
                className="h-full"
                style={{ width: `${language.share}%`, backgroundColor: language.color }}
              />
            ))}
          </div>
        </div>
      </div>

      <a
        href={project.url}
        target="_blank"
        rel="noreferrer"
        className="group flex h-14 shrink-0 cursor-pointer items-center justify-between bg-ink px-7 text-mint-pale transition-colors duration-200 hover:bg-[#31354a] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-6px] focus-visible:outline-lavender-light"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold">
          <GitHubMark className="h-4 w-4" />
          View on GitHub
        </span>
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </article>
  )
}
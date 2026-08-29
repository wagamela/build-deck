import { ArrowUpRight, Eye, GitFork, Star } from "lucide-react";
import type { Project } from "../data/projects";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function formatCount(count: number) {
  if (count >= 1000) {
    const rounded = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${rounded}k`;
  }
  return String(count);
}

function ProjectPreview({
  project,
  imageLoaded,
}: {
  project: Project;
  imageLoaded: boolean;
}) {
  const showImage = project.image && imageLoaded;

  return (
    <div className="relative min-h-0 flex-1">
      {project.image && (
        <img
          src={project.image}
          alt={`${project.name} screenshot`}
          width={400}
          height={240}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 50vw"
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-300 ${
            showImage ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {(!project.image || !showImage) && (
        <div className="absolute inset-0 overflow-hidden bg-surface">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <span className="text-[2.5rem] font-semibold leading-none text-secondary/60">
              {project.name.charAt(0)}
            </span>
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted/70">
              {project.category}
            </span>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 flex h-1.5"
            role="img"
            aria-label={`Language mix: ${project.languages.map((language) => `${language.name} ${language.share}%`).join(", ")}`}
          >
            {project.languages.map((language) => (
              <span
                key={language.name}
                className="h-full"
                style={{
                  width: `${language.share}%`,
                  backgroundColor: language.color,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SwipeCardProps {
  project: Project;
  imageLoaded: boolean;
}

export default function SwipeCard({
  project,
  imageLoaded,
}: SwipeCardProps) {
  const contributors = project.contributors?.slice(0, 2) ?? [];
  const contributorsCount = project.contributorsCount ?? 0;
  const extraContributors = Math.max(0, contributorsCount - contributors.length);
  const showContributors = contributors.length > 0 || contributorsCount > 0;
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-neutral">
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            <GitHubMark className="h-3.5 w-3.5 text-muted" />
            {project.category}
          </span>
        </div>
        <div className="mt-1.5 sm:mt-3">
          <p className="flex items-center gap-2 text-xs font-medium text-muted">
            {project.ownerAvatarUrl && (
              <img
                src={project.ownerAvatarUrl}
                alt={`${project.owner} profile photo`}
                width="20"
                height="20"
                loading="lazy"
                className="h-5 w-5 rounded-full border border-line bg-surface"
              />
            )}
            <span>by {project.owner}</span>
          </p>
          <h2 className="mt-1 font-display text-[1.25rem] leading-tight text-text sm:text-[1.75rem]">
            {project.name}
          </h2>
        </div>

        <div className="mt-1.5 flex h-24 shrink-0 flex-col overflow-hidden rounded-md border border-line bg-surface sm:mt-3 sm:h-40">
          <ProjectPreview project={project} imageLoaded={imageLoaded} />
        </div>

        <div className="mt-1.5 flex items-center gap-3 sm:mt-3 sm:gap-5">
          <div>
            <p className="flex items-center gap-1.5 text-lg font-semibold text-text">
              <Star className="h-4 w-4 text-muted" />
              {formatCount(project.stars)}
            </p>
            <p className="mt-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted/60">
              Stars
            </p>
          </div>
          <span className="h-6 w-px bg-line" aria-hidden="true" />
          <div>
            <p className="flex items-center gap-1.5 text-lg font-semibold text-text">
              <GitFork className="h-4 w-4 text-muted" />
              {formatCount(project.forks)}
            </p>
            <p className="mt-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted/60">
              Forks
            </p>
          </div>
          <span className="h-6 w-px bg-line" aria-hidden="true" />
          <div>
            <p className="flex items-center gap-1.5 text-lg font-semibold text-text">
              <Eye className="h-4 w-4 text-muted" />
              {formatCount(project.watchers)}
            </p>
            <p className="mt-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted/60">
              Watchers
            </p>
          </div>
        </div>

        {showContributors && (
          <div className="mt-1.5 flex items-center gap-2.5 sm:mt-3">
            <div className="flex items-center">
              {contributors.map((contributor, index) => (
                <img
                  key={contributor.login}
                  src={contributor.avatarUrl}
                  alt={`${contributor.login} profile photo`}
                  width="24"
                  height="24"
                  loading="lazy"
                  className="h-6 w-6 rounded-full border-2 border-neutral bg-surface object-cover"
                  style={{ marginLeft: index === 0 ? 0 : -7 }}
                />
              ))}
              {extraContributors > 0 && (
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-neutral bg-surface font-mono text-[0.6rem] font-semibold text-muted"
                  style={{ marginLeft: -7 }}
                >
                  +{extraContributors}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-muted">
              {formatCount(contributorsCount)} contributors
            </span>
          </div>
        )}

        <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted sm:mt-2">
          {project.description}
        </p>

        <div className="mt-auto pt-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {project.languages.map((language) => (
              <span
                key={language.name}
                className="flex items-center gap-1.5 text-xs font-medium text-muted"
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
            className="mt-2 flex h-1 w-full overflow-hidden rounded-full bg-surface"
            role="img"
            aria-label={`Language mix: ${project.languages.map((language) => `${language.name} ${language.share}%`).join(", ")}`}
          >
            {project.languages.map((language) => (
              <span
                key={language.name}
                className="h-full"
                style={{
                  width: `${language.share}%`,
                  backgroundColor: language.color,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <a
        href={project.url}
        target="_blank"
        rel="noreferrer"
        className="group flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2.5 border-t border-line bg-primary text-sm font-medium text-white transition-colors duration-100 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-4px] focus-visible:outline-primary"
      >
        <GitHubMark className="h-4 w-4" />
        View on GitHub
        <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </article>
  );
}

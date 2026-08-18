import { useCallback, useEffect, useRef, useState } from "react";
import DiscoveryDeck, { type DeckControls } from "./components/DiscoveryDeck";
import { projects } from "./data/projects";

const BUILDDECK_REPO = "https://github.com/wagamela/build-deck";

function DeckMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="6.2"
        y="3"
        width="12.5"
        height="17"
        rx="3"
        fill="#6e79d6"
        opacity="0.9"
        transform="rotate(-8 6.2 3)"
      />
      <rect
        x="4.9"
        y="4.8"
        width="12.5"
        height="17"
        rx="3"
        fill="#5e6ad2"
        transform="rotate(5 4.9 4.8)"
      />
    </svg>
  );
}

function ArrowIcon({
  direction,
  className,
}: {
  direction: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {direction === "left" ? (
        <>
          <path d="M13 8H3" />
          <path d="m7 4-4 4 4 4" />
        </>
      ) : (
        <>
          <path d="M3 8h10" />
          <path d="m9 4 4 4-4 4" />
        </>
      )}
    </svg>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12 12 4" />
      <path d="M6 4h6v6" />
    </svg>
  );
}

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

function XMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v4.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452Z" />
    </svg>
  );
}

function SwipeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5.5 11.5 2 8l3.5-3.5" />
      <path d="M10.5 11.5 14 8l-3.5-3.5" />
      <path d="M2 8h12" />
    </svg>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="flex h-5 min-w-5 items-center justify-center rounded-full border border-line bg-surface px-1.5 font-mono text-[11px] leading-none text-muted">
      {children}
    </kbd>
  );
}

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <DeckMark className="h-9 w-9" />
      <div className="leading-none">
        <h1 className="font-display text-[1.4rem] text-text">
          Build<span className="font-medium italic">Deck</span>
        </h1>
        <p className="mt-1.5 text-xs text-muted">
          Discover what developers are building
        </p>
      </div>
    </div>
  );
}

interface HistoryEntry {
  id: number;
  index: number;
  name: string;
  direction: "left" | "right";
}

interface PastCardsProps {
  history: HistoryEntry[];
  onRevisit: (index: number) => void;
}

function PastCards({ history, onRevisit }: PastCardsProps) {
  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-line bg-neutral p-3">
      <div className="flex items-center justify-between px-2 pb-3 pt-1">
        <span className="eyebrow text-muted">Past cards</span>
        <span className="font-mono text-[0.7rem] text-muted/60">
          {String(history.length).padStart(2, "0")}
        </span>
      </div>
      {history.length === 0 ? (
        <p className="px-2 font-mono text-[0.7rem] leading-relaxed text-muted/60">
          Cards you swipe land here. Click one to flip it back.
        </p>
      ) : (
        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto pr-1">
          <ol className="flex flex-col gap-0.5">
            {[...history].reverse().map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onRevisit(entry.index)}
                  className="group flex h-9 w-full items-center gap-3 rounded-md px-3 text-left transition-colors duration-100 hover:bg-surface focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                >
                  <span className="font-mono text-[0.7rem] text-muted/60">
                    {String(entry.index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-[13px] font-medium text-text/70 transition-colors group-hover:text-text">
                    {entry.name}
                  </span>
                  <span
                    className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        entry.direction === "right" ? "#3dd68c" : "#eb5757",
                    }}
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function ProjectPanel() {
  return (
    <div className="flex w-full flex-col rounded-lg border border-line bg-neutral p-4">
      <span className="eyebrow text-muted">GitHub</span>
      <a
        href={BUILDDECK_REPO}
        target="_blank"
        rel="noreferrer"
        className="group mt-3 flex h-9 items-center justify-between gap-2 rounded-md border border-line bg-surface/40 px-3 transition-colors duration-100 hover:border-muted focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <span className="flex min-w-0 items-center gap-2">
          <GitHubMark className="h-4 w-4 shrink-0 text-muted" />
          <span className="truncate text-[13px] font-medium text-text">
            BuildDeck
          </span>
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted transition-colors duration-100 group-hover:text-text" />
      </a>

      <span className="eyebrow mt-4 border-t border-line pt-3 text-muted/60">
        Find me
      </span>
      <div className="mt-2 flex items-center gap-2">
        <a
          href="https://github.com/wagamela"
          target="_blank"
          rel="noreferrer"
          aria-label="My GitHub"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition-colors duration-100 hover:border-primary/60 hover:text-text focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          <GitHubMark className="h-4 w-4" />
        </a>
        <a
          href="https://x.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="My X"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition-colors duration-100 hover:border-primary/60 hover:text-text focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          <XMark className="h-4 w-4" />
        </a>
        <a
          href="https://www.linkedin.com/in/emir-akbulut-993564302/"
          target="_blank"
          rel="noreferrer"
          aria-label="My LinkedIn"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition-colors duration-100 hover:border-primary/60 hover:text-text focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          <LinkedInMark className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

interface ActionBarProps {
  onLike: () => void;
  onPass: () => void;
}

function ActionBar({ onLike, onPass }: ActionBarProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPass}
          className="flex h-9 items-center gap-2 rounded-md border border-line bg-transparent px-4 text-[13px] font-medium text-text transition-colors duration-100 hover:border-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97]"
        >
          <ArrowIcon direction="left" className="h-4 w-4 text-muted" />
          Pass
        </button>
        <button
          type="button"
          onClick={onLike}
          className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-white transition-colors duration-100 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97]"
        >
          Like
          <ArrowIcon direction="right" className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <SwipeIcon className="h-3.5 w-3.5" />
          swipe the card
        </span>
        <span className="h-3 w-px bg-line" aria-hidden="true" />
        <span className="flex items-center gap-1.5">
          <Kbd>←</Kbd> pass
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>→</Kbd> like
        </span>
      </div>
    </div>
  );
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const historyIdRef = useRef(0);
  const controlsRef = useRef<DeckControls | null>(null);

  const handleActiveChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleDecision = useCallback(
    (direction: "left" | "right") => {
      const project = projects[activeIndex];
      setHistory((current) => [
        ...current,
        {
          id: historyIdRef.current++,
          index: activeIndex,
          name: project.name,
          direction,
        },
      ]);
    },
    [activeIndex],
  );

  const handleRevisit = useCallback((index: number) => {
    setHistory((current) => current.filter((entry) => entry.index !== index));
    controlsRef.current?.jumpTo(index);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        controlsRef.current?.like();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        controlsRef.current?.skip();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const total = projects.length;

  return (
    <main className="app-bg flex h-dvh flex-col overflow-hidden text-text">
      <header className="flex items-center justify-between px-5 pt-6 sm:px-8 lg:px-10">
        <Wordmark />
        <span className="font-mono text-[0.75rem] text-muted">
          deck {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-5 px-5 pb-6 pt-2 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)_12rem] lg:gap-6 lg:px-10">
        <aside className="hidden h-[min(64vh,38rem)] lg:flex">
          <PastCards history={history} onRevisit={handleRevisit} />
        </aside>

        <section className="relative flex min-h-0 flex-col items-center justify-center gap-7">
          <DiscoveryDeck
            deck={projects}
            controlsRef={controlsRef}
            onDecision={handleDecision}
            onActiveChange={handleActiveChange}
          />
          <ActionBar
            onLike={() => controlsRef.current?.like()}
            onPass={() => controlsRef.current?.skip()}
          />
        </section>

        <aside className="hidden justify-self-end lg:flex">
          <ProjectPanel />
        </aside>
      </div>
    </main>
  );
}

export default App;
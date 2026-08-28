import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Link2,
  X,
} from "lucide-react";
import DiscoveryDeck, { type DeckControls } from "./components/DiscoveryDeck";
import NotFoundPage from "./components/NotFoundPage";
import { useProjects } from "./hooks/useProjects";
import type { Project } from "./data/projects";

const BUILDDECK_REPO = "https://github.com/wagamela/build-deck";
const KEYBOARD_COOLDOWN_MS = 500;

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

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="flex h-5 min-w-5 items-center justify-center rounded-full border border-line bg-surface px-1.5 font-mono text-[11px] leading-none text-muted">
      {children}
    </kbd>
  );
}

interface StepProps {
  icon: React.ReactNode;
  label: string;
  hint: string;
}

function Step({ icon, label, hint }: StepProps) {
  return (
    <li className="flex h-10 items-center gap-3 rounded-md border border-line bg-background/40 px-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-surface text-muted">
        {icon}
      </span>
      <span className="truncate text-[13px] font-medium text-text">
        {label}
      </span>
      <span className="ml-auto shrink-0 font-mono text-[11px] text-muted/60">
        {hint}
      </span>
    </li>
  );
}

interface IntroOverlayProps {
  onDismiss: () => void;
}

function IntroOverlay({ onDismiss }: IntroOverlayProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Getting started"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-[4px]"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-line bg-surface p-5"
        style={{ boxShadow: "0 24px 48px rgb(0 0 0 / 0.4)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow text-muted">Getting started</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close instructions"
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors duration-100 hover:bg-elevated hover:text-text focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <h2 className="mt-3 font-display text-xl text-text">
          Swipe to discover
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Flip through real projects like a deck of cards. Swipe to decide, or
          use A / D or the arrow keys.
        </p>

        <ol className="mt-4 space-y-2">
          <Step
            icon={<ArrowLeftRight className="h-3.5 w-3.5" />}
            label="Swipe the card"
            hint="A / ← pass · D / → like"
          />
          <Step
            icon={<ArrowLeft className="h-3.5 w-3.5" />}
            label="Revisit from sidebar"
            hint="past cards"
          />
          <Step
            icon={<ArrowUpRight className="h-3.5 w-3.5" />}
            label="Open on GitHub"
            hint="jump to repo"
          />
        </ol>

        <button
          type="button"
          onClick={onDismiss}
          autoFocus
          className="mt-5 flex h-9 w-full items-center justify-center rounded-md bg-primary text-[13px] font-medium text-white transition-colors duration-100 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Start swiping
        </button>
      </div>
    </div>
  );
}

function DebugButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 rounded-md border px-2.5 text-xs font-medium transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
        active
          ? "border-primary/60 bg-primary/10 text-text"
          : "border-line text-muted hover:border-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

interface DebugPanelProps {
  project: Project;
  activeIndex: number;
  history: HistoryEntry[];
  showIntro: boolean;
  outlines: boolean;
  onToggleOutlines: () => void;
  onShowIntro: () => void;
  onShowNotFound: () => void;
  onResetDeck: () => void;
  onClearHistory: () => void;
  onClose: () => void;
}

function DebugPanel({
  project,
  activeIndex,
  history,
  showIntro,
  outlines,
  onToggleOutlines,
  onShowIntro,
  onShowNotFound,
  onResetDeck,
  onClearHistory,
  onClose,
}: DebugPanelProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(project, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [project]);

  return (
    <aside
      role="dialog"
      aria-label="Debug mode"
      className="fixed bottom-4 right-4 z-40 flex max-h-[min(84vh,42rem)] w-[min(20rem,calc(100vw-2rem))] flex-col rounded-xl border border-line bg-surface shadow-modal"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="eyebrow text-muted">Debug mode</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close debug mode"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors duration-100 hover:bg-elevated hover:text-text focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto p-4">
        <h3 className="eyebrow text-muted/60">State</h3>
        <dl className="mt-2 space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted/60">position</dt>
            <dd className="text-text">{activeIndex}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted/60">intro shown</dt>
            <dd className="text-text">{showIntro ? "true" : "false"}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted/60">history</dt>
            <dd className="text-text">{history.length} entries</dd>
          </div>
        </dl>

        <h3 className="eyebrow mt-5 text-muted/60">History</h3>
        {history.length === 0 ? (
          <p className="mt-2 font-mono text-[11px] text-muted/60">empty</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-1">
            {[...history].reverse().map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-2 font-mono text-[11px] text-muted"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      entry.direction === "right" ? "#3dd68c" : "#eb5757",
                  }}
                  aria-hidden="true"
                />
                <span className="text-text/70">{entry.name}</span>
                <span className="ml-auto text-muted/60">{entry.direction}</span>
              </li>
            ))}
          </ol>
        )}

        <h3 className="eyebrow mt-5 text-muted/60">Active project</h3>
        <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-line bg-background/50 p-2.5 font-mono text-[10px] leading-relaxed text-text/70">
          {JSON.stringify(project, null, 2)}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line p-3">
        <DebugButton onClick={onResetDeck}>Reset deck</DebugButton>
        <DebugButton onClick={onClearHistory}>Clear history</DebugButton>
        <DebugButton onClick={onShowIntro}>Show intro</DebugButton>
        <DebugButton onClick={onShowNotFound}>Show 404</DebugButton>
        <DebugButton onClick={handleCopy}>
          {copied ? "Copied" : "Copy JSON"}
        </DebugButton>
        <DebugButton onClick={onToggleOutlines} active={outlines}>
          {outlines ? "Hide outlines" : "Show outlines"}
        </DebugButton>
      </div>
    </aside>
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
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPass}
          className="flex h-9 items-center gap-2 rounded-md border border-line bg-transparent px-4 text-[13px] font-medium text-text transition-colors duration-100 hover:border-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97]"
        >
          <ArrowLeft className="h-4 w-4 text-muted" />
          Pass
        </button>
        <button
          type="button"
          onClick={onLike}
          className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-white transition-colors duration-100 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97]"
        >
          Like
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="hidden h-8 items-center gap-3 rounded-full border border-line bg-surface px-4 text-xs text-muted sm:flex">
        <span className="flex items-center gap-1.5 font-medium">
          <ArrowLeftRight className="h-4 w-4" />
          swipe the card
        </span>
        <span className="h-3 w-px bg-line" aria-hidden="true" />
        <span className="flex items-center gap-1.5">
          <Kbd>A / ←</Kbd> pass
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>D / →</Kbd> like
        </span>
      </div>
    </div>
  );
}

function App() {
  const { projects, usingFallback, loadMore } = useProjects();
  if (window.location.pathname !== "/") return <NotFoundPage />;
  return (
    <Deck
      projects={projects}
      usingFallback={usingFallback}
      onRefill={loadMore}
    />
  );
}

function Deck({
  projects,
  usingFallback,
  onRefill,
}: {
  projects: Project[];
  usingFallback: boolean;
  onRefill: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showIntro, setShowIntro] = useState(
    () => !window.sessionStorage.getItem("bd-intro-seen"),
  );
  const [debugOpen, setDebugOpen] = useState(false);
  const [outlines, setOutlines] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const historyIdRef = useRef(0);
  const controlsRef = useRef<DeckControls | null>(null);
  const lastKeyActionRef = useRef(0);

  const dismissIntro = useCallback(() => {
    window.sessionStorage.setItem("bd-intro-seen", "1");
    setShowIntro(false);
  }, []);

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
    [activeIndex, projects],
  );

  const handleRevisit = useCallback((index: number) => {
    setHistory((current) => current.filter((entry) => entry.index !== index));
    controlsRef.current?.jumpTo(index);
  }, []);

  const handleResetDeck = useCallback(() => {
    controlsRef.current?.jumpTo(0);
    setHistory([]);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleShowIntro = useCallback(() => {
    window.sessionStorage.removeItem("bd-intro-seen");
    setShowIntro(true);
  }, []);

  const handleToggleOutlines = useCallback(() => {
    setOutlines((current) => !current);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "d"
      ) {
        event.preventDefault();
        setDebugOpen((open) => !open);
        return;
      }
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

      const key = event.key.toLowerCase();
      let action: (() => void) | null = null;
      if (event.key === "ArrowRight" || key === "d" || event.code === "KeyD") {
        event.preventDefault();
        action = () => controlsRef.current?.like();
      } else if (
        event.key === "ArrowLeft" ||
        key === "a" ||
        event.code === "KeyA"
      ) {
        event.preventDefault();
        action = () => controlsRef.current?.skip();
      }
      if (!action || event.repeat) return;

      const now = Date.now();
      if (now - lastKeyActionRef.current < KEYBOARD_COOLDOWN_MS) return;
      lastKeyActionRef.current = now;
      action();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main
      className={`app-bg flex h-dvh flex-col overflow-hidden text-text ${
        outlines ? "debug-outlines" : ""
      }`}
    >
      {usingFallback && (
        <div className="fixed left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 shadow-modal">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: "#f0c000" }}
            aria-hidden="true"
          />
          <p className="whitespace-nowrap text-xs text-muted">
            API unreachable — showing sample projects
          </p>
        </div>
      )}
      {showIntro && <IntroOverlay onDismiss={dismissIntro} />}
      {debugOpen && (
        <DebugPanel
          project={projects[activeIndex]}
          activeIndex={activeIndex}
          history={history}
          showIntro={showIntro}
          outlines={outlines}
          onToggleOutlines={handleToggleOutlines}
          onShowIntro={handleShowIntro}
          onShowNotFound={() => setShowNotFound((v) => !v)}
          onResetDeck={handleResetDeck}
          onClearHistory={handleClearHistory}
          onClose={() => setDebugOpen(false)}
        />
      )}
      {showNotFound ? (
        <NotFoundPage />
      ) : (
        <>
          <header className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5 lg:px-10">
        <Wordmark />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLeftPanelOpen(true)}
            aria-label="Open past cards"
            className="flex h-7 items-center gap-1.5 rounded-md border border-line px-2 text-[11px] font-medium text-muted transition-colors duration-100 hover:border-primary/60 hover:text-text lg:hidden"
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{String(history.length).padStart(2, "0")}</span>
          </button>
          <button
            type="button"
            onClick={() => setRightPanelOpen(true)}
            aria-label="Open project info"
            className="flex h-7 items-center gap-1.5 rounded-md border border-line px-2 text-[11px] font-medium text-muted transition-colors duration-100 hover:border-primary/60 hover:text-text lg:hidden"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDebugOpen((open) => !open)}
            aria-label={debugOpen ? "Close debug mode" : "Open debug mode"}
            className={`flex h-6 items-center rounded-full border border-line px-2 font-mono text-[10px] uppercase tracking-wider transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-primary ${
              debugOpen
                ? "border-primary/60 bg-primary/10 text-primary"
                : "text-muted hover:border-primary/60 hover:text-text"
            }`}
          >
            dev
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-4 px-4 pb-4 pt-2 sm:gap-5 sm:px-6 sm:pb-6 lg:grid-cols-[13rem_minmax(0,1fr)_12rem] lg:gap-6 lg:px-10">
        <aside className="hidden h-[min(64vh,38rem)] lg:flex">
          <PastCards history={history} onRevisit={handleRevisit} />
        </aside>

        <section className="relative flex min-h-0 flex-col items-center justify-center gap-7">
          <DiscoveryDeck
            deck={projects}
            controlsRef={controlsRef}
            onDecision={handleDecision}
            onActiveChange={handleActiveChange}
            onRefill={onRefill}
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
        </>
      )}

      {leftPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 animate-fade-in lg:hidden"
            onClick={() => setLeftPanelOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-40 flex w-[min(80vw,20rem)] animate-slide-in-left lg:hidden">
            <div className="flex h-full w-full flex-col border-r border-line bg-neutral p-3">
              <div className="flex items-center justify-between px-2 pb-3 pt-1">
                <span className="eyebrow text-muted">Past cards</span>
                <button
                  type="button"
                  onClick={() => setLeftPanelOpen(false)}
                  aria-label="Close past cards"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors duration-100 hover:bg-elevated hover:text-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <PastCards
                history={history}
                onRevisit={(index) => {
                  handleRevisit(index);
                  setLeftPanelOpen(false);
                }}
              />
            </div>
          </div>
        </>
      )}

      {rightPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 animate-fade-in lg:hidden"
            onClick={() => setRightPanelOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-40 flex w-[min(80vw,20rem)] animate-slide-in-right lg:hidden">
            <div className="flex h-full w-full flex-col border-l border-line bg-neutral p-3">
              <div className="flex items-center justify-between px-2 pb-3 pt-1">
                <span className="eyebrow text-muted">Project info</span>
                <button
                  type="button"
                  onClick={() => setRightPanelOpen(false)}
                  aria-label="Close project info"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors duration-100 hover:bg-elevated hover:text-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto sidebar-scroll">
                <ProjectPanel />
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default App;

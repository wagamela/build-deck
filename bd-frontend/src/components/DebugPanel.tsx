import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Project } from "../data/projects";

export interface HistoryEntry {
  id: number;
  index: number;
  name: string;
  direction: "left" | "right";
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

export default function DebugPanel({
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

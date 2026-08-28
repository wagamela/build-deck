import { useEffect } from "react";
import { ArrowLeft, ArrowLeftRight, ArrowUpRight, X } from "lucide-react";

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

export default function IntroOverlay({ onDismiss }: IntroOverlayProps) {
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

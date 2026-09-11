import { memo } from "react";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded bg-surface ${className ?? ""}`}
    />
  );
}

export default memo(function SkeletonCard() {
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-neutral">
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-center justify-between">
          <Shimmer className="h-3 w-24" />
        </div>
        <div className="mt-1.5 sm:mt-3">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="mt-1.5 h-6 w-40 sm:h-8 sm:w-56" />
        </div>

        <div className="mt-1.5 flex h-24 shrink-0 overflow-hidden rounded-md border border-line bg-surface sm:mt-3 sm:h-40">
          <Shimmer className="h-full w-full !rounded-none" />
        </div>

        <div className="mt-1.5 flex items-center gap-3 sm:mt-3 sm:gap-5">
          <div>
            <Shimmer className="h-5 w-16" />
            <Shimmer className="mt-1 h-2 w-10" />
          </div>
          <span className="h-6 w-px bg-line" aria-hidden="true" />
          <div>
            <Shimmer className="h-5 w-14" />
            <Shimmer className="mt-1 h-2 w-10" />
          </div>
          <span className="h-6 w-px bg-line" aria-hidden="true" />
          <div>
            <Shimmer className="h-5 w-16" />
            <Shimmer className="mt-1 h-2 w-14" />
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-2.5 sm:mt-3">
          <div className="flex items-center">
            <Shimmer className="h-6 w-6 !rounded-full" />
            <Shimmer className="-ml-1.5 h-6 w-6 !rounded-full" />
          </div>
          <Shimmer className="h-3 w-24" />
        </div>

        <div className="mt-1.5 space-y-1.5 sm:mt-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
        </div>

        <div className="mt-auto pt-2">
          <div className="flex gap-3">
            <Shimmer className="h-3 w-14" />
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-3 w-16" />
          </div>
          <Shimmer className="mt-2 h-1 w-full !rounded-full" />
        </div>
      </div>

      <div className="flex h-10 shrink-0 items-center justify-center border-t border-line bg-primary">
        <Shimmer className="h-3 w-28 !bg-primary/40" />
      </div>
    </article>
  );
});

import { ArrowLeft } from "lucide-react";

function NotFoundPage() {
  return (
    <main className="app-bg flex h-dvh flex-col items-center justify-center px-5 text-text">
      <div className="flex flex-col items-center gap-6 text-center">
        <span
          className="font-display text-[6rem] font-bold leading-none tracking-tighter text-primary/30 sm:text-[8rem] md:text-[10rem]"
          aria-hidden="true"
        >
          404
        </span>
        <p className="text-[13px] text-muted">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-white transition-colors duration-100 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </a>
      </div>
    </main>
  );
}

export default NotFoundPage;

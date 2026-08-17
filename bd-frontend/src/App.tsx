import DiscoveryDeck from './components/DiscoveryDeck'

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70 shadow-sm ring-1 ring-white/80">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="3" width="13" height="17" rx="3" fill="#C7CAEB" transform="rotate(-8 5 3)" />
          <rect x="4" y="5" width="13" height="17" rx="3" fill="#CEF5D3" transform="rotate(5 4 5)" />
        </svg>
      </div>
      <div className="leading-tight">
        <h1 className="font-display text-[1.7rem] font-bold tracking-tight text-ink">BuildDeck</h1>
        <p className="text-xs font-medium text-ink/55">Discover what developers are building</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <main className="app-bg flex h-dvh flex-col overflow-hidden text-ink">
      <header className="px-6 pt-6">
        <Wordmark />
      </header>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-2 pt-4">
        <DiscoveryDeck />
        <span className="pointer-events-none absolute top-1/2 left-[calc((100%_-_min(94vw,28.5rem))/4)] hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-ink/50 lg:block">
          Swipe left to skip
        </span>
        <span className="pointer-events-none absolute top-1/2 right-[calc((100%_-_min(94vw,28.5rem))/4)] hidden translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-ink/50 lg:block">
          Swipe right to like
        </span>
      </div>
    </main>
  )
}

export default App
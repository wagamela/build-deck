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
        <h1 className="text-[1.6rem] font-extrabold tracking-tight text-ink">BuildDeck</h1>
        <p className="text-xs font-medium text-ink/55">Discover what developers are building</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-gradient-to-br from-mint-pale via-mint-light to-lavender-light text-ink">
      <header className="px-6 pt-6">
        <Wordmark />
      </header>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-2 pt-4">
        <DiscoveryDeck />
      </div>
      <footer className="pb-5 pt-2 text-center text-xs font-medium text-ink/50">
        Swipe right to like · swipe left to skip
      </footer>
    </main>
  )
}

export default App
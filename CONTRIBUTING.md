# Contributing to BuildDeck

## Welcome

BuildDeck is a Tinder-style app for discovering real software projects. It pulls
popular GitHub repositories, turns them into swipeable cards, and lets you like
or skip your way through what other developers are building.

This project is maintained by **one developer**, so contributions are genuinely
valuable — not just for the code, but for the extra perspective, fresh ideas, and
time you bring. If you see something you'd like to improve, this document is
here to help you do it in a way that fits the project and is easy for a
solo maintainer to review.

## Ways to Contribute

You don't have to write code to make a difference. All of these are welcome:

- **Bug reports** — something breaks, loads slowly, or renders wrong.
- **Feature requests** — a new idea for how discovery should feel or work.
- **Documentation improvements** — clearer README, better setup instructions.
- **UI/UX improvements** — polish, motion, layout, accessibility.
- **Code contributions** — new features, fixes, refactors, optimizations.
- **Testing** — manually trying things out and reporting what you find.
- **Other useful contributions** — questions, discussions, design feedback, or
  pointing out something that's confusing about the project.

If you're unsure whether something is worth contributing, open an issue and ask
before investing time. That conversation is itself a helpful contribution.

## Before You Start

- **Check existing issues and pull requests.** Search before creating anything
  new. Someone may already be working on the same thing.
- **Open an issue before implementing bigger changes.** If a change touches
  architecture, the API, or adds a meaningful new feature, discuss it first.
  This avoids wasted work if the idea doesn't fit the project's direction.
- **Small fixes are fine to just send.** Typos, small bug fixes, and trivial
  improvements don't need an issue first — just keep them focused.

## Development Setup

BuildDeck is a monorepo with two independent packages:

```text
build-deck/
├── bd-frontend/   React + Vite + TypeScript + Tailwind CSS
└── bd-backend/    Node.js + Express API (ES modules)
```

Each package has its own `package.json` and can be developed separately. The
Vite dev server proxies `/api` requests to `http://localhost:3000`, so both
apps normally run together.

**Prerequisites:** a recent Node.js (20.19+ or a newer LTS) and npm.

### 1. Clone the repository

```sh
git clone https://github.com/wagamela/build-deck.git
cd build-deck
```

### 2. Frontend

```sh
cd bd-frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`. The dev server proxies API calls to
the backend automatically, so no environment setup is required for the
frontend. If the API is unreachable, the app falls back to sample projects and
shows a notice — useful for frontend-only work.

### 3. Backend

```sh
cd bd-backend
npm install
npm run dev
```

The API listens on `http://localhost:3000`.

Environment variables are read from `bd-backend/.env` (the file is gitignored
and never committed). None are required to run the server, but these are
supported:

```dotenv
# Optional. Raises GitHub API rate limits; without it the app still works.
GITHUB_TOKEN=your_github_personal_access_token

# Optional. Port the API listens on (default: 3000).
PORT=3000
```

To create the file, copy the example above into `bd-backend/.env`. Do not
commit a `.env` file or share your token.

### 4. Verify it works

With both running, `http://localhost:5173` should show a deck of real projects.
You can also check the API directly at `http://localhost:3000/api/projects`.

## Branching Strategy

Create a branch for your work and push it to your fork. Use a short, descriptive
name prefixed with the type of change:

```text
feature/...
fix/...
docs/...
refactor/...
```

Examples:

- `feature/project-filtering`
- `fix/duplicate-cards`
- `docs/setup-instructions`
- `refactor/swipe-animation`

Keep branches short-lived and based on the latest `main`. It makes merging
easier for a solo maintainer reviewing without a big team behind them.

## Commit Guidelines

Use a simple conventional commit style. Start each commit message with a short
type followed by a concise summary in lowercase:

```text
feat: add project filtering
fix: prevent duplicate project cards
docs: update setup instructions
refactor: extract card preview into a component
```

Common types: `feat` (new feature), `fix` (bug fix), `docs` (documentation),
`refactor` (no behavior change), `style` (formatting), `chore` (tooling, deps).

That's it. No strict commit rules beyond this — a clear message describing one
logical change is the whole requirement.

## Pull Request Guidelines

A good PR is one the maintainer can understand and trust quickly. Include:

- **A clear title and description.** What does the change do, and why? Link the
  related issue if there is one.
- **Screenshots or GIFs for UI changes.** Before/after images are especially
  helpful for a visual product like this one.
- **What you tested.** Which scenarios you ran, and whether you verified both
  the happy path and edge cases.
- **Focus.** Keep each PR about one thing. Small, focused PRs are much easier
  to review (and more likely to get merged) than large ones.
- **A note on how to test it**, if the change isn't obvious to a reviewer.

## Code Quality

The project has lightweight, practical standards — no heavy tooling is enforced
beyond what's already set up.

- **Linting.** The frontend is linted with **oxlint**:
  `npm run lint` in `bd-frontend`. Run it before pushing and fix any warnings.
  The backend has no linter configured.
- **TypeScript.** The frontend is strict-friendly (`noUnusedLocals`,
  `noUnusedParameters` are on). The build type-checks automatically via
  `npm run build` (`tsc -b && vite build`).
- **Formatting.** There is no enforced formatter. Match the style of the file
  you're editing (2-space indentation, quotes and semicolons matching the
  surrounding code, and existing patterns elsewhere in the file).
- **Component structure.** Follow the existing layout: components in
  `bd-frontend/src/components/`, hooks in `src/hooks/`, types and static data
  in `src/data/`. Reuse existing components and helpers instead of duplicating
  them.
- **Styling.** The UI uses Tailwind CSS with the project's semantic design
  tokens (`bg-surface`, `text-muted`, `border-line`, `bg-primary`, ...).
  Reuse existing tokens rather than inventing new colors.
- **Design guidelines.** Read `DESIGN.md` and `DESIGN_AVOIDS_GUIDELINE.md`
  before making UI changes. They define the design system and the visual
  patterns this project deliberately avoids. If your change would introduce a
  pattern from the avoid-list, there should be a clear product reason for it.
- **Backend.** The backend is plain ESM JavaScript with Express. Keep new code
  consistent with the existing structure (`src/services/`, `src/routes/`) and
  error-handling patterns.

If your change adds a dependency, mention why in the PR description.

## Testing

There is currently **no automated test suite** in this project. That means:

- **Test your changes manually.** Exercise the feature or fix in the running
  app before opening a PR.
- **State what you tested** in the PR description so the maintainer can repeat
  it (or at least know it was tried).
- **Check regressions.** If you changed card rendering, swipe behavior, or the
  API, make sure existing flows still work — the deck loads, cards swipe, the
  sidebar history updates, and the "View on GitHub" link opens the right repo.

If you'd like to introduce a test setup, that's a great idea — but open an issue
first so the approach can be agreed on before a large change lands.

## Issue Guidelines

**Reporting bugs.** A good bug report lets the maintainer reproduce the problem
without asking follow-up questions. Include:

- What you expected to happen and what actually happened.
- Steps to reproduce.
- Environment details (OS, browser, node version if relevant).
- Whether it happens consistently or intermittently.
- A screenshot or screen recording if it's visual.

**Requesting features.** Explain the problem you're trying to solve and why the
feature would help, rather than prescribing an exact implementation. This keeps
the discussion open and lets the maintainer decide how it best fits the
project's direction. It's fine for a request to stay small — not every idea
needs a full spec.

## Code Review

Every PR will be reviewed for:

- **Correctness** — does it actually solve the stated problem?
- **Maintainability** — will this be understandable a year from now?
- **Consistency** — does it fit the existing code and design conventions?
- **Accessibility** — keyboard support, focus states, contrast.
- **Performance** — nothing obviously wasteful or blocking.
- **User experience** — does it feel like BuildDeck, not a detached addition?

Requested changes are a normal part of collaboration, not a rejection. The
goal is a shared codebase that's pleasant for a single maintainer to keep up.
Expect a bit of back-and-forth; it's how the project improves.

## Contributor Expectations

- **Be respectful.** This is a solo project with real time behind it.
- **Explain your changes clearly.** If a reviewer asks a question, assume good
  faith and answer it directly.
- **Keep discussions constructive.** Disagreement about code is fine; keep it
  about the code.
- **Avoid unnecessary scope expansion.** Don't bundle unrelated refactors or
  features into a PR about something else.
- **Respect the project's existing architecture and design decisions.** The
  design guidelines exist for a reason; challenge them when you must, but with
  reasoning, not silently.

## Maintainer Notes

> This section is written for the maintainer (you), not for contributors. It
> stays in the file so future contributors see that reviews are intentional.

When you receive a PR, run through these questions before deciding:

- **Does it solve the stated problem?** Check the change against the issue or
  description it claims to address.
- **Does it introduce unnecessary complexity?** Prefer the simplest change that
  works. Ask the contributor to justify extra abstraction.
- **Does it fit the existing architecture?** It should follow the component,
  styling, and API patterns already in the repo.
- **Is it tested?** With no test suite, that means a clear description of manual
  testing. Ask if it's missing.
- **Does it negatively affect existing functionality?** Run the app, swipe
  through the deck, and hit the API endpoints touched by the change.
- **Is the UX/accessibility acceptable?** Check keyboard paths, focus states,
  contrast, and motion against the design guidelines.

When you request changes, be specific: point at the lines, explain the
concern, and offer a direction. Because you're the only reviewer, a clear
request is also a teaching moment — it helps contributors send better PRs next
time. Don't be afraid to close PRs that clearly don't fit; being explicit about
why protects your time and their effort.

## License

This repository does not currently have a LICENSE file. Note that the backend's
`package.json` declares `"license": "ISC"`, but until a LICENSE file exists
the project's licensing is not fully established. Review the licensing situation
before contributing, and don't assume code can be reused elsewhere. If you'd
like to help clarify licensing, that's a good topic to raise in an issue.

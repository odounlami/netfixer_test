import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <a href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid size-10 place-items-center rounded-xl bg-cyan-400 text-lg font-black text-slate-950">N</span>
            <span>Netfixer <span className="text-cyan-300">Lab</span></span>
          </a>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
            Tailwind CSS test
          </span>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              <span className="size-2 rounded-full bg-emerald-400" />
              React + Vite + Tailwind CSS
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              A clean space to test <span className="text-cyan-300">Netfixer.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              This starter page is intentionally simple. We’ll use it to check that Tailwind styles compile and render before integrating the Netfixer package.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="https://tailwindcss.com/docs" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-200">
                Tailwind docs <span className="ml-2" aria-hidden="true">↗</span>
              </a>
              <a href="https://github.com/odounlami/netfixer_test" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5">
                View repository
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-400">Interactive check</p>
                <h2 className="mt-2 text-2xl font-semibold">Tailwind is styled</h2>
              </div>
              <span className="rounded-xl bg-emerald-400/10 px-3 py-2 text-emerald-300">UI</span>
            </div>
            <div className="my-7 rounded-2xl border border-white/10 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Button click count</p>
              <p className="mt-2 text-5xl font-bold tabular-nums text-white">{count}</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-300 transition-all duration-300" style={{ width: `${Math.min(count * 10, 100)}%` }} />
              </div>
            </div>
            <button type="button" onClick={() => setCount((value) => value + 1)} className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950">
              Test the button
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              If the page has a dark background, cyan accents, rounded cards and a working counter, the Tailwind test is looking good.
            </p>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Netfixer Lab · Development sandbox</span>
          <span>Built with React, Vite and Tailwind CSS</span>
        </footer>
      </div>
    </main>
  )
}

export default App

import { useEffect, useRef, useState } from 'react'
import { NetworkMonitor, RequestScheduler } from 'netfixer'

const stateStyles = {
  good: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  degraded: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  poor: 'border-orange-400/25 bg-orange-400/10 text-orange-300',
  offline: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
}

const priorities = [
  { value: 'critical', label: 'Critical', description: 'Autorisé même sur un réseau faible.' },
  { value: 'normal', label: 'Normal', description: 'Mis en attente si le réseau est mauvais.' },
  { value: 'background', label: 'Background', description: 'Réservé aux bonnes connexions.' },
]

function Metric({ label, value, unit }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}<span className="ml-1 text-sm font-normal text-slate-500">{unit}</span>
      </p>
    </div>
  )
}

function App() {
  const [network, setNetwork] = useState({ state: 'offline', latency: 0, downlink: 0, rtt: 0 })
  const [priority, setPriority] = useState('normal')
  const [requests, setRequests] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const schedulerRef = useRef(null)
  const nextId = useRef(1)

  useEffect(() => {
    const monitor = new NetworkMonitor({
      pingUrl: '/',
      pingIntervalMs: 5000,
      pingTimeoutMs: 4000,
    })
    const scheduler = new RequestScheduler({
      monitor,
      defaultTimeoutMs: 8000,
      initialBackoffMs: 500,
      maxBackoffMs: 4000,
      logging: true,
    })
    schedulerRef.current = scheduler

    const unsubscribe = monitor.onChange((info) => {
      setNetwork(info)
      setIsRunning(true)
    })

    monitor.start()
    setNetwork(monitor.getInfo())
    setIsRunning(true)

    return () => {
      unsubscribe()
      scheduler.destroy()
      monitor.stop()
      schedulerRef.current = null
    }
  }, [])

  async function sendTestRequest() {
    const id = nextId.current++
    const startedAt = performance.now()
    setRequests((current) => [{
      id,
      priority,
      status: 'En attente',
      detail: 'Netfixer décide quand envoyer cette requête…',
      duration: null,
    }, ...current].slice(0, 6))

    try {
      const response = await schedulerRef.current.fetch(`/?netfixer-test=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        netPriority: priority,
        timeoutMs: 8000,
      })
      const duration = Math.round(performance.now() - startedAt)
      setRequests((current) => current.map((item) => item.id === id ? {
        ...item,
        status: response.ok ? 'Réussie' : 'Réponse HTTP',
        detail: `HTTP ${response.status} · requête traitée par scheduler.fetch()`,
        duration,
      } : item))
    } catch (error) {
      const duration = Math.round(performance.now() - startedAt)
      setRequests((current) => current.map((item) => item.id === id ? {
        ...item,
        status: 'Échec',
        detail: error instanceof Error ? error.message : String(error),
        duration,
      } : item))
    }
  }

  const state = network.state || 'offline'
  const stateClass = stateStyles[state] || stateStyles.offline

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-cyan-300 text-xl font-black text-slate-950">N</span>
            <div>
              <p className="text-lg font-bold tracking-tight">Netfixer <span className="text-cyan-300">Lab</span></p>
              <p className="text-xs text-slate-500">Bibliothèque testée comme une vraie dépendance</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            <span className={`size-2 rounded-full ${isRunning ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            {isRunning ? 'Monitor démarré' : 'Initialisation…'}
          </span>
        </header>

        <section className="grid gap-8 py-10 md:grid-cols-[1fr_0.8fr] md:items-end md:py-14">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Network-aware fetch</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Voyons comment Netfixer réagit à <span className="text-cyan-300">ton réseau.</span>
            </h1>
            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              Cette page utilise directement NetworkMonitor et RequestScheduler depuis le package installé. Les requêtes de test passent par scheduler.fetch(), pas par fetch() tout seul.
            </p>
          </div>
          <div className={`rounded-3xl border p-5 ${stateClass}`}>
            <p className="text-sm opacity-80">Qualité du réseau détectée</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h2 className="text-3xl font-bold capitalize">{state}</h2>
              <span className="rounded-xl border border-current/20 px-3 py-2 text-xs font-semibold">NetworkMonitor</span>
            </div>
            <p className="mt-3 text-sm opacity-80">
              L’état est mesuré par la bibliothèque. Selon le navigateur et le réseau, la première mesure peut prendre quelques secondes.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">1. Mesures réseau</h2>
            <p className="mt-1 text-sm text-slate-500">Valeurs remontées par monitor.getInfo() et monitor.onChange().</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Latence" value={Number.isFinite(network.latency) ? Math.round(network.latency) : '—'} unit="ms" />
            <Metric label="Débit estimé" value={Number.isFinite(network.downlink) ? Number(network.downlink).toFixed(2) : '—'} unit="Mbps" />
            <Metric label="RTT navigateur" value={Number.isFinite(network.rtt) ? Math.round(network.rtt) : '—'} unit="ms" />
            <Metric label="État" value={state} unit="" />
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
          <div>
            <p className="text-sm font-medium text-cyan-300">2. Tester RequestScheduler</p>
            <h2 className="mt-2 text-2xl font-semibold">Envoyer une requête avec priorité</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Choisis une priorité puis lance une requête GET vers cette application. Sur un réseau faible, Netfixer peut la mettre en file d’attente selon ses règles.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {priorities.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPriority(item.value)}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${priority === item.value ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10 bg-slate-900 hover:border-white/20'}`}
              >
                <span className="flex items-center justify-between gap-2 font-semibold text-white">
                  {item.label}
                  <span className={`grid size-4 place-items-center rounded-full border ${priority === item.value ? 'border-cyan-300 bg-cyan-300' : 'border-slate-600'}`}>
                    {priority === item.value && <span className="size-1.5 rounded-full bg-slate-950" />}
                  </span>
                </span>
                <span className="mt-2 block text-sm leading-5 text-slate-400">{item.description}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">Cible : même origine · méthode GET · timeout 8 s</p>
            <button
              type="button"
              onClick={sendTestRequest}
              disabled={!isRunning}
              className="rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lancer le test <span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">3. Résultats des requêtes</h2>
              <p className="mt-1 text-sm text-slate-500">Les six derniers essais, avec leur priorité et leur durée.</p>
            </div>
            {requests.length > 0 && (
              <button type="button" onClick={() => setRequests([])} className="text-sm text-slate-400 underline decoration-white/20 underline-offset-4 hover:text-white">
                Effacer
              </button>
            )}
          </div>
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 px-5 py-10 text-center">
              <p className="font-medium text-slate-300">Aucun test lancé pour le moment</p>
              <p className="mt-2 text-sm text-slate-500">Choisis une priorité ci-dessus et lance ta première requête.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <article key={request.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">Test #{request.id}</span>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-cyan-200">{request.priority}</span>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">{request.status}</span>
                    </div>
                    <p className="mt-2 break-words text-sm text-slate-400">{request.detail}</p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-slate-300">{request.duration === null ? 'En cours…' : `${request.duration} ms`}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <span>Netfixer Lab · Test d’intégration réel</span>
          <span>NetworkMonitor + RequestScheduler · v1.2.3</span>
        </footer>
      </div>
    </main>
  )
}

export default App

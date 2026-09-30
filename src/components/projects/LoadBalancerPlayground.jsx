import { useReducer } from 'react'

const BACKEND_IDS = ['A', 'B', 'C']

function createInitialState() {
  return {
    backends: BACKEND_IDS.map((id) => ({ id, healthy: true, requests: 0 })),
    cursor: 0,
    requestCount: 0,
    events: [],
  }
}

function routeRequests(state, count) {
  let backends = state.backends.map((backend) => ({ ...backend }))
  let cursor = state.cursor
  let requestCount = state.requestCount
  const events = []

  for (let index = 0; index < count; index += 1) {
    requestCount += 1
    const healthy = backends.filter((backend) => backend.healthy)

    if (healthy.length === 0) {
      events.push({ request: requestCount, status: 503, backend: null })
      continue
    }

    const selected = healthy[((cursor % healthy.length) + healthy.length) % healthy.length]
    cursor += 1
    backends = backends.map((backend) => (
      backend.id === selected.id ? { ...backend, requests: backend.requests + 1 } : backend
    ))
    events.push({ request: requestCount, status: 200, backend: selected.id })
  }

  return {
    ...state,
    backends,
    cursor,
    requestCount,
    events: [...state.events, ...events].slice(-12),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'toggle':
      return {
        ...state,
        backends: state.backends.map((backend) => (
          backend.id === action.id ? { ...backend, healthy: !backend.healthy } : backend
        )),
      }
    case 'route':
      return routeRequests(state, action.count)
    case 'reset':
      return createInitialState()
    default:
      return state
  }
}

function LoadBalancerPlayground() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const lastEvent = state.events.at(-1)

  return (
    <div className="mt-8 border border-border bg-surface">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="eyebrow text-accent">Interactive model</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Mirrors <span className="font-mono text-heading">BackendPool.next()</span>; it does not run the Java server.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'route', count: 1 })}
            className="bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-heading"
          >
            Send request
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'route', count: 6 })}
            className="bg-heading px-4 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent"
          >
            Send 6 requests
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className="border border-border px-4 py-2.5 text-sm font-medium text-heading transition-colors hover:border-heading"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)]">
        <div className="p-5 sm:border-r sm:border-border sm:p-7">
          <div className="grid gap-3 sm:grid-cols-3" aria-label="Backend health controls">
            {state.backends.map((backend) => (
              <article
                key={backend.id}
                aria-label={`Backend ${backend.id}`}
                className={`border p-4 transition-colors ${backend.healthy ? 'border-border bg-bg' : 'border-heading bg-surface'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-mono text-sm font-semibold text-heading">Backend {backend.id}</h3>
                  <span
                    aria-hidden="true"
                    className={`size-2.5 ${backend.healthy ? 'bg-emerald-500' : 'bg-muted'}`}
                  />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-heading">{backend.requests}</p>
                <p className="eyebrow mt-1 text-muted">routed</p>
                <button
                  type="button"
                  aria-label={`Mark backend ${backend.id} ${backend.healthy ? 'unhealthy' : 'healthy'}`}
                  aria-pressed={!backend.healthy}
                  onClick={() => dispatch({ type: 'toggle', id: backend.id })}
                  className="mt-5 w-full border border-border px-3 py-2 text-left font-mono text-[11px] font-medium text-heading transition-colors hover:border-heading"
                >
                  {backend.healthy ? 'Healthy' : 'Unavailable'}
                  <span aria-hidden="true" className="float-right">↕</span>
                </button>
              </article>
            ))}
          </div>

          <div className="mt-5 border-l-2 border-accent pl-4" aria-live="polite">
            <p className="eyebrow text-muted">Latest result</p>
            <p className="mt-2 text-sm font-medium text-heading">
              {!lastEvent && 'Ready for request #1'}
              {lastEvent?.backend && `Request #${lastEvent.request} routed to Backend ${lastEvent.backend}`}
              {lastEvent?.status === 503 && `Request #${lastEvent.request} returned 503 — no healthy backends`}
            </p>
          </div>
        </div>

        <div className="border-t border-border p-5 sm:border-t-0 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="eyebrow text-muted">Routing log</h3>
            <span className="font-mono text-[11px] text-muted">cursor {state.cursor}</span>
          </div>
          <ol aria-label="Routing event log" className="mt-4 space-y-2 font-mono text-xs">
            {state.events.length === 0 && <li className="text-muted">No requests yet.</li>}
            {state.events.map((event) => (
              <li key={event.request} className="flex items-center justify-between gap-3 border-b border-border pb-2 text-heading">
                <span>#{event.request}</span>
                <span>{event.backend ? `→ Backend ${event.backend}` : '→ 503 unavailable'}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default LoadBalancerPlayground

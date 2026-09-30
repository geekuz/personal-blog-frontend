import CaseStudyLayout from '../components/projects/CaseStudyLayout'
import LoadBalancerPlayground from '../components/projects/LoadBalancerPlayground'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const BUILD_STEPS = [
  {
    number: '01',
    title: 'Forward one request end to end',
    body: 'Start with a ServerSocket accept loop, parse a minimal HTTP/1.1 request, connect to one backend, rewrite the Host and Connection headers, then stream the upstream response back to the client.',
  },
  {
    number: '02',
    title: 'Handle clients concurrently',
    body: 'Keep the accept loop small and hand every connection to a cached worker pool. Each ConnectionHandler owns its client and backend sockets, so blocking I/O on one request does not stop new connections from being accepted.',
  },
  {
    number: '03',
    title: 'Distribute traffic fairly',
    body: 'Introduce BackendPool with an atomic cursor. Selection filters the healthy subset first, then rotates over that subset so a failed backend does not accidentally give its share of traffic to one neighbour.',
  },
  {
    number: '04',
    title: 'Detect failure and recovery',
    body: 'Run timed HTTP probes on a dedicated scheduler. A failed or 4xx/5xx probe removes a backend from selection; a later successful probe flips the same atomic health flag and returns it to rotation automatically.',
  },
  {
    number: '05',
    title: 'Prove the network behaviour',
    body: 'Finish with unit tests around parsing and selection plus integration tests that launch real in-process HTTP servers and drive the load balancer through actual TCP sockets.',
  },
]

const DECISIONS = [
  {
    title: 'JDK primitives, not a proxy framework',
    body: 'java.net sockets expose the connection lifecycle directly, while the JDK HttpClient handles health probes. JUnit is the only dependency and is test-scoped.',
  },
  {
    title: 'Blocking I/O for clarity',
    body: 'A worker thread owns each connection. This makes the request path easy to trace, at the cost of the scalability ceiling that an NIO or virtual-thread design could raise.',
  },
  {
    title: 'Healthy-subset round-robin',
    body: 'Filtering before indexing preserves equal distribution among the servers still eligible for traffic. Math.floorMod also keeps rotation valid after the atomic cursor wraps into negative integers.',
  },
  {
    title: 'Small, explicit HTTP scope',
    body: 'The proxy deliberately supports one request per connection and Content-Length bodies. Keep-alive, chunked uploads, TLS termination and connection pooling remain outside this learning build.',
  },
]

const EVIDENCE = [
  ['26 tests', 'Parsing, configuration, rotation, health transitions and full request forwarding.'],
  ['6 test classes', 'Focused unit suites plus health and load-balancer integration coverage.'],
  ['Real sockets', 'Integration tests start local HTTP backends and send requests through a running balancer.'],
  ['No benchmark claim', 'The repository verifies correctness but does not contain a repeatable throughput benchmark.'],
]

function LoadBalancerCaseStudy() {
  useDocumentMeta({
    title: 'Building a Java load balancer — Case study',
    description: 'How Otabek built a framework-free HTTP load balancer with Java 21 sockets, fair round-robin routing, health checks and real-network tests.',
  })

  return (
    <CaseStudyLayout
      eyebrow="Case study / 02"
      title="Building a Java load balancer"
      description="Recreating the mechanics behind a reverse proxy with Java 21 sockets, concurrent forwarding, fair backend selection and automatic recovery."
      stats={[
        ['Role', 'Design + engineering'],
        ['Runtime', 'Java 21'],
        ['Runtime deps', 'None'],
        ['Tests', '26'],
      ]}
      contents={[
        ['Challenge', '#challenge'],
        ['Architecture', '#architecture'],
        ['Build path', '#build-path'],
        ['Algorithm', '#algorithm'],
        ['Playground', '#playground'],
        ['Decisions', '#decisions'],
        ['Evidence', '#evidence'],
      ]}
      footer={{
        eyebrow: 'Inspect the implementation',
        text: 'The complete Java source, tests and walkthrough are public.',
        links: [
          { label: 'Source code ↗', href: 'https://github.com/geekuz/BYO-load-balancer', variant: 'solid' },
          { label: 'Contact →', to: '/contact', variant: 'accent' },
          { label: 'All projects →', to: '/projects' },
        ],
      }}
    >
      <section id="challenge" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">01 / Challenge</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-12">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">Understand the machinery beneath the proxy</h2>
          <div className="space-y-5 text-[16px] leading-relaxed text-muted">
            <p>
              A production proxy hides several coordinated jobs: accepting clients, parsing requests, selecting an upstream, relaying bytes, observing backend health and staying responsive while many connections are open.
            </p>
            <p>
              The goal was to implement that path without Spring, Netty or a proxy library. Keeping the runtime to the Java standard library makes every boundary visible and keeps the result small enough to study end to end.
            </p>
          </div>
        </div>
      </section>

      <section id="architecture" className="scroll-mt-20 border-t border-border py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent">02 / Architecture</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Two concurrent flows, one shared signal</h2>
          </div>
          <span className="eyebrow hidden text-muted sm:block">Request + health paths</span>
        </div>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          Worker threads move request and response bytes. A separate scheduled checker probes every backend. They coordinate through atomic health flags and the pool’s atomic round-robin cursor—without a shared mutable queue on the request path.
        </p>
        <iframe
          title="Java load balancer architecture"
          src="/diagrams/java-load-balancer-architecture.html"
          className="mt-8 h-[43rem] w-full border border-border bg-surface sm:h-[31rem]"
        />
      </section>

      <section id="build-path" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">03 / Build path</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-12">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">Build one responsibility at a time</h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
              The public repository was committed as one completed challenge on 19 June 2026. This sequence follows the implementation stages documented in its README and reflected in the class boundaries.
            </p>
          </div>
          <ol className="border-t border-border">
            {BUILD_STEPS.map((step) => (
              <li key={step.number} className="grid gap-3 border-b border-border py-7 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6">
                <span className="eyebrow text-muted">{step.number}</span>
                <div>
                  <h3 className="text-lg font-semibold leading-snug text-heading">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="algorithm" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">04 / Algorithm</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Fairness after a backend fails</h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          With backends A, B and C, ordinary rotation is A → B → C. If B becomes unhealthy, scanning forward through the original list can over-select C. This implementation first creates the currently healthy subset, then advances the cursor over that smaller list.
        </p>
        <div className="mt-8 grid border-y border-border sm:grid-cols-2">
          <div className="border-b border-border py-7 sm:border-r sm:border-b-0 sm:pr-8">
            <p className="eyebrow text-muted">All healthy</p>
            <p className="mt-4 font-mono text-lg text-heading">A → B → C → A → B → C</p>
          </div>
          <div className="py-7 sm:pl-8">
            <p className="eyebrow text-muted">B unavailable</p>
            <p className="mt-4 font-mono text-lg text-heading">A → C → A → C → A → C</p>
          </div>
        </div>
      </section>

      <section id="playground" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">05 / Playground</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Put the selection rule under pressure</h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          Send traffic, remove backends from service and watch the cursor continue across the currently healthy subset. Taking every backend down produces the same 503 outcome as the Java implementation.
        </p>
        <LoadBalancerPlayground />
      </section>

      <section id="decisions" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">06 / Decisions</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Clarity over hidden capability</h2>
        <div className="mt-8">
          {DECISIONS.map((decision, index) => (
            <div key={decision.title} className="grid gap-3 border-t border-border py-7 sm:grid-cols-[4rem_minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-8">
              <span className="eyebrow text-muted">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-lg font-semibold leading-snug text-heading">{decision.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{decision.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="evidence" className="scroll-mt-20 border-y border-border py-12">
        <p className="eyebrow text-accent">07 / Evidence</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">What the repository actually proves</h2>
        <div className="mt-8 grid border-t border-border sm:grid-cols-2">
          {EVIDENCE.map(([title, body]) => (
            <div key={title} className="border-b border-border py-7 sm:odd:pr-8 sm:even:border-l sm:even:pl-8">
              <h3 className="text-xl font-semibold tracking-tight text-heading">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </CaseStudyLayout>
  )
}

export default LoadBalancerCaseStudy

import CaseStudyLayout from '../components/projects/CaseStudyLayout'
import SortAlgorithmLab from '../components/projects/SortAlgorithmLab'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const BUILD_STEPS = [
  {
    number: '01',
    title: 'Define the Unix-style boundary',
    body: 'Start with files and standard input, explicit exit behavior, -u deduplication, -R random ordering and a validated --algorithm option. ArgumentParser turns raw flags into one immutable SortOptions record before any data is read.',
  },
  {
    number: '02',
    title: 'Make algorithms interchangeable',
    body: 'Introduce a tiny Sorter strategy contract. Every implementation accepts an array of lines, returns a new array and leaves its caller’s input untouched, keeping the orchestration independent from algorithm details.',
  },
  {
    number: '03',
    title: 'Implement four lexical strategies',
    body: 'Build stable merge sort, a hardened quicksort, in-place heap sort and variable-length MSD radix sort. Each targets the same String.compareTo ordering while exposing a different time, memory and stability trade-off.',
  },
  {
    number: '04',
    title: 'Add grouped random ordering',
    body: 'Generate one salt per run, hash each line with salted SHA-256 and order by that key. Equal lines receive equal hashes and remain adjacent, allowing the same post-sort -u pass to work for random output.',
  },
  {
    number: '05',
    title: 'Prove the shared contract',
    body: 'Parameterize the comparison-sorter contract against Arrays.sort, cover empty, duplicate, sorted, reverse and random inputs, then test CLI parsing, file/stdin behavior, random reproducibility and the challenge’s canonical output.',
  },
]

const ALGORITHMS = [
  ['Merge', 'Split and merge', 'O(n log n)', 'O(n)', 'Yes'],
  ['Quick', 'Median-of-three + cutoff', 'O(n log n) avg', 'O(log n)', 'No'],
  ['Heap', 'Implicit max-heap', 'O(n log n)', 'O(1)', 'No'],
  ['MSD radix', 'Sparse character buckets', '≈ O(n·k)', 'O(n)', 'Yes'],
  ['Random', 'Salted SHA-256 keys', 'O(n log n)', 'O(n)', 'n/a'],
]

const DECISIONS = [
  {
    title: 'Merge sort as the default',
    body: 'Its stable O(n log n) behavior has no pathological input shape and pairs naturally with adjacent deduplication. The CLI still exposes every other strategy for comparison.',
  },
  {
    title: 'Quicksort hardened for word lists',
    body: 'Median-of-three avoids the obvious sorted-input pivot trap, ranges of 16 or fewer use insertion sort, and recursing into the smaller partition bounds stack depth.',
  },
  {
    title: 'Sparse radix buckets',
    body: 'A TreeMap allocates buckets only for characters present at the current depth. Finished prefix strings are emitted first, preserving Java String.compareTo order without a fixed 65,536-slot alphabet.',
  },
  {
    title: 'One dedupe policy after sorting',
    body: 'Every ordering groups equal lines, including the hash-based random strategy. That lets -u remain a simple adjacent scan instead of leaking uniqueness logic into each sorter.',
  },
]

const EVIDENCE = [
  ['40 tests', 'The unchanged repository suite passes on Java 21.'],
  ['5 test classes', 'Algorithm contracts, random properties, CLI parsing and end-to-end tool behavior.'],
  ['Arrays.sort oracle', 'All four lexical strategies are checked against the JDK result across varied inputs.'],
  ['CI on JDK 21', 'GitHub Actions runs the Maven test suite for every pushed revision.'],
]

function SortToolCaseStudy() {
  useDocumentMeta({
    title: 'Building a Unix-style sort tool — Case study',
    description: 'How Otabek built a Java 21 sort command with four hand-written algorithms, salted random ordering, Unix-style input and a 40-test suite.',
  })

  return (
    <CaseStudyLayout
      eyebrow="Case study / 03"
      title="Building a Unix-style sort tool"
      description="Recreating a familiar command-line utility to study algorithm trade-offs, clean strategy boundaries and the small details that make text processing dependable."
      stats={[
        ['Role', 'Design + engineering'],
        ['Runtime', 'Java 21'],
        ['Algorithms', '5'],
        ['Tests', '40'],
      ]}
      contents={[
        ['Challenge', '#challenge'],
        ['Architecture', '#architecture'],
        ['Build path', '#build-path'],
        ['Algorithms', '#algorithms'],
        ['Lab', '#lab'],
        ['Decisions', '#decisions'],
        ['Evidence', '#evidence'],
      ]}
      footer={{
        eyebrow: 'Inspect the implementation',
        text: 'The complete Java source, tests, CI workflow and usage guide are public.',
        links: [
          { label: 'Source code ↗', href: 'https://github.com/geekuz/BYO-sort-tool', variant: 'solid' },
          { label: 'Contact →', to: '/contact', variant: 'accent' },
          { label: 'All projects →', to: '/projects' },
        ],
      }}
    >
      <section id="challenge" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">01 / Challenge</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-12">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">Look past the one-line command</h2>
          <div className="space-y-5 text-[16px] leading-relaxed text-muted">
            <p>
              Unix <span className="font-mono text-heading">sort</span> looks simple from the shell, but a credible small implementation must coordinate input sources, option precedence, lexical ordering, algorithm selection, duplicate removal and useful failures.
            </p>
            <p>
              The project deliberately avoids Java’s built-in sort for its core work. The utility boundary remains practical while the algorithms stay visible enough to study, test and compare.
            </p>
          </div>
        </div>
      </section>

      <section id="architecture" className="scroll-mt-20 border-t border-border py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent">02 / Architecture</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">A narrow pipeline around a strategy seam</h2>
          </div>
          <span className="eyebrow hidden text-muted sm:block">Input → strategy → output</span>
        </div>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          Argument parsing and I/O stay outside the algorithms. SortTool reads every line, selects one pure Sorter implementation, optionally collapses adjacent duplicates and writes the result to a supplied PrintStream.
        </p>
        <iframe
          title="Sort tool architecture"
          src="/diagrams/sort-tool-architecture.html"
          className="mt-8 h-[54rem] w-full border border-border bg-surface sm:h-[30rem]"
        />
      </section>

      <section id="build-path" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">03 / Build path</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-12">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">Build the boundary, then vary the engine</h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
              The public implementation arrived as one completed challenge commit on 23 June 2026, followed by repository cleanup, documentation and CI that day. This sequence is reconstructed from the documented pipeline and code boundaries—not invented intermediate commits.
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

      <section id="algorithms" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">04 / Algorithms</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Five strategies, one contract</h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          The four lexical algorithms agree with Java’s natural String order. Random ordering is intentionally different: one salt per run produces opaque SHA-256 keys while keeping identical lines together.
        </p>
        <div className="mt-8 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead className="font-mono text-[10px] tracking-wider text-muted uppercase">
              <tr>{['Algorithm', 'Core idea', 'Time', 'Space', 'Stable'].map((heading) => <th key={heading} className="border-b border-border px-4 py-4 font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {ALGORITHMS.map((row) => (
                <tr key={row[0]} className="border-b border-border last:border-b-0">
                  {row.map((cell, index) => <td key={cell} className={`px-4 py-4 ${index === 0 ? 'font-semibold text-heading' : 'text-muted'}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="lab" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">05 / Algorithm lab</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Watch the ordering emerge</h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          Switch among the repository’s four lexical strategies, supply your own lines and move through each trace. Generate 18 lines to expose quicksort’s median-of-three partition before its insertion-sort cutoff takes over.
        </p>
        <SortAlgorithmLab />
      </section>

      <section id="decisions" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">06 / Decisions</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Small choices that preserve the contract</h2>
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

export default SortToolCaseStudy

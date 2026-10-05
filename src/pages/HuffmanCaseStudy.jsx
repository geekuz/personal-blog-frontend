import CaseStudyLayout from '../components/projects/CaseStudyLayout'
import HuffmanLab from '../components/projects/HuffmanLab'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const BUILD_STEPS = [
  {
    number: '01',
    title: 'Count every character',
    body: 'FrequencyCounter streams the UTF-8 input one Java char at a time and returns an immutable frequency map. The CLI exposes this step on its own as the freq command, matching the challenge’s verification counts.',
  },
  {
    number: '02',
    title: 'Build a deterministic tree',
    body: 'HuffmanTree seeds a priority queue with one leaf per character and repeatedly joins the two lowest nodes. A sealed HuffmanNode type has exactly two shapes, Leaf and Internal, and each node carries the smallest symbol in its subtree for tie-breaking.',
  },
  {
    number: '03',
    title: 'Derive prefix codes',
    body: 'CodeTable walks the tree depth-first: left appends 0, right appends 1. Because characters live only at leaves, no code is a prefix of another. A single-character input gets the one-bit code 0 so it stays representable.',
  },
  {
    number: '04',
    title: 'Write the HUF1 file',
    body: 'Header writes a magic marker and the frequency table; HuffmanEncoder then reads the input a second time and BitOutputStream packs each code MSB-first, zero-padding only the final byte.',
  },
  {
    number: '05',
    title: 'Decode and stop by count',
    body: 'HuffmanDecoder validates the header, rebuilds the same tree and walks the bitstream until it has emitted the sum of all frequencies. Stopping by count, not end-of-file, makes the padding bits harmless.',
  },
]

const FORMAT = [
  ['Magic', '4 bytes', 'ASCII H U F 1, rejected on mismatch'],
  ['Count', '4 bytes', 'int N, distinct characters'],
  ['Entries', '10 × N bytes', 'char symbol (2) + long frequency (8)'],
  ['Payload', '⌈bits ÷ 8⌉ bytes', 'codes packed MSB-first, last byte zero-padded'],
]

const DECISIONS = [
  {
    title: 'Store frequencies, not the tree',
    body: 'The file never contains a serialized tree or code table. The decoder reruns the exact construction on the same frequencies, which keeps the format small to describe and easy to validate.',
  },
  {
    title: 'Make ties deterministic',
    body: 'Equal frequencies would otherwise leave the queue order unspecified, so two runs could build different shapes and decode garbage. Comparing on the smallest contained character makes the tree identical every time.',
  },
  {
    title: 'Read the input twice',
    body: 'One pass counts, a second pass encodes. The tool never holds the whole file in memory, at the cost of reading it from disk twice.',
  },
  {
    title: 'Accept a heavy, simple header',
    body: 'Every distinct character costs ten bytes because frequencies are stored as longs. That is negligible on the 3.4 MB sample but dominates tiny files: a one-character file grows from 1 byte to 19.',
  },
]

const EVIDENCE = [
  ['37 tests', 'The unchanged repository suite passes on Java 21 across seven test classes: counting, tree, codes, header, bit streams, codec round trips and the CLI.'],
  ['57% on 3.4 MB', 'Les Misérables (3,369,045 bytes) compresses to 1,920,972 bytes, and decoding reproduces it byte for byte. Re-measured on 5 October 2026.'],
  ['Java-matched lab', 'The browser model is checked against codes and file sizes produced by the repository’s own classes on five inputs, including accented and symbol characters.'],
  ['Known limit: text only', 'Input is decoded as UTF-8, so a binary file is refused with exit code 74 rather than compressed. Characters are UTF-16 code units, so an emoji counts as two symbols.'],
]

function HuffmanCaseStudy() {
  useDocumentMeta({
    title: 'Building a Huffman compressor — Case study',
    description: 'How Otabek built a Java 21 Huffman compression tool with a deterministic tree, a compact HUF1 format, byte-exact round trips and a 37-test suite.',
  })

  return (
    <CaseStudyLayout
      eyebrow="Case study / 04"
      title="Building a Huffman compressor"
      description="A command-line tool that shrinks text by giving frequent characters short codes, and restores it exactly. The interesting part is making both sides agree without ever storing the tree."
      stats={[
        ['Role', 'Design + engineering'],
        ['Runtime', 'Java 21'],
        ['Format', 'HUF1'],
        ['Tests', '37'],
      ]}
      contents={[
        ['Challenge', '#challenge'],
        ['Architecture', '#architecture'],
        ['Build path', '#build-path'],
        ['File format', '#format'],
        ['Lab', '#lab'],
        ['Decisions', '#decisions'],
        ['Evidence', '#evidence'],
      ]}
      footer={{
        eyebrow: 'Inspect the implementation',
        text: 'The Java source, tests and a full internals guide are public.',
        links: [
          { label: 'Source code ↗', href: 'https://github.com/geekuz/BYO-compression-tool', variant: 'solid' },
          { label: 'Contact →', to: '/contact', variant: 'accent' },
          { label: 'All projects →', to: '/projects' },
        ],
      }}
    >
      <section id="challenge" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">01 / Challenge</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-12">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">Shorter codes for common characters</h2>
          <div className="space-y-5 text-[16px] leading-relaxed text-muted">
            <p>
              Plain text spends the same width on every character, whether it is a space or a rare accent. Huffman coding assigns each character a variable-length bit code, short for frequent ones and long for rare ones, so the total shrinks whenever a few characters dominate.
            </p>
            <p>
              The hard requirement is the return trip. The decoder reads one continuous stream of bits with no separators, so it must rebuild exactly the codes the encoder used. Getting that agreement right is what most of this design is about.
            </p>
          </div>
        </div>
      </section>

      <section id="architecture" className="scroll-mt-20 border-t border-border py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent">02 / Architecture</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Small classes around one invariant</h2>
          </div>
          <span className="eyebrow hidden text-muted sm:block">Encode → HUF1 → decode</span>
        </div>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          Each class maps to one step of the codingchallenges.fyi Huffman challenge. Encoder and decoder share only the frequency table and the tree-building rule, so the same table always yields the same tree.
        </p>
        <iframe
          title="Huffman compression architecture"
          src="/diagrams/huffman-architecture.html"
          className="mt-8 h-[56rem] w-full border border-border bg-surface sm:h-[34rem]"
        />
      </section>

      <section id="build-path" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">03 / Build path</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-12">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">Five steps, one class each</h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
              The implementation was published as one commit on 15 June 2026, followed by the internals guide on 16 June. This sequence follows the challenge steps each class documents, not invented intermediate commits.
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

      <section id="format" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">04 / File format</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">HUF1: a header, then bits</h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          Written big-endian through DataOutputStream. The character count is not stored: it is the sum of the frequencies, which is also how the decoder knows where to stop.
        </p>
        <div className="mt-8 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="font-mono text-[10px] tracking-wider text-muted uppercase">
              <tr>{['Field', 'Size', 'Contents'].map((heading) => <th key={heading} className="border-b border-border px-4 py-4 font-medium">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {FORMAT.map((row) => (
                <tr key={row[0]} className="border-b border-border last:border-b-0">
                  {row.map((cell, index) => <td key={cell} className={`px-4 py-4 ${index === 0 ? 'font-semibold text-heading' : index === 1 ? 'font-mono text-heading' : 'text-muted'}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="lab" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">05 / Compression lab</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Watch the tree assemble</h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          Each step merges the two lightest trees in the queue. Step through it, then compare the resulting codes, the packed bits and the real HUF1 file size, including how the header behaves on short text.
        </p>
        <HuffmanLab />
      </section>

      <section id="decisions" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">06 / Decisions</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Trade-offs behind a simple format</h2>
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

export default HuffmanCaseStudy

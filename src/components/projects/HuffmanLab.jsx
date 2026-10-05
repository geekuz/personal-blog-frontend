import { useEffect, useMemo, useState } from 'react'
import { compressionReport, describeSymbol, isLeaf } from '../../lib/huffman'

const MAX_LENGTH = 120
const STEP_DELAY_MS = 700
const PREVIEW_UNITS = 40
const PRESETS = ['abracadabra', 'mississippi river', 'she sells sea shells by the sea shore']

// Geometry for the forest drawing: one column per leaf, one row per depth.
const COLUMN = 46
const ROW = 64
const PADDING = 26
const TREE_GAP = 0.5

function layoutTree(node, depth, cursor, placed) {
  if (isLeaf(node)) {
    const x = cursor.column
    cursor.column += 1
    placed.push({ node, x, depth })
    return x
  }
  const left = layoutTree(node.left, depth + 1, cursor, placed)
  const right = layoutTree(node.right, depth + 1, cursor, placed)
  const x = (left + right) / 2
  placed.push({ node, x, depth, left, right })
  return x
}

function layoutForest(forest) {
  const cursor = { column: 0 }
  const placed = []
  forest.forEach((tree, index) => {
    if (index > 0) cursor.column += TREE_GAP
    layoutTree(tree, 0, cursor, placed)
  })
  const depth = Math.max(0, ...placed.map((item) => item.depth))
  return { placed, columns: cursor.column, depth }
}

function ForestView({ step }) {
  const { placed, columns, depth } = layoutForest(step.forest)
  const children = new Set(step.merged ? [step.merged.left.id, step.merged.right.id] : [])
  const parentId = step.merged?.parent.id
  const position = (column, row) => [PADDING + column * COLUMN + COLUMN / 2, PADDING + row * ROW]
  const width = PADDING * 2 + columns * COLUMN
  const height = PADDING * 2 + depth * ROW + 24

  return (
    <div className="overflow-x-auto border-y border-border">
      <svg
        role="img"
        aria-label={`${step.forest.length} ${step.forest.length === 1 ? 'tree' : 'trees'} in the priority queue`}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: Math.max(width, 280), minWidth: '100%' }}
        className="block h-auto"
      >
        {placed.filter((item) => !isLeaf(item.node)).map(({ node, x, depth: row, left, right }) => {
          const [px, py] = position(x, row)
          return [[left, '0'], [right, '1']].map(([childX, bit]) => {
            const [cx, cy] = position(childX, row + 1)
            return (
              <g key={`${node.id}-${bit}`}>
                <line x1={px} y1={py} x2={cx} y2={cy} className={node.id === parentId ? 'stroke-accent' : 'stroke-border-strong'} strokeWidth="1.25" />
                <text x={(px + cx) / 2 + (bit === '0' ? -7 : 7)} y={(py + cy) / 2} textAnchor="middle" className="fill-muted font-mono text-[10px]">{bit}</text>
              </g>
            )
          })
        })}
        {placed.map(({ node, x, depth: row }) => {
          const [cx, cy] = position(x, row)
          const isParent = node.id === parentId
          const isActive = isParent || children.has(node.id)
          return (
            <g key={node.id}>
              {isLeaf(node) ? (
                <rect x={cx - 15} y={cy - 15} width="30" height="30" className={isActive ? 'fill-bg stroke-accent' : 'fill-bg stroke-border-strong'} strokeWidth={isActive ? 2 : 1} />
              ) : (
                <circle cx={cx} cy={cy} r="15" className={isParent ? 'fill-accent stroke-accent' : 'fill-surface stroke-border-strong'} strokeWidth={isActive ? 2 : 1} />
              )}
              <text x={cx} y={cy + 4} textAnchor="middle" className={`font-mono text-[12px] ${isParent ? 'fill-white' : 'fill-heading'}`}>
                {isLeaf(node) ? describeSymbol(node.symbol).slice(0, 6) : node.frequency}
              </text>
              {isLeaf(node) && (
                <text x={cx} y={cy + 30} textAnchor="middle" className="fill-muted font-mono text-[10px]">{node.frequency}</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function stepLabel(step, index) {
  if (!step.merged) return `Seed the queue with one leaf per character (${step.forest.length})`
  const { left, right, parent } = step.merged
  const name = (node) => (isLeaf(node) ? describeSymbol(node.symbol) : 'node')
  return `Merge ${index}: ${name(left)} (${left.frequency}) + ${name(right)} (${right.frequency}) → ${parent.frequency}`
}

function CodeTable({ report }) {
  const rows = [...report.frequencies]
    .map(([symbol, count]) => ({ symbol, count, code: report.codes.get(symbol) }))
    .sort((a, b) => b.count - a.count || a.symbol - b.symbol)

  return (
    <div className="max-h-80 overflow-auto border-y border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-surface font-mono text-[10px] tracking-wider text-muted uppercase">
          <tr>{['Char', 'Count', 'Code', 'Bits'].map((heading) => <th key={heading} className="border-b border-border px-3 py-3 font-medium">{heading}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className="border-b border-border last:border-b-0">
              <td className="px-3 py-2 font-mono text-heading">{describeSymbol(row.symbol)}</td>
              <td className="px-3 py-2 text-muted">{row.count}</td>
              <td className="px-3 py-2 font-mono text-accent">{row.code}</td>
              <td className="px-3 py-2 text-muted">{row.count * row.code.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Alternating colours show where each character's code starts and ends.
function BitstreamPreview({ text, codes }) {
  const shown = Math.min(text.length, PREVIEW_UNITS)
  const symbols = Array.from({ length: shown }, (_, index) => text.charCodeAt(index))
  return (
    <p className="font-mono text-xs leading-7 break-all" aria-label="Encoded bitstream preview">
      {symbols.map((symbol, index) => (
        <span key={index} title={describeSymbol(symbol)} className={index % 2 === 0 ? 'text-heading' : 'text-accent'}>
          {codes.get(symbol)}
        </span>
      ))}
      {text.length > shown && <span className="text-muted"> …</span>}
    </p>
  )
}

function SizeReport({ report }) {
  const percent = (value) => `${Math.round((value / report.originalBytes) * 100)}%`
  const cells = [
    ['Original (UTF-8)', `${report.originalBytes} B`],
    ['Payload', `${report.bits.length} bits → ${report.payloadBytes} B`],
    ['HUF1 header', `${report.headerBytes} B`],
    ['HUF1 file', `${report.fileBytes} B · ${percent(report.fileBytes)}`],
  ]
  return (
    <>
      <dl className="grid border-t border-border sm:grid-cols-4">
        {cells.map(([term, detail]) => (
          <div key={term} className="border-b border-border py-4 sm:pr-4">
            <dt className="eyebrow text-muted">{term}</dt>
            <dd className="mt-2 text-sm font-medium text-heading">{detail}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        The bitstream alone is <span className="font-medium text-heading">{percent(report.payloadBytes)}</span> of the original.
        {report.fileBytes > report.originalBytes && ' On short text the 10-byte-per-character frequency header outweighs the savings, so the file grows; on the 3.4 MB Les Misérables sample the real tool writes 57% of the original size.'}
        {' '}
        <span className="font-medium text-heading">{report.roundTrip ? 'Round trip ✓ — decoding the bits reproduces the input exactly.' : 'Round trip failed.'}</span>
      </p>
    </>
  )
}

function useStepPlayback(stepCount) {
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const atEnd = stepIndex >= stepCount - 1

  useEffect(() => {
    if (!playing || atEnd) return undefined
    const timeout = window.setTimeout(() => setStepIndex((current) => current + 1), STEP_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [playing, atEnd, stepIndex])

  function reset() {
    setStepIndex(0)
    setPlaying(false)
  }

  return { stepIndex, setStepIndex, playing: playing && !atEnd, setPlaying, atEnd, reset }
}

function HuffmanLab() {
  const [draft, setDraft] = useState(PRESETS[0])
  const [text, setText] = useState(PRESETS[0])
  const [message, setMessage] = useState('')
  const report = useMemo(() => compressionReport(text), [text])
  const playback = useStepPlayback(report.steps.length)
  const step = report.steps[playback.stepIndex]
  const lastStep = report.steps.length - 1

  function apply(value) {
    if (value.length === 0 || value.length > MAX_LENGTH) {
      setMessage(`Enter between 1 and ${MAX_LENGTH} characters.`)
      return
    }
    setMessage('')
    setDraft(value)
    setText(value)
    playback.reset()
  }

  const buttonClass = 'border border-border px-3 py-2 text-xs font-medium text-heading transition-colors hover:border-heading disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="mt-8 border border-border bg-surface">
      <div className="grid gap-6 border-b border-border p-5 sm:grid-cols-[minmax(0,1fr)_minmax(17rem,0.8fr)] sm:p-7">
        <div>
          <p className="eyebrow text-accent">Interactive compression lab</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            A browser model of the Java encoder: same frequency count, same tie-break, same codes and the same HUF1 file size. Type any text and replay how the tree is built.
          </p>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Example inputs">
            {PRESETS.map((preset) => (
              <button key={preset} type="button" onClick={() => apply(preset)} aria-pressed={text === preset} className={`border px-3 py-2 font-mono text-[11px] transition-colors ${text === preset ? 'border-accent bg-bg text-heading' : 'border-border text-muted hover:border-heading'}`}>
                {preset}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="huffman-input" className="eyebrow text-muted">Text to compress · 1–{MAX_LENGTH} characters</label>
          <textarea
            id="huffman-input"
            rows="3"
            value={draft}
            maxLength={MAX_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            className="mt-2 w-full resize-none border border-border bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-heading outline-none focus:border-accent"
          />
          {message && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{message}</p>}
          <button type="button" onClick={() => apply(draft)} className="mt-3 bg-heading px-3 py-2 text-xs font-medium text-bg transition-colors hover:bg-accent">Compress</button>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div aria-live="polite">
          <p className="eyebrow text-muted">Step {playback.stepIndex + 1} / {report.steps.length}</p>
          <p className="mt-2 text-sm font-medium text-heading">{stepLabel(step, playback.stepIndex)}</p>
        </div>
        <div className="mt-6">
          <ForestView step={step} />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => playback.setStepIndex((current) => Math.max(0, current - 1))} disabled={playback.stepIndex === 0} className={buttonClass}>← Step</button>
          <button type="button" onClick={() => playback.setPlaying((current) => !current)} disabled={playback.atEnd} className="bg-accent px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">{playback.playing ? 'Pause' : 'Play'}</button>
          <button type="button" onClick={() => playback.setStepIndex((current) => Math.min(lastStep, current + 1))} disabled={playback.atEnd} className={buttonClass}>Step →</button>
          <button type="button" onClick={() => { playback.setStepIndex(lastStep); playback.setPlaying(false) }} disabled={playback.atEnd} className={buttonClass}>Finish</button>
          <button type="button" onClick={playback.reset} className={buttonClass}>Replay</button>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h3 className="eyebrow text-muted">Code table</h3>
            <div className="mt-3"><CodeTable report={report} /></div>
          </div>
          <div>
            <h3 className="eyebrow text-muted">Encoded bits · first {PREVIEW_UNITS} characters</h3>
            <div className="mt-3 border-y border-border py-4"><BitstreamPreview text={text} codes={report.codes} /></div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="eyebrow mb-3 text-muted">Size</h3>
          <SizeReport report={report} />
        </div>
      </div>
    </div>
  )
}

export default HuffmanLab

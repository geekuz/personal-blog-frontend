import { useEffect, useMemo, useState } from 'react'

const MAX_ITEMS = 18
const DEFAULT_ITEMS = ['pear', 'apple', 'fig', 'date', 'kiwi', 'banana', 'apple', 'grape']
const WORD_POOL = [
  'quartz', 'ember', 'atlas', 'pixel', 'cedar', 'lumen', 'orbit', 'delta', 'fjord',
  'maple', 'nova', 'river', 'signal', 'tango', 'violet', 'willow', 'xenon', 'zenith',
]

function compareValues(left, right) {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

const ALGORITHMS = {
  merge: { label: 'Merge', time: 'O(n log n)', space: 'O(n)', stable: 'Yes' },
  quick: { label: 'Quick', time: 'O(n log n) avg', space: 'O(log n)', stable: 'No' },
  heap: { label: 'Heap', time: 'O(n log n)', space: 'O(1)', stable: 'No' },
  radix: { label: 'MSD radix', time: '≈ O(n·k)', space: 'O(n)', stable: 'Yes' },
}

function recorder(initial) {
  const steps = []
  const metrics = { comparisons: 0, writes: 0, swaps: 0 }
  const record = (items, label, active = []) => {
    steps.push({ items: [...items], label, active: [...active], ...metrics })
  }
  record(initial, 'Input loaded')
  return { steps, metrics, record }
}

function mergeTrace(input) {
  const items = [...input]
  const aux = [...items]
  const { steps, metrics, record } = recorder(items)

  function sort(lo, hi) {
    if (lo >= hi) return
    const mid = lo + Math.floor((hi - lo) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    for (let index = lo; index <= hi; index += 1) aux[index] = items[index]
    let left = lo
    let right = mid + 1
    for (let target = lo; target <= hi; target += 1) {
      if (left > mid) {
        items[target] = aux[right++]
      } else if (right > hi) {
        items[target] = aux[left++]
      } else {
        metrics.comparisons += 1
        items[target] = compareValues(aux[right], aux[left]) < 0 ? aux[right++] : aux[left++]
      }
      metrics.writes += 1
      record(items, `Merge sorted runs ${lo + 1}–${mid + 1} and ${mid + 2}–${hi + 1}`, [target])
    }
  }

  sort(0, items.length - 1)
  record(items, 'Merge sort complete')
  return steps
}

function quickTrace(input) {
  const items = [...input]
  const { steps, metrics, record } = recorder(items)

  function swap(left, right, label) {
    if (left === right) return
    ;[items[left], items[right]] = [items[right], items[left]]
    metrics.swaps += 1
    metrics.writes += 2
    record(items, label, [left, right])
  }

  function insertionSort(lo, hi) {
    for (let index = lo + 1; index <= hi; index += 1) {
      const key = items[index]
      let cursor = index - 1
      while (cursor >= lo) {
        metrics.comparisons += 1
        if (compareValues(items[cursor], key) <= 0) break
        items[cursor + 1] = items[cursor]
        metrics.writes += 1
        record(items, `Insertion cutoff: shift ${items[cursor]} right`, [cursor, cursor + 1])
        cursor -= 1
      }
      items[cursor + 1] = key
      metrics.writes += 1
      record(items, `Insertion cutoff: place ${key}`, [cursor + 1])
    }
  }

  function partition(lo, hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    metrics.comparisons += 1
    if (compareValues(items[mid], items[lo]) < 0) swap(lo, mid, 'Order pivot candidates')
    metrics.comparisons += 1
    if (compareValues(items[hi], items[lo]) < 0) swap(lo, hi, 'Order pivot candidates')
    metrics.comparisons += 1
    if (compareValues(items[hi], items[mid]) < 0) swap(mid, hi, 'Order pivot candidates')
    swap(mid, hi, `Park median pivot ${items[mid]} at the end`)
    const pivot = items[hi]
    let boundary = lo - 1
    for (let cursor = lo; cursor < hi; cursor += 1) {
      metrics.comparisons += 1
      if (compareValues(items[cursor], pivot) <= 0) {
        boundary += 1
        swap(boundary, cursor, `Move ${items[cursor]} before pivot ${pivot}`)
      }
    }
    swap(boundary + 1, hi, `Place pivot ${pivot}`)
    return boundary + 1
  }

  function quicksort(start, end) {
    let lo = start
    let hi = end
    while (lo < hi) {
      if (hi - lo + 1 <= 16) {
        insertionSort(lo, hi)
        return
      }
      const pivot = partition(lo, hi)
      if (pivot - lo < hi - pivot) {
        quicksort(lo, pivot - 1)
        lo = pivot + 1
      } else {
        quicksort(pivot + 1, hi)
        hi = pivot - 1
      }
    }
  }

  quicksort(0, items.length - 1)
  record(items, 'Quick sort complete')
  return steps
}

function heapTrace(input) {
  const items = [...input]
  const { steps, metrics, record } = recorder(items)

  function swap(left, right, label) {
    ;[items[left], items[right]] = [items[right], items[left]]
    metrics.swaps += 1
    metrics.writes += 2
    record(items, label, [left, right])
  }

  function siftDown(start, size) {
    let root = start
    while (true) {
      const left = 2 * root + 1
      const right = left + 1
      let largest = root
      if (left < size) {
        metrics.comparisons += 1
        if (compareValues(items[left], items[largest]) > 0) largest = left
      }
      if (right < size) {
        metrics.comparisons += 1
        if (compareValues(items[right], items[largest]) > 0) largest = right
      }
      if (largest === root) return
      swap(root, largest, 'Sift the larger child toward the heap root')
      root = largest
    }
  }

  for (let index = Math.floor(items.length / 2) - 1; index >= 0; index -= 1) siftDown(index, items.length)
  record(items, 'Max heap built')
  for (let end = items.length - 1; end > 0; end -= 1) {
    swap(0, end, `Move maximum ${items[0]} into position ${end + 1}`)
    siftDown(0, end)
  }
  record(items, 'Heap sort complete')
  return steps
}

function radixTrace(input) {
  const items = [...input]
  const { steps, metrics, record } = recorder(items)

  function sortRange(start, values, depth) {
    if (values.length <= 1) return values
    const finished = []
    const buckets = new Map()
    for (const value of values) {
      if (depth >= value.length) finished.push(value)
      else {
        const key = value[depth]
        if (!buckets.has(key)) buckets.set(key, [])
        buckets.get(key).push(value)
      }
    }
    const orderedKeys = [...buckets.keys()].sort()
    const grouped = [...finished, ...orderedKeys.flatMap((key) => buckets.get(key))]
    items.splice(start, grouped.length, ...grouped)
    metrics.writes += grouped.length
    record(
      items,
      `Bucket positions ${start + 1}–${start + grouped.length} by character ${depth + 1}`,
      Array.from({ length: grouped.length }, (_, index) => start + index),
    )
    let offset = start + finished.length
    for (const key of orderedKeys) {
      const bucket = buckets.get(key)
      const sorted = sortRange(offset, bucket, depth + 1)
      offset += sorted.length
    }
    return items.slice(start, start + grouped.length)
  }

  sortRange(0, items, 0)
  record(items, 'MSD radix sort complete')
  return steps
}

function buildSortTrace(algorithm, input) {
  const builders = { merge: mergeTrace, quick: quickTrace, heap: heapTrace, radix: radixTrace }
  return builders[algorithm](input)
}

function parseLines(value) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
}

function SortAlgorithmLab() {
  const [algorithm, setAlgorithm] = useState('merge')
  const [values, setValues] = useState(DEFAULT_ITEMS)
  const [draft, setDraft] = useState(DEFAULT_ITEMS.join(', '))
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('normal')
  const [message, setMessage] = useState('')
  const trace = useMemo(() => buildSortTrace(algorithm, values), [algorithm, values])
  const step = trace[Math.min(stepIndex, trace.length - 1)]
  const atEnd = stepIndex >= trace.length - 1

  useEffect(() => {
    if (!playing || atEnd) return undefined
    const delay = { slow: 500, normal: 220, fast: 80 }[speed]
    const timer = window.setTimeout(() => {
      setStepIndex((current) => current + 1)
      if (stepIndex + 1 >= trace.length - 1) setPlaying(false)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [playing, atEnd, speed, stepIndex, trace.length])

  function restart(nextAlgorithm = algorithm, nextValues = values) {
    setAlgorithm(nextAlgorithm)
    setValues(nextValues)
    setStepIndex(0)
    setPlaying(false)
  }

  function applyInput() {
    const nextValues = parseLines(draft)
    if (nextValues.length < 2 || nextValues.length > MAX_ITEMS) {
      setMessage(`Enter between 2 and ${MAX_ITEMS} non-empty lines.`)
      return
    }
    setMessage('')
    restart(algorithm, nextValues)
  }

  function randomize() {
    const nextValues = [...WORD_POOL]
    for (let index = nextValues.length - 1; index > 0; index -= 1) {
      const selected = Math.floor(Math.random() * (index + 1))
      ;[nextValues[index], nextValues[selected]] = [nextValues[selected], nextValues[index]]
    }
    setDraft(nextValues.join(', '))
    setMessage('')
    restart(algorithm, nextValues)
  }

  return (
    <div className="mt-8 border border-border bg-surface">
      <div className="grid gap-6 border-b border-border p-5 sm:grid-cols-[minmax(0,1fr)_minmax(17rem,0.7fr)] sm:p-7">
        <div>
          <p className="eyebrow text-accent">Interactive algorithm lab</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            A browser model of the repository’s four lexicographic sorters. Each trace follows the same algorithmic decisions; it does not execute the Java CLI.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Algorithm selection">
            {Object.entries(ALGORITHMS).map(([id, details]) => (
              <button
                key={id}
                type="button"
                aria-pressed={algorithm === id}
                onClick={() => restart(id, values)}
                className={`border px-3 py-3 text-left transition-colors ${algorithm === id ? 'border-accent bg-bg text-heading' : 'border-border text-muted hover:border-heading'}`}
              >
                <span className="block text-sm font-semibold">{details.label}</span>
                <span className="mt-1 block font-mono text-[10px]">{details.time}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="sort-input" className="eyebrow text-muted">Lines to sort · 2–18</label>
          <textarea
            id="sort-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows="4"
            className="mt-2 w-full resize-none border border-border bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-heading outline-none focus:border-accent"
          />
          {message && <p role="alert" className="mt-2 text-xs text-red-600">{message}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={applyInput} className="bg-heading px-3 py-2 text-xs font-medium text-bg hover:bg-accent">Apply input</button>
            <button type="button" onClick={randomize} className="border border-border px-3 py-2 text-xs font-medium text-heading hover:border-heading">Generate 18 lines</button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div aria-live="polite">
            <p className="eyebrow text-muted">Step {stepIndex + 1} / {trace.length}</p>
            <p className="mt-2 text-sm font-medium text-heading">{step.label}</p>
          </div>
          <dl className="flex gap-5 font-mono text-[11px] text-muted">
            <div><dt>COMPARE</dt><dd className="mt-1 text-base text-heading">{step.comparisons}</dd></div>
            <div><dt>WRITE</dt><dd className="mt-1 text-base text-heading">{step.writes}</dd></div>
            <div><dt>SWAP</dt><dd className="mt-1 text-base text-heading">{step.swaps}</dd></div>
          </dl>
        </div>

        <ol className="mt-6 flex min-h-44 flex-wrap content-center gap-2 border-y border-border py-6" aria-label="Current line order">
          {step.items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className={`min-w-20 border px-3 py-3 transition-colors ${step.active.includes(index) ? 'border-accent bg-bg text-heading' : 'border-border text-muted'}`}
            >
              <span className="block font-mono text-[9px]">{String(index + 1).padStart(2, '0')}</span>
              <span className="mt-1 block text-sm font-medium">{item}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setStepIndex((current) => Math.max(0, current - 1))} disabled={stepIndex === 0} className="border border-border px-3 py-2 text-xs font-medium text-heading disabled:cursor-not-allowed disabled:opacity-40">← Step</button>
          <button type="button" onClick={() => setPlaying((current) => !current)} disabled={atEnd} className="bg-accent px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">{playing ? 'Pause' : 'Play'}</button>
          <button type="button" onClick={() => setStepIndex((current) => Math.min(trace.length - 1, current + 1))} disabled={atEnd} className="border border-border px-3 py-2 text-xs font-medium text-heading disabled:cursor-not-allowed disabled:opacity-40">Step →</button>
          <button type="button" onClick={() => { setStepIndex(trace.length - 1); setPlaying(false) }} disabled={atEnd} className="border border-border px-3 py-2 text-xs font-medium text-heading disabled:cursor-not-allowed disabled:opacity-40">Finish</button>
          <button type="button" onClick={() => { setStepIndex(0); setPlaying(false) }} className="border border-border px-3 py-2 text-xs font-medium text-heading">Replay</button>
          <label className="ml-auto flex items-center gap-2 text-xs text-muted">
            Speed
            <select value={speed} onChange={(event) => setSpeed(event.target.value)} className="border border-border bg-bg px-2 py-2 text-heading">
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </label>
        </div>

        <div className="mt-6 grid border-t border-border sm:grid-cols-4">
          {[
            ['Time', ALGORITHMS[algorithm].time],
            ['Extra space', ALGORITHMS[algorithm].space],
            ['Stable', ALGORITHMS[algorithm].stable],
            ['Repository detail', algorithm === 'quick' ? 'Insertion cutoff ≤ 16' : algorithm === 'radix' ? 'Sparse TreeMap buckets' : algorithm === 'merge' ? 'One reusable buffer' : 'Implicit max-heap'],
          ].map(([term, detail]) => (
            <div key={term} className="border-b border-border py-4 sm:border-b-0 sm:pr-4">
              <p className="eyebrow text-muted">{term}</p>
              <p className="mt-2 text-sm font-medium text-heading">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SortAlgorithmLab

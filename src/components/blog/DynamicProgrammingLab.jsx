import { useEffect, useMemo, useState } from 'react'

const MODES = {
  stairs: {
    label: '1 · Climbing stairs',
    eyebrow: 'One-dimensional DP',
    description: 'See repeated recursion collapse into one value per stair.',
    state: 'dp[i] = number of distinct ways to reach stair i',
    transition: 'dp[i] = dp[i − 1] + dp[i − 2]',
    order: 'Left to right, because i depends on two smaller indices',
    answer: 'dp[n]',
  },
  grid: {
    label: '2 · Grid paths',
    eyebrow: 'Two-dimensional DP',
    description: 'Fill a dependency grid and change the obstacles yourself.',
    state: 'dp[r][c] = paths from the start to cell (r, c)',
    transition: 'dp[r][c] = top + left; blocked cells contribute 0',
    order: 'Top to bottom, left to right',
    answer: 'dp[last row][last column]',
  },
  knapsack: {
    label: '3 · 0/1 knapsack',
    eyebrow: 'Choose-or-skip DP',
    description: 'Compare two decisions, then reconstruct the chosen items.',
    state: 'dp[i][c] = best value using the first i items with capacity c',
    transition: 'max(skip item i, take item i if it fits)',
    order: 'One item-row at a time; every cell reads the previous row',
    answer: 'dp[item count][capacity], followed backwards to recover choices',
  },
}

const ITEMS = [
  { name: 'Notebook', weight: 2, value: 3 },
  { name: 'Headphones', weight: 3, value: 4 },
  { name: 'Camera', weight: 4, value: 5 },
  { name: 'Jacket', weight: 5, value: 8 },
]

function copyGrid(grid) {
  return grid.map((row) => [...row])
}

function stairsTrace(count) {
  const values = Array(count + 1).fill(null)
  const steps = []
  values[0] = 1
  steps.push({ values: [...values], active: 0, dependencies: [], label: 'Base case: there is one way to remain at the ground.' })
  values[1] = 1
  steps.push({ values: [...values], active: 1, dependencies: [], label: 'Base case: one single step reaches stair 1.' })
  for (let stair = 2; stair <= count; stair += 1) {
    values[stair] = values[stair - 1] + values[stair - 2]
    steps.push({
      values: [...values],
      active: stair,
      dependencies: [stair - 2, stair - 1],
      label: `Stair ${stair}: ${values[stair - 1]} + ${values[stair - 2]} = ${values[stair]}`,
    })
  }
  return steps
}

function gridTrace(rows, columns, obstacles) {
  const values = Array.from({ length: rows }, () => Array(columns).fill(null))
  const steps = []
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const key = `${row}-${column}`
      const dependencies = []
      if (row > 0) dependencies.push(`${row - 1}-${column}`)
      if (column > 0) dependencies.push(`${row}-${column - 1}`)
      if (obstacles.has(key)) {
        values[row][column] = 0
        steps.push({ values: copyGrid(values), active: key, dependencies, label: `Cell (${row + 1}, ${column + 1}) is blocked, so it stores 0.` })
        continue
      }
      if (row === 0 && column === 0) {
        values[row][column] = 1
        steps.push({ values: copyGrid(values), active: key, dependencies: [], label: 'Seed the starting cell with one path.' })
        continue
      }
      const top = row > 0 ? values[row - 1][column] : 0
      const left = column > 0 ? values[row][column - 1] : 0
      values[row][column] = top + left
      steps.push({
        values: copyGrid(values), active: key, dependencies,
        label: `Cell (${row + 1}, ${column + 1}): top ${top} + left ${left} = ${top + left}`,
      })
    }
  }
  return steps
}

function knapsackTrace(capacity) {
  const values = Array.from({ length: ITEMS.length + 1 }, () => Array(capacity + 1).fill(0))
  const steps = [{ values: copyGrid(values), active: null, dependencies: [], label: 'Base row: with no items, every capacity has value 0.' }]
  for (let itemIndex = 1; itemIndex <= ITEMS.length; itemIndex += 1) {
    const item = ITEMS[itemIndex - 1]
    for (let currentCapacity = 0; currentCapacity <= capacity; currentCapacity += 1) {
      const skip = values[itemIndex - 1][currentCapacity]
      const canTake = item.weight <= currentCapacity
      const take = canTake ? item.value + values[itemIndex - 1][currentCapacity - item.weight] : Number.NEGATIVE_INFINITY
      values[itemIndex][currentCapacity] = Math.max(skip, take)
      const dependencies = [`${itemIndex - 1}-${currentCapacity}`]
      if (canTake) dependencies.push(`${itemIndex - 1}-${currentCapacity - item.weight}`)
      steps.push({
        values: copyGrid(values),
        active: `${itemIndex}-${currentCapacity}`,
        dependencies,
        label: canTake
          ? `${item.name} at capacity ${currentCapacity}: max(skip ${skip}, take ${take}) = ${values[itemIndex][currentCapacity]}`
          : `${item.name} weighs ${item.weight}, so capacity ${currentCapacity} can only skip it (${skip}).`,
      })
    }
  }
  return steps
}

function reconstructItems(values, capacity) {
  const chosen = []
  let remaining = capacity
  for (let row = ITEMS.length; row > 0; row -= 1) {
    if (values[row][remaining] !== values[row - 1][remaining]) {
      chosen.push(ITEMS[row - 1])
      remaining -= ITEMS[row - 1].weight
    }
  }
  return chosen.reverse()
}

function Cell({ active, dependency, children }) {
  const emphasis = active
    ? 'border-accent bg-accent-soft text-heading ring-2 ring-accent/20'
    : dependency
      ? 'border-border-strong bg-surface-raised text-heading'
      : 'border-border bg-surface text-muted'
  return <span className={`flex min-h-12 min-w-12 items-center justify-center rounded-md border px-2 font-mono text-sm ${emphasis}`}>{children}</span>
}

function StairsView({ step, count }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Climbing stairs dynamic programming table">
      {Array.from({ length: count + 1 }, (_, index) => (
        <div key={index} className="text-center">
          <Cell active={step.active === index} dependency={step.dependencies.includes(index)}>{step.values[index] ?? '·'}</Cell>
          <span className="mt-1 block font-mono text-xs text-muted">{index}</span>
        </div>
      ))}
    </div>
  )
}

function GridView({ step, rows, columns, obstacles }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-center font-mono text-sm">
        <caption className="sr-only">Path count table</caption>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }, (_, column) => {
                const key = `${row}-${column}`
                const isObstacle = obstacles.has(key)
                return (
                  <td key={key} className="p-0">
                    <Cell active={step.active === key} dependency={step.dependencies.includes(key)}>
                      {isObstacle ? '×' : (step.values[row][column] ?? '·')}
                    </Cell>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KnapsackView({ step, capacity }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[34rem] border-separate border-spacing-1 text-center font-mono text-xs">
        <caption className="sr-only">Zero-one knapsack value table</caption>
        <thead>
          <tr><th className="px-2 text-left text-muted">item \ cap</th>{Array.from({ length: capacity + 1 }, (_, value) => <th key={value} className="text-muted">{value}</th>)}</tr>
        </thead>
        <tbody>
          {step.values.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th className="whitespace-nowrap px-2 text-left font-sans font-medium text-muted">{rowIndex === 0 ? 'None' : ITEMS[rowIndex - 1].name}</th>
              {row.map((value, column) => {
                const key = `${rowIndex}-${column}`
                return <td key={key} className="p-0"><Cell active={step.active === key} dependency={step.dependencies.includes(key)}>{value}</Cell></td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DynamicProgrammingLab() {
  const [mode, setMode] = useState('stairs')
  const [stairCount, setStairCount] = useState(7)
  const [obstacles, setObstacles] = useState(() => new Set(['1-1', '2-3']))
  const [capacity, setCapacity] = useState(7)
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rows = 4
  const columns = 5

  const trace = useMemo(() => {
    if (mode === 'stairs') return stairsTrace(stairCount)
    if (mode === 'grid') return gridTrace(rows, columns, obstacles)
    return knapsackTrace(capacity)
  }, [mode, stairCount, obstacles, capacity])
  const step = trace[stepIndex]
  const isComplete = stepIndex === trace.length - 1

  useEffect(() => {
    if (!playing || isComplete) return undefined
    const timer = window.setTimeout(() => setStepIndex((current) => Math.min(current + 1, trace.length - 1)), 450)
    return () => window.clearTimeout(timer)
  }, [playing, isComplete, trace.length, stepIndex])

  function reset(nextMode = mode) {
    setMode(nextMode)
    setStepIndex(0)
    setPlaying(false)
  }

  function toggleObstacle(key) {
    setObstacles((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setStepIndex(0)
    setPlaying(false)
  }

  const selectedItems = mode === 'knapsack' && isComplete ? reconstructItems(step.values, capacity) : []
  const result = mode === 'stairs'
    ? step.values[stairCount]
    : mode === 'grid'
      ? step.values[rows - 1][columns - 1]
      : step.values[ITEMS.length][capacity]

  return (
    <section aria-labelledby="dp-workbench-title" className="mt-8 min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-surface-raised p-4 shadow-sm sm:p-6">
      <div className="max-w-2xl">
        <p className="eyebrow text-accent">Interactive practice</p>
        <h3 id="dp-workbench-title" className="mt-2 text-2xl font-semibold tracking-tight text-heading">Build the table one dependency at a time</h3>
        <p className="mt-3 leading-relaxed text-muted">The highlighted cell is being solved now. Outlined cells are the states it reads. Change the problem, step manually, or let the complete evaluation order play.</p>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-3" role="group" aria-label="Dynamic programming examples">
        {Object.entries(MODES).map(([key, option]) => (
          <button key={key} type="button" aria-pressed={mode === key} onClick={() => reset(key)} className={`rounded-lg border p-3 text-left transition-colors ${mode === key ? 'border-accent bg-accent-soft text-heading' : 'border-border bg-surface text-muted hover:border-border-strong hover:text-heading'}`}>
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="mt-1 block text-xs leading-relaxed">{option.description}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 rounded-lg border border-border bg-surface p-4 sm:p-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-muted">{MODES[mode].eyebrow}</p>
              {mode === 'stairs' && <label className="mt-2 block text-sm font-medium text-heading">Target stair: <span className="font-mono">{stairCount}</span><input className="mt-2 block w-52 accent-[var(--color-accent)]" type="range" min="3" max="12" value={stairCount} onChange={(event) => { setStairCount(Number(event.target.value)); setStepIndex(0); setPlaying(false) }} /></label>}
              {mode === 'knapsack' && <label className="mt-2 block text-sm font-medium text-heading">Capacity: <span className="font-mono">{capacity}</span><input className="mt-2 block w-52 accent-[var(--color-accent)]" type="range" min="4" max="10" value={capacity} onChange={(event) => { setCapacity(Number(event.target.value)); setStepIndex(0); setPlaying(false) }} /></label>}
              {mode === 'grid' && <p className="mt-2 text-sm text-muted">Toggle walls, then rerun the table.</p>}
            </div>
            <p className="font-mono text-xs text-muted">Step {stepIndex + 1} / {trace.length}</p>
          </div>

          {mode === 'grid' && (
            <div className="mb-5 flex flex-wrap gap-1" role="group" aria-label="Grid obstacle controls">
              {Array.from({ length: rows * columns }, (_, index) => {
                const row = Math.floor(index / columns)
                const column = index % columns
                const key = `${row}-${column}`
                const fixed = key === '0-0' || key === `${rows - 1}-${columns - 1}`
                return <button key={key} type="button" disabled={fixed} aria-pressed={obstacles.has(key)} aria-label={`Cell ${row + 1}, ${column + 1}${obstacles.has(key) ? ', blocked' : ', open'}`} onClick={() => toggleObstacle(key)} className={`h-8 w-8 rounded border text-xs ${fixed ? 'cursor-not-allowed border-border bg-surface-raised text-muted' : obstacles.has(key) ? 'border-accent bg-accent text-white' : 'border-border bg-surface text-muted hover:border-border-strong'}`}>{obstacles.has(key) ? '×' : '·'}</button>
              })}
            </div>
          )}

          {mode === 'stairs' && <StairsView step={step} count={stairCount} />}
          {mode === 'grid' && <GridView step={step} rows={rows} columns={columns} obstacles={obstacles} />}
          {mode === 'knapsack' && <KnapsackView step={step} capacity={capacity} />}

          <div className="mt-5 min-h-16 rounded-lg border border-border bg-surface-raised p-3" aria-live="polite">
            <p className="text-sm font-medium text-heading">{step.label}</p>
            {isComplete && <p className="mt-1 text-sm text-accent">Answer: {result}{selectedItems.length > 0 ? ` — choose ${selectedItems.map((item) => item.name).join(' + ')}` : ''}</p>}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setStepIndex((current) => Math.min(current + 1, trace.length - 1))} disabled={isComplete} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">Next step</button>
            <button type="button" onClick={() => setPlaying((current) => !current)} disabled={isComplete} className="rounded-md border border-border-strong px-4 py-2 text-sm font-semibold text-heading disabled:cursor-not-allowed disabled:opacity-45">{playing ? 'Pause' : 'Play'}</button>
            <button type="button" onClick={() => { setStepIndex(trace.length - 1); setPlaying(false) }} disabled={isComplete} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted disabled:cursor-not-allowed disabled:opacity-45">Finish</button>
            <button type="button" onClick={() => reset()} className="rounded-md px-4 py-2 text-sm font-medium text-muted hover:text-heading">Reset</button>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-surface p-4">
          <h4 className="text-sm font-semibold text-heading">The four questions</h4>
          <dl className="mt-4 space-y-4 text-sm">
            <div><dt className="font-semibold text-heading">1. State</dt><dd className="mt-1 leading-relaxed text-muted">{MODES[mode].state}</dd></div>
            <div><dt className="font-semibold text-heading">2. Transition</dt><dd className="mt-1 font-mono text-xs leading-relaxed text-muted">{MODES[mode].transition}</dd></div>
            <div><dt className="font-semibold text-heading">3. Order</dt><dd className="mt-1 leading-relaxed text-muted">{MODES[mode].order}</dd></div>
            <div><dt className="font-semibold text-heading">4. Answer</dt><dd className="mt-1 font-mono text-xs leading-relaxed text-muted">{MODES[mode].answer}</dd></div>
          </dl>
          {mode === 'knapsack' && <div className="mt-5 border-t border-border pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">Items</p><ul className="mt-2 space-y-1 text-sm text-muted">{ITEMS.map((item) => <li key={item.name}>{item.name}: weight {item.weight}, value {item.value}</li>)}</ul></div>}
        </aside>
      </div>
    </section>
  )
}

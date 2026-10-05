// Browser model of the Java Huffman tool (github.com/geekuz/BYO-compression-tool).
//
// It mirrors the repository's rules exactly so the lab produces the same codes
// and the same HUF1 file size as the real encoder:
//  - symbols are UTF-16 code units, like Java `char` (an emoji counts as two);
//  - the two lowest nodes merge first, ties broken by the smallest symbol in
//    each subtree, and the first node polled becomes the left (0) child;
//  - a single-symbol input gets the one-bit code "0";
//  - the file is a 4-byte magic + 4-byte count + 10 bytes per distinct symbol,
//    followed by the bitstream packed MSB-first with a zero-padded last byte.

export const MAGIC_BYTES = 4
export const COUNT_BYTES = 4
export const ENTRY_BYTES = 10

export function countFrequencies(text) {
  const frequencies = new Map()
  for (let index = 0; index < text.length; index++) {
    const symbol = text.charCodeAt(index)
    frequencies.set(symbol, (frequencies.get(symbol) ?? 0) + 1)
  }
  return frequencies
}

// Same ordering as the Java comparator: frequency, then smallest contained symbol.
function compareNodes(left, right) {
  return left.frequency - right.frequency || left.minSymbol - right.minSymbol
}

function leaf(id, symbol, frequency) {
  return { id, symbol, frequency, minSymbol: symbol }
}

function internal(id, left, right) {
  return {
    id,
    left,
    right,
    frequency: left.frequency + right.frequency,
    minSymbol: Math.min(left.minSymbol, right.minSymbol),
  }
}

export function isLeaf(node) {
  return node.symbol !== undefined
}

// Builds the tree and records the queue after every merge, so the lab can
// replay the construction. Each step's `forest` is listed in priority order:
// the first two entries are the next pair to merge.
export function buildTreeTrace(frequencies) {
  let nextId = 0
  let queue = [...frequencies]
    .map(([symbol, frequency]) => leaf(nextId++, symbol, frequency))
    .sort(compareNodes)

  const steps = [{ forest: queue, merged: null }]
  while (queue.length > 1) {
    const [left, right, ...rest] = queue
    const parent = internal(nextId++, left, right)
    queue = [...rest, parent].sort(compareNodes)
    steps.push({ forest: queue, merged: { left, right, parent } })
  }

  return { root: queue[0] ?? null, steps }
}

export function buildCodeTable(root) {
  const codes = new Map()
  if (!root) return codes
  if (isLeaf(root)) {
    codes.set(root.symbol, '0')
    return codes
  }

  function walk(node, path) {
    if (isLeaf(node)) {
      codes.set(node.symbol, path)
      return
    }
    walk(node.left, `${path}0`)
    walk(node.right, `${path}1`)
  }

  walk(root, '')
  return codes
}

export function encodeBits(text, codes) {
  let bits = ''
  for (let index = 0; index < text.length; index++) {
    bits += codes.get(text.charCodeAt(index))
  }
  return bits
}

// The decoder stops after `total` symbols, so trailing pad bits are ignored.
export function decodeBits(bits, root, total) {
  if (!root || total === 0) return ''
  if (isLeaf(root)) return String.fromCharCode(root.symbol).repeat(total)

  const units = []
  let node = root
  for (const bit of bits) {
    if (units.length === total) break
    node = bit === '0' ? node.left : node.right
    if (isLeaf(node)) {
      units.push(node.symbol)
      node = root
    }
  }
  if (units.length !== total) {
    throw new Error(`Corrupt payload: decoded ${units.length} of ${total} characters`)
  }
  return String.fromCharCode(...units)
}

export function compressionReport(text) {
  const frequencies = countFrequencies(text)
  const { root, steps } = buildTreeTrace(frequencies)
  const codes = buildCodeTable(root)
  const bits = encodeBits(text, codes)
  const headerBytes = MAGIC_BYTES + COUNT_BYTES + ENTRY_BYTES * frequencies.size
  const payloadBytes = Math.ceil(bits.length / 8)
  const decoded = decodeBits(bits, root, text.length)

  return {
    frequencies,
    root,
    steps,
    codes,
    bits,
    originalBytes: new TextEncoder().encode(text).length,
    headerBytes,
    payloadBytes,
    fileBytes: headerBytes + payloadBytes,
    roundTrip: decoded === text,
  }
}

const SPECIAL_SYMBOLS = { 32: '␣', 10: '↵', 13: '␍', 9: '⇥' }

// Readable label for a code unit; lone surrogate halves are shown as U+XXXX.
export function describeSymbol(symbol) {
  if (SPECIAL_SYMBOLS[symbol]) return SPECIAL_SYMBOLS[symbol]
  if (symbol < 32 || (symbol >= 0xd800 && symbol <= 0xdfff)) {
    return `U+${symbol.toString(16).toUpperCase().padStart(4, '0')}`
  }
  return String.fromCharCode(symbol)
}

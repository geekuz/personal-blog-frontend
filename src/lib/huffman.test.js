import { describe, expect, it } from 'vitest'
import { buildTreeTrace, compressionReport, countFrequencies, decodeBits, describeSymbol } from './huffman'

// Produced by the repository's own Java classes (FrequencyCounter, HuffmanTree,
// CodeTable, HuffmanEncoder) on JDK 21. Keys are UTF-16 code units; fileBytes is
// the size of the real .huf file written by HuffmanEncoder.
const JAVA_REFERENCE = [
  { text: 'abracadabra', fileBytes: 61, codes: { 97: '0', 98: '110', 99: '1110', 100: '1111', 114: '10' } },
  { text: 'mississippi river', fileBytes: 94, codes: { 32: '0000', 101: '0001', 105: '11', 109: '0010', 112: '010', 114: '011', 115: '10', 118: '0011' } },
  { text: 'aaaa', fileBytes: 19, codes: { 97: '0' } },
  {
    text: 'she sells sea shells by the sea shore',
    fileBytes: 133,
    codes: { 32: '110', 97: '11101', 98: '111100', 101: '00', 104: '010', 108: '011', 111: '111101', 114: '111110', 115: '10', 116: '111111', 121: '11100' },
  },
  {
    text: 'Les Misérables — 2026 ✓',
    fileBytes: 180,
    codes: { 32: '101', 48: '11000', 50: '1101', 54: '11001', 76: '11100', 77: '11101', 97: '11110', 98: '11111', 101: '000', 105: '0010', 108: '0011', 114: '0100', 115: '100', 233: '0101', 8212: '0110', 10003: '0111' },
  },
]

describe('huffman model', () => {
  it.each(JAVA_REFERENCE)('matches the Java encoder for "$text"', ({ text, fileBytes, codes }) => {
    const report = compressionReport(text)

    expect(Object.fromEntries(report.codes)).toEqual(Object.fromEntries(Object.entries(codes).map(([key, code]) => [Number(key), code])))
    expect(report.fileBytes).toBe(fileBytes)
    expect(report.roundTrip).toBe(true)
  })

  it('counts UTF-16 code units like Java char, so an emoji is two symbols', () => {
    expect(countFrequencies('a😀a').size).toBe(3)
    expect(compressionReport('a😀a').roundTrip).toBe(true)
  })

  it('records one merge per step and lists the next pair first', () => {
    const { steps, root } = buildTreeTrace(countFrequencies('abracadabra'))

    expect(steps).toHaveLength(5)
    expect(steps[0].forest.map((node) => node.frequency)).toEqual([1, 1, 2, 2, 5])
    expect(steps[1].merged.parent.frequency).toBe(2)
    expect(steps.at(-1).forest).toEqual([root])
    expect(root.frequency).toBe(11)
  })

  it('writes a header-only file for empty input', () => {
    const report = compressionReport('')

    expect(report.root).toBeNull()
    expect(report.fileBytes).toBe(8)
    expect(report.roundTrip).toBe(true)
  })

  it('rejects a payload that ends before every character is decoded', () => {
    const { root } = buildTreeTrace(countFrequencies('abracadabra'))
    expect(() => decodeBits('0110', root, 11)).toThrow(/Corrupt payload/)
  })

  it('labels whitespace and surrogate halves readably', () => {
    expect(describeSymbol(32)).toBe('␣')
    expect(describeSymbol(10)).toBe('↵')
    expect(describeSymbol(0xd83d)).toBe('U+D83D')
    expect(describeSymbol(233)).toBe('é')
  })
})

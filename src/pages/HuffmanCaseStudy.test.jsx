import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HuffmanCaseStudy from './HuffmanCaseStudy'

describe('HuffmanCaseStudy', () => {
  it('presents the verified architecture, format, lab and evidence', () => {
    render(<MemoryRouter><HuffmanCaseStudy /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: 'Building a Huffman compressor' })).toBeInTheDocument()
    expect(screen.getByTitle('Huffman compression architecture')).toHaveAttribute('src', '/diagrams/huffman-architecture.html')
    expect(screen.getByRole('link', { name: 'Lab' })).toHaveAttribute('href', '#lab')
    expect(screen.getByRole('heading', { name: 'HUF1: a header, then bits' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '37 tests' })).toBeInTheDocument()
    expect(screen.getByText(/one commit on 15 June 2026/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Source code/i })).toHaveAttribute('href', 'https://github.com/geekuz/BYO-compression-tool')
  })
})

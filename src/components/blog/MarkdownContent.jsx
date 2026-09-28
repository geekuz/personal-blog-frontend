import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

function textContent(node) {
  if (node.type === 'text') return node.value
  return node.children?.map(textContent).join('') ?? ''
}

function rehypeTableOfContents() {
  return (tree) => {
    const headings = []

    function collect(node) {
      if (node.type === 'element' && ['h2', 'h3'].includes(node.tagName) && node.properties?.id) {
        headings.push({
          id: String(node.properties.id),
          label: textContent(node),
          level: Number(node.tagName.slice(1)),
        })
      }
      node.children?.forEach(collect)
    }

    collect(tree)
    if (headings.length < 2) return

    tree.children.unshift({
      type: 'element',
      tagName: 'nav',
      properties: { ariaLabel: 'Table of contents', className: ['post-toc'] },
      children: [
        { type: 'element', tagName: 'p', properties: { className: ['post-toc-title'] }, children: [{ type: 'text', value: 'On this page' }] },
        {
          type: 'element',
          tagName: 'ol',
          properties: {},
          children: headings.map((heading) => ({
            type: 'element',
            tagName: 'li',
            properties: { className: [`post-toc-level-${heading.level}`] },
            children: [{
              type: 'element',
              tagName: 'a',
              properties: { href: `#${heading.id}` },
              children: [{ type: 'text', value: heading.label }],
            }],
          })),
        },
      ],
    })
  }
}

function nodeText(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  return node?.props ? nodeText(node.props.children) : ''
}

function CodeBlock({ children }) {
  const [status, setStatus] = useState('idle')
  const code = nodeText(children).replace(/\n$/, '')

  useEffect(() => {
    if (status !== 'copied') return undefined
    const timeout = window.setTimeout(() => setStatus('idle'), 2000)
    return () => window.clearTimeout(timeout)
  }, [status])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="code-block">
      <button type="button" className="code-copy" onClick={copy}>
        {status === 'copied' ? 'Copied!' : status === 'error' ? 'Copy failed' : 'Copy code'}
      </button>
      <pre>{children}</pre>
    </div>
  )
}

function LinkedHeading({ level, id, children }) {
  const Tag = `h${level}`
  if (!id) return <Tag>{children}</Tag>
  return <Tag id={id}><a className="heading-anchor" href={`#${id}`}>{children}</a></Tag>
}

const components = {
  pre: CodeBlock,
  h2: (props) => <LinkedHeading level={2} {...props} />,
  h3: (props) => <LinkedHeading level={3} {...props} />,
  h4: (props) => <LinkedHeading level={4} {...props} />,
}

function MarkdownContent({ children, tableOfContents = false }) {
  const rehypePlugins = [
    [rehypeSlug, { prefix: 'post-' }],
    [rehypeHighlight, { detect: true }],
    ...(tableOfContents ? [rehypeTableOfContents] : []),
  ]

  return (
    <div className="post-content prose prose-zinc max-w-none dark:prose-invert prose-a:text-accent">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins} components={components}>{children}</ReactMarkdown>
    </div>
  )
}

export default MarkdownContent

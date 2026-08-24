import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function MarkdownContent({ children }) {
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert prose-a:text-accent">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}

export default MarkdownContent

import { useState } from 'react'

function CoverImage({ src, alt, className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null)

  if (!src) return null
  if (failedSrc === src) {
    return <p role="status" className="rounded-lg border border-border bg-background p-4 text-sm text-muted">Cover image could not be loaded.</p>
  }

  return <img src={src} alt={alt} onError={() => setFailedSrc(src)} className={className} />
}

export default CoverImage

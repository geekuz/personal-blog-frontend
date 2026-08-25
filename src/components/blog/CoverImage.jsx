import { useState } from 'react'

function CoverImageLoader({ src, alt, className }) {
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <p role="status" className="rounded-lg border border-border bg-background p-4 text-sm text-muted">Cover image could not be loaded.</p>
  }

  const handleError = () => {
    if (attempt === 0) {
      setAttempt(1)
    } else {
      setFailed(true)
    }
  }

  return <img key={attempt} src={src} alt={alt} onError={handleError} className={className} />
}

function CoverImage({ src, alt, className = '' }) {
  if (!src) return null

  return <CoverImageLoader key={src} src={src} alt={alt} className={className} />
}

export default CoverImage

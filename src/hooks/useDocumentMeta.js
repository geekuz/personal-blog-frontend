import { useEffect } from 'react'

const DEFAULT_TITLE = 'otabek.dev — Writing'
const DEFAULT_DESCRIPTION = "Otabek's blog — learning React by building it."

function getDescriptionElement() {
  let element = document.querySelector('meta[name="description"]')
  if (!element) {
    element = document.createElement('meta')
    element.name = 'description'
    document.head.appendChild(element)
  }
  return element
}

function getRobotsElement() {
  let element = document.querySelector('meta[name="robots"]')
  if (!element) {
    element = document.createElement('meta')
    element.name = 'robots'
    document.head.appendChild(element)
  }
  return element
}

export function useDocumentMeta({ title, description, robots = 'index,follow' } = {}) {
  useEffect(() => {
    document.title = title ?? DEFAULT_TITLE
    const descriptionElement = getDescriptionElement()
    descriptionElement.content = description ?? DEFAULT_DESCRIPTION
    const robotsElement = getRobotsElement()
    robotsElement.content = robots

    return () => {
      document.title = DEFAULT_TITLE
      descriptionElement.content = DEFAULT_DESCRIPTION
      robotsElement.content = 'index,follow'
    }
  }, [title, description, robots])
}

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PostList from '../components/blog/PostList'
import DebouncedSearchBar from '../components/blog/DebouncedSearchBar'
import TagFilter from '../components/blog/TagFilter'
import Pagination from '../components/blog/Pagination'
import StatusMessage from '../components/ui/StatusMessage'
import { getPosts, getTags } from '../api/posts'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const PAGE_SIZE = 6

function readPage(value) {
  const page = Number.parseInt(value ?? '0', 10)
  return Number.isFinite(page) && page >= 0 ? page : 0
}

function Home() {
  useDocumentMeta()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const activeTag = searchParams.get('tag') ?? null
  const page = readPage(searchParams.get('page'))
  const [resource, setResource] = useState(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const requestKey = `${query}\u0000${activeTag ?? ''}\u0000${page}\u0000${requestVersion}`
  const currentResource = resource?.key === requestKey ? resource : null
  const result = currentResource?.result ?? null
  const tags = currentResource?.tags ?? []
  const error = currentResource?.error ?? null
  const isLoading = !currentResource

  const commitSearch = useCallback((value) => {
    setSearchParams((current) => {
      const currentQuery = current.get('q') ?? ''
      if (value.trim() === currentQuery) return current
      const next = new URLSearchParams(current)
      if (value.trim()) next.set('q', value.trim())
      else next.delete('q')
      next.delete('page')
      return next
    }, { replace: true })
  }, [setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getPosts({
        page,
        size: PAGE_SIZE,
        query,
        tag: activeTag ?? '',
        signal: controller.signal,
      }),
      getTags({ signal: controller.signal }),
    ])
      .then(([postsResponse, tagsResponse]) => {
        if (controller.signal.aborted) return

        if (page > 0 && page >= postsResponse.totalPages) {
          setSearchParams((current) => {
            const next = new URLSearchParams(current)
            const lastPage = Math.max(0, postsResponse.totalPages - 1)
            if (lastPage > 0) next.set('page', String(lastPage))
            else next.delete('page')
            return next
          }, { replace: true })
          return
        }

        setResource({
          key: requestKey,
          result: postsResponse,
          tags: tagsResponse.items,
          error: null,
        })
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && requestError.name !== 'AbortError') {
          setResource({ key: requestKey, result: null, tags: [], error: requestError })
        }
      })

    return () => controller.abort()
  }, [query, activeTag, page, requestVersion, requestKey, setSearchParams])

  function selectTag(tag) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (tag) next.set('tag', tag)
      else next.delete('tag')
      next.delete('page')
      return next
    })
  }

  function selectPage(nextPage) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (nextPage > 0) next.set('page', String(nextPage))
      else next.delete('page')
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-heading">Writing</h1>
        <p className="mt-2 text-muted">
          Notes on learning React by building this blog.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4">
        <DebouncedSearchBar
          key={query}
          initialValue={query}
          onCommit={commitSearch}
        />
        <TagFilter
          tags={tags.map((tag) => tag.slug)}
          activeTag={activeTag}
          onSelect={selectTag}
        />
      </div>

      {isLoading && (
        <StatusMessage title="Loading posts…">
          Fetching the latest writing.
        </StatusMessage>
      )}
      {error && (
        <StatusMessage
          title="Posts could not be loaded"
          actionLabel="Try again"
          onAction={() => setRequestVersion((version) => version + 1)}
        >
          Check your connection and try again.
        </StatusMessage>
      )}
      {result && (
        <>
          <PostList
            posts={result.items}
            emptyMessage="No posts match these filters. Try another search or tag."
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={selectPage}
          />
        </>
      )}
    </>
  )
}

export default Home

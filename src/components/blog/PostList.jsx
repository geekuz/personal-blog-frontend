import PostCard from './PostCard'

// PostList takes an array of posts and renders one PostCard per item.
//
// Two key React ideas here:
//  1. We render a list by calling posts.map(...) and returning an element each.
//  2. Every item needs a stable, unique `key` so React can tell items apart
//     across re-renders. We use post.slug — never the array index, which can
//     change when the list is filtered or reordered (Phase 5).
//
// We also handle the empty case explicitly so the UI never looks broken.
function PostList({ posts, emptyMessage = 'No posts found.' }) {
  if (posts.length === 0) {
    return <p className="text-muted">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}

export default PostList

import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

// lazy() defers loading a page's code until that route is actually visited.
// Vite turns each lazy import into a separate JS chunk. Result: the home page no
// longer ships the Markdown renderer — that code only loads when you open a post.
// This is what clears the "chunk larger than 500 kB" build warning.
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const PostPage = lazy(() => import('./pages/PostPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Because the pages are now lazy, React needs a <Suspense> boundary to show a
// fallback while a chunk downloads. We put that boundary inside Layout (around
// <Outlet/>) so the Header/Footer stay on screen during the brief load.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog/:slug" element={<PostPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App

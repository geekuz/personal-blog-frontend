import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// Layout is the route layout: Header + Footer stay fixed while <Outlet/> swaps
// in the matched page. The <Suspense> boundary shows `fallback` for the split
// second a lazily-loaded page chunk is downloading (see App.jsx).
function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default Layout

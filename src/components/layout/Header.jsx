import { NavLink } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'
import { useAuth } from '../../auth/useAuth'

// NavLink is like a smart <a>: it navigates without reloading the page, AND it
// knows when its `to` matches the current URL so we can style the active link.
// The className prop can be a function receiving { isActive }.
// The active link gets a hairline underline, drawn with ::after, that sits on
// the header's bottom border.
function navClass({ isActive }) {
  const base =
    'relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-[1.1rem] after:h-px after:transition-colors'
  return isActive
    ? `${base} text-heading after:bg-heading`
    : `${base} text-muted after:bg-transparent hover:text-heading`
}

function Header() {
  const { user, isLoading } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <NavLink
          to="/"
          className="group flex items-center gap-2.5 font-mono text-sm font-medium tracking-tight text-heading"
        >
          <span
            aria-hidden="true"
            className="grid size-5 place-items-center bg-heading text-[10px] font-semibold text-bg transition-colors group-hover:bg-accent"
          >
            O
          </span>
          <span>
            otabek<span className="text-muted">.dev</span>
          </span>
        </NavLink>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-3 text-[13px] sm:gap-7"
        >
          {/* `end` makes "/" active only on the exact home path, not on /about */}
          <NavLink to="/" end className={({ isActive }) => `${navClass({ isActive })} hidden sm:block`}>
            Home
          </NavLink>
          <NavLink to="/projects" className={navClass}>
            Projects
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          {!isLoading && (
            <NavLink to={user ? '/account' : '/login'} className={navClass}>
              {user ? 'Account' : 'Log in'}
            </NavLink>
          )}
          {!isLoading && user?.roles.includes('ADMIN') && (
            <NavLink to="/admin" className={navClass}>Admin</NavLink>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

export default Header

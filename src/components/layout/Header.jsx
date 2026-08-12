import { NavLink } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

// NavLink is like a smart <a>: it navigates without reloading the page, AND it
// knows when its `to` matches the current URL so we can style the active link.
// The className prop can be a function receiving { isActive }.
function navClass({ isActive }) {
  return isActive
    ? 'text-accent'
    : 'text-muted transition-colors hover:text-accent'
}

function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <NavLink to="/" className="text-lg font-bold tracking-tight text-heading">
          otabek<span className="text-accent">.dev</span>
        </NavLink>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-6 text-sm"
        >
          {/* `end` makes "/" active only on the exact home path, not on /about */}
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

export default Header

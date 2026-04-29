import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors duration-200 ${
      location.pathname === path
        ? 'text-accent-blue'
        : 'text-text-secondary hover:text-text-primary'
    }`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-void/90 backdrop-blur-md border-b border-border-custom/60'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <Zap className="w-5 h-5 text-accent-blue group-hover:scale-110 transition-transform" />
            <span className="text-base font-semibold tracking-tight">Convoy</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkClass('/')}>Overview</Link>
            <Link to="/docs" className={linkClass('/docs')}>Docs</Link>
            <a
              href="https://github.com/teckedd-code2save/convoy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>

          <button
            className="md:hidden text-text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-void/95 backdrop-blur-md border-b border-border-custom">
          <div className="px-5 py-4 flex flex-col gap-3">
            <Link to="/" className={linkClass('/')}>Overview</Link>
            <Link to="/docs" className={linkClass('/docs')}>Docs</Link>
            <a
              href="https://github.com/teckedd-code2save/convoy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-text-secondary"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

import { GitHubIcon } from './GitHubIcon'
import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border-custom bg-void">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-blue" />
            <span className="text-base font-semibold">Convoy</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
            <Link to="/" className="hover:text-text-primary transition-colors">Overview</Link>
            <Link to="/docs" className="hover:text-text-primary transition-colors">Documentation</Link>
            <a
              href="https://github.com/teckedd-code2save/convoy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-text-tertiary">
          <span>Built at the frontier. Deployed with Convoy.</span>
          <span>Licensed under MIT.</span>
        </div>
      </div>
    </footer>
  )
}

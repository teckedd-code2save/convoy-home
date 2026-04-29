import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Copy, Check, Terminal, Bot, ArrowLeft,
  AlertTriangle, GitBranch
} from 'lucide-react'

const COMMANDS = [
  {
    name: 'init',
    syntax: 'convoy init [--force]',
    desc: 'Initialize the .convoy/ directory and SQLite state database. Creates the state engine structure.',
    example: '$ convoy init\n  .convoy/state.db created\n  State engine: SQLite + JSON diff',
    tags: ['setup'],
    claude: '/convoy init',
    cli: 'convoy init',
    env: [],
    flags: [
      { flag: '--force', desc: 'Overwrite existing state database' },
      { flag: '--template', desc: 'Use a predefined deployment template' },
    ],
    output: `{
  "state_db": ".convoy/state.db",
  "version": "0.1.0",
  "initialized_at": "2026-04-29T12:00:00Z"
}`,
  },
  {
    name: 'plan',
    syntax: 'convoy plan <path> [--output=format]',
    desc: 'Generate a deterministic deployment plan from the target directory. Previews every step before execution.',
    example: '$ convoy plan ./my-app\n  [1/7] Read -- docker-compose.yml\n  [2/7] Validate -- health checks\n  [3/7] Plan -- dependency graph built',
    tags: ['core'],
    claude: '/convoy plan ./my-app',
    cli: 'convoy plan ./my-app',
    env: ['CONVOY_TARGET', 'CONVOY_OUTPUT'],
    flags: [
      { flag: '--output=json|yaml|table', desc: 'Plan output format (default: table)' },
      { flag: '--strict', desc: 'Fail on any validation warning' },
      { flag: '--dry-run', desc: 'Preview only, no side effects' },
    ],
    output: `{
  "plan_id": "plan_abc123",
  "stages": [
    { "name": "read", "status": "ready" },
    { "name": "validate", "status": "ready" },
    { "name": "plan", "status": "ready" },
    { "name": "rehearse", "status": "ready" },
    { "name": "ship", "status": "ready" },
    { "name": "observe", "status": "ready" },
    { "name": "remember", "status": "ready" }
  ],
  "hash": "sha256:a1b2c3..."
}`,
  },
  {
    name: 'rehearse',
    syntax: 'convoy rehearse <path> [--env=name]',
    desc: 'Deploy to an isolated staging environment that mirrors production topology. Catches failures early.',
    example: '$ convoy rehearse ./my-app --env=staging\n  Staging env: convoy-staging-abc123\n  Running integration tests...\n  All tests passed',
    tags: ['core'],
    claude: '/convoy rehearse ./my-app',
    cli: 'convoy rehearse ./my-app',
    env: ['CONVOY_ENV', 'CONVOY_STAGING_URL'],
    flags: [
      { flag: '--env=<name>', desc: 'Target environment (default: staging)' },
      { flag: '--skip-tests', desc: 'Skip integration test suite' },
      { flag: '--timeout=<duration>', desc: 'Max rehearsal duration (default: 10m)' },
    ],
    output: `{
  "rehearsal_id": "reh_abc123",
  "env": "staging",
  "tests_passed": 14,
  "tests_failed": 0,
  "duration_ms": 48230
}`,
  },
  {
    name: 'ship',
    syntax: 'convoy ship <path> [--prod] [--open]',
    desc: 'Execute the deployment plan against the target environment. Zero-downtime rolling updates with automatic health verification.',
    example: '$ convoy ship ./my-app --prod --open\n  Executing plan plan_abc123...\n  [ship] Rolling update: 3/3 healthy\n  [observe] 5min stability window: OK\n  Deployed: https://my-app.vercel.app',
    tags: ['core'],
    claude: '/convoy ship ./my-app --open',
    cli: 'npm run convoy -- ship ./my-app --open',
    env: ['CONVOY_TARGET', 'VERCEL_TOKEN', 'DOCKER_REGISTRY'],
    flags: [
      { flag: '--prod', desc: 'Target production environment' },
      { flag: '--open', desc: 'Open deployed URL in browser' },
      { flag: '--no-verify', desc: 'Skip post-deploy health check' },
      { flag: '--rollback-on-failure', desc: 'Auto-rollback if observe fails' },
    ],
    output: `{
  "deployment_id": "dep_abc123",
  "url": "https://my-app.vercel.app",
  "status": "healthy",
  "rolled_back": false,
  "duration_ms": 89200
}`,
  },
  {
    name: 'observe',
    syntax: 'convoy observe [--window=<duration>] [--auto-rollback]',
    desc: 'Monitor deployment stability for a configurable window. Watches error rates, latency, and resource usage.',
    example: '$ convoy observe --window=5m\n  Monitoring: https://my-app.vercel.app\n  Error rate: 0.02% (threshold: 1%)\n  Latency p95: 120ms (threshold: 500ms)\n  Status: STABLE',
    tags: ['core'],
    claude: '/convoy observe',
    cli: 'convoy observe --window=5m',
    env: ['CONVOY_OBSERVE_WINDOW', 'CONVOY_ERROR_THRESHOLD'],
    flags: [
      { flag: '--window=<duration>', desc: 'Stability observation period (default: 5m)' },
      { flag: '--auto-rollback', desc: 'Rollback automatically on threshold breach' },
      { flag: '--notify', desc: 'Send alert on threshold breach' },
    ],
    output: `{
  "observe_id": "obs_abc123",
  "window_seconds": 300,
  "metrics": {
    "error_rate": 0.0002,
    "latency_p95_ms": 120,
    "cpu_percent": 34
  },
  "status": "stable",
  "rolled_back": false
}`,
  },
  {
    name: 'rollback',
    syntax: 'convoy rollback [--to=<id>] [--dry-run]',
    desc: 'Restore the last known-good deployment state. Uses the pre-computed rollback path generated during planning.',
    example: '$ convoy rollback\n  Rolling back to dep_prev123...\n  [1/3] Stop current containers\n  [2/3] Restore previous image\n  [3/3] Verify health check\n  Rollback complete: https://my-app.vercel.app',
    tags: ['core'],
    claude: '/convoy rollback',
    cli: 'convoy rollback',
    env: ['CONVOY_ROLLBACK_TARGET'],
    flags: [
      { flag: '--to=<deployment_id>', desc: 'Rollback to specific deployment' },
      { flag: '--dry-run', desc: 'Preview rollback steps without executing' },
      { flag: '--force', desc: 'Skip confirmation prompt' },
    ],
    output: `{
  "rollback_id": "rb_abc123",
  "from_deployment": "dep_latest",
  "to_deployment": "dep_prev123",
  "status": "complete",
  "duration_ms": 34100
}`,
  },
  {
    name: 'state',
    syntax: 'convoy state [--show|--export|--import]',
    desc: 'Inspect, export, or import the SQLite state database. Cross-session memory for incremental deployments.',
    example: '$ convoy state --show\n  State db: .convoy/state.db (2.3 MB)\n  Sessions: 14\n  Last deploy: 2026-04-28T09:15:00Z',
    tags: ['debug'],
    claude: '/convoy state',
    cli: 'convoy state --show',
    env: ['CONVOY_STATE_PATH'],
    flags: [
      { flag: '--show', desc: 'Display state database summary' },
      { flag: '--export=<file>', desc: 'Export state to JSON file' },
      { flag: '--import=<file>', desc: 'Import state from JSON file' },
    ],
    output: `{
  "state_db": ".convoy/state.db",
  "size_bytes": 2400000,
  "sessions": 14,
  "deployments": 28,
  "last_deploy": "2026-04-28T09:15:00Z"
}`,
  },
  {
    name: 'medic',
    syntax: '/convoy diagnose [--target=<path>]',
    desc: 'Launch the Medic agent — a Claude Opus 4.7 tool-use loop that diagnoses deployment failures. 4 tools, scoped reasoning.',
    example: '/convoy diagnose\n  [medic] Reading log tail...\n  [medic] Found: DATABASE_URL not resolving\n  [medic] Proposed fix: add CONNECTION_POOL_SIZE to 1Password',
    tags: ['agent'],
    claude: '/convoy diagnose',
    cli: 'Not available via CLI — use Claude Code native integration',
    env: ['ANTHROPIC_API_KEY', 'MEDIC_MODEL'],
    flags: [
      { flag: '--target=<path>', desc: 'Target directory for diagnosis' },
      { flag: '--verbose', desc: 'Show full agent reasoning chain' },
    ],
    output: `{
  "diagnosis_id": "diag_abc123",
  "issue": "DATABASE_URL not resolving",
  "severity": "critical",
  "proposed_fix": "Add CONNECTION_POOL_SIZE=10 to 1Password staging vault",
  "confidence": 0.94
}`,
  },
]

const ENV_VARS = [
  { name: 'CONVOY_TARGET', required: false, desc: 'Default deployment target path', default: './' },
  { name: 'CONVOY_OUTPUT', required: false, desc: 'Plan output format (json|yaml|table)', default: 'table' },
  { name: 'CONVOY_ENV', required: false, desc: 'Default environment name', default: 'staging' },
  { name: 'VERCEL_TOKEN', required: false, desc: 'Vercel API token for deployments', default: '-' },
  { name: 'DOCKER_REGISTRY', required: false, desc: 'Docker registry URL', default: 'docker.io' },
  { name: 'RAILWAY_TOKEN', required: false, desc: 'Railway API token', default: '-' },
  { name: 'AWS_ACCESS_KEY_ID', required: false, desc: 'AWS credential for EC2 deploys', default: '-' },
  { name: 'ONEPASSWORD_VAULT', required: false, desc: '1Password vault for secret resolution', default: '-' },
  { name: 'ANTHROPIC_API_KEY', required: false, desc: 'Required for Medic agent', default: '-' },
  { name: 'MEDIC_MODEL', required: false, desc: 'Claude model for Medic (opus|sonnet)', default: 'opus' },
  { name: 'CONVOY_OBSERVE_WINDOW', required: false, desc: 'Default observation window', default: '5m' },
  { name: 'CONVOY_ERROR_THRESHOLD', required: false, desc: 'Error rate threshold for auto-rollback', default: '0.01' },
]

export default function Docs() {
  const [mode, setMode] = useState<'claude' | 'cli'>('claude')
  const [openCmd, setOpenCmd] = useState<string | null>('plan')
  const [copied, setCopied] = useState<string | null>(null)
  const [showPlugin, setShowPlugin] = useState(true)

  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  const filtered = COMMANDS.filter(c =>
    c.tags.some(t => ['core', 'setup', 'debug', 'agent'].includes(t))
  )

  return (
    <main className="pt-24 pb-20 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to overview</span>
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-h1 text-text-primary mb-3">Documentation</h1>
          <p className="text-body-lg text-text-secondary max-w-2xl">
            CLI reference, environment variables, and plugin setup for the Convoy deployment operator.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border-custom mb-8 w-fit">
          <button
            onClick={() => setMode('claude')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'claude'
                ? 'bg-accent-blue text-white shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Bot className="w-4 h-4" />
            Claude Code
          </button>
          <button
            onClick={() => setMode('cli')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'cli'
                ? 'bg-accent-blue text-white shadow-glow-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Raw CLI
          </button>
        </div>

        {/* Plugin Setup Callout */}
        <AnimatePresence>
          {showPlugin && mode === 'claude' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-10 p-5 rounded-xl bg-surface-raised border border-border-custom"
            >
              <div className="flex items-start gap-3">
                <GitBranch className="w-5 h-5 text-accent-blue mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-text-primary">Claude Code Plugin Setup</h3>
                    <button
                      onClick={() => setShowPlugin(false)}
                      className="text-xs text-text-tertiary hover:text-text-secondary"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <span className="text-label text-text-tertiary">1</span>
                      <span>Clone <code className="text-accent-blue">github.com/teckedd-code2save/convoy</code></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-label text-text-tertiary">2</span>
                      <span>Run <code className="text-accent-blue">cd .claude-plugin && ./install</code></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-label text-text-tertiary">3</span>
                      <span>Launch <code className="text-accent-blue">claude</code> in your project directory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-label text-text-tertiary">4</span>
                      <span>Type <code className="text-accent-blue">/convoy</code> to see available commands</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary mt-3">
                    The plugin creates shell helpers in your Claude Code commands directory.
                    Inspect <code className="text-accent-blue">.claude-plugin/commands/</code> to see exactly what runs.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Commands Accordion */}
        <div className="mb-16">
          <h2 className="text-h2 text-text-primary mb-6">Command Reference</h2>
          <div className="space-y-3">
            {filtered.map(cmd => (
              <div
                key={cmd.name}
                className="rounded-xl border border-border-custom overflow-hidden bg-surface"
              >
                <button
                  onClick={() => setOpenCmd(openCmd === cmd.name ? null : cmd.name)}
                  className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-surface-raised transition-colors"
                >
                  <ChevronRight className={`w-4 h-4 text-text-tertiary shrink-0 transition-transform ${openCmd === cmd.name ? 'rotate-90' : ''}`} />
                  <code className="text-sm font-medium text-accent-blue">{cmd.name}</code>
                  <span className="text-xs text-text-tertiary hidden sm:inline">{cmd.syntax}</span>
                  <div className="ml-auto flex items-center gap-2">
                    {cmd.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-void text-text-tertiary border border-border-custom">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                <AnimatePresence>
                  {openCmd === cmd.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-border-custom">
                        <p className="text-sm text-text-secondary mt-4 mb-4">{cmd.desc}</p>

                        {/* Command syntax */}
                        <div className="terminal-panel mb-4">
                          <div className="terminal-header">
                            <span className="text-xs text-text-tertiary">
                              {mode === 'claude' ? 'Claude Code' : 'CLI'}
                            </span>
                            <button
                              onClick={() => copy(mode === 'claude' ? cmd.claude : cmd.cli, cmd.name)}
                              className="ml-auto flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary"
                            >
                              {copied === cmd.name ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copied === cmd.name ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <div className="terminal-body">
                            <span className="text-accent-blue">$ </span>
                            <span className="text-text-primary">{mode === 'claude' ? cmd.claude : cmd.cli}</span>
                          </div>
                        </div>

                        {/* Flags */}
                        {cmd.flags.length > 0 && (
                          <div className="mb-4">
                            <div className="text-label text-text-tertiary mb-2">Flags</div>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {cmd.flags.map((f, i) => (
                                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-void border border-border-subtle">
                                  <code className="text-xs text-accent-blue shrink-0">{f.flag}</code>
                                  <span className="text-xs text-text-secondary">{f.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Example */}
                        <div className="mb-4">
                          <div className="text-label text-text-tertiary mb-2">Example</div>
                          <pre className="p-3 rounded-lg bg-void border border-border-subtle text-xs text-text-secondary overflow-x-auto">
                            {cmd.example}
                          </pre>
                        </div>

                        {/* Output */}
                        <div>
                          <div className="text-label text-text-tertiary mb-2">Output</div>
                          <pre className="p-3 rounded-lg bg-void border border-border-subtle text-xs text-text-secondary overflow-x-auto">
                            {cmd.output}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="mb-16">
          <h2 className="text-h2 text-text-primary mb-6">Environment Variables</h2>
          <div className="overflow-x-auto rounded-xl border border-border-custom bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-custom">
                  <th className="text-left text-label text-text-tertiary px-4 py-3">Variable</th>
                  <th className="text-left text-label text-text-tertiary px-4 py-3">Required</th>
                  <th className="text-left text-label text-text-tertiary px-4 py-3">Default</th>
                  <th className="text-left text-label text-text-tertiary px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {ENV_VARS.map((v, i) => (
                  <tr key={i} className="border-b border-border-subtle last:border-0 hover:bg-surface-raised transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-accent-blue text-xs">{v.name}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${v.required ? 'text-signal-warning' : 'text-text-tertiary'}`}>
                        {v.required ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-tertiary">{v.default}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{v.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plugin Note */}
        <div className="p-5 rounded-xl bg-surface-raised border border-border-custom">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-signal-warning mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Plugin Architecture</h3>
              <p className="text-sm text-text-secondary mb-2">
                The <code className="text-accent-blue">.claude-plugin/</code> directory contains shell scripts 
                that Claude Code calls via slash commands. These are not black-box binaries — 
                they shell out to the real Convoy CLI. You can inspect and modify every command.
              </p>
              <pre className="p-3 rounded-lg bg-void border border-border-subtle text-xs text-text-secondary overflow-x-auto">
{`.claude-plugin/
├── commands/
│   ├── convoy-init.json       # Claude Code command manifest
│   ├── convoy-plan.json
│   ├── convoy-ship.json
│   └── convoy-diagnose.json
├── hooks/
│   └── pre-command.sh         # Runs before every /convoy call
└── install                    # One-liner: cp commands/ ~/.claude/commands/`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Shield, Activity, HeartPulse, Container,
  Cloud, Server, Terminal, ChevronRight,
  Copy, Check, ExternalLink, Cpu,
  AlertTriangle, RotateCcw, Stethoscope, Bot, GitBranch
} from 'lucide-react'
import HeroShader from '../components/HeroShader'
import { GitHubIcon } from '../components/GitHubIcon'

/* ─── Project Screenshots ─── */
import softpharmaHome from '../assets/projects/softpharma-homepage.png'
import softpharmaDetail from '../assets/projects/softpharma-detail.png'
import softpharmaAlerts from '../assets/projects/softpharma-alerts.png'
import vercelDeploy from '../assets/projects/vercel-deployment.png'
import viewerHome from '../assets/projects/viewer-home.png'

gsap.registerPlugin(ScrollTrigger)

/* ─── Hooks ─── */

function useCharReveal(options?: { stagger?: number; start?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const chars = el.querySelectorAll('.char-reveal')
    if (!chars.length) return

    gsap.set(chars, { opacity: 0.1, y: 20 })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: options?.start ?? 'top 85%',
      once: true,
      onEnter: () => {
        if (triggered.current) return
        triggered.current = true
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: options?.stagger ?? 0.025,
          ease: 'power3.out',
        })
      },
    })

    return () => { trigger.kill() }
  }, [options?.stagger, options?.start])

  return ref
}

function useTerminalReveal(lines: string[], options?: { speed?: number; start?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const triggered = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: options?.start ?? 'top 80%',
      once: true,
      onEnter: () => {
        if (triggered.current) return
        triggered.current = true
        let i = 0
        const interval = setInterval(() => {
          i++
          setVisibleCount(i)
          if (i >= lines.length) clearInterval(interval)
        }, options?.speed ?? 350)
      },
    })

    return () => { trigger.kill() }
  }, [lines.length, options?.speed, options?.start])

  return { ref, visibleCount }
}

/* ─── Helpers ─── */

function SplitText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <span key={i} className="char-reveal inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

/* ─── Sections ─── */

function HeroSection() {
  const titleRef = useCharReveal()
  const subtitleRef = useCharReveal({ stagger: 0.015, start: 'top 75%' })

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroShader />
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 0%, #07070A 75%)' }}
      />
      <div className="relative z-20 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised border border-border-custom text-label text-accent-blue mb-8">
          <Shield className="w-3.5 h-3.5" />
          <span>Your code is never touched</span>
        </div>

        <div ref={titleRef} className="text-display-xl text-text-primary mb-6">
          <SplitText text="Ship without" />
          <br />
          <span className="text-accent-blue">
            <SplitText text="the anxiety" />
          </span>
        </div>

        <div ref={subtitleRef} className="text-body-lg text-text-primary max-w-2xl mx-auto mb-10">
          <SplitText text="Convoy is a stateful AI deployment operator that rehearses, ships, and observes — then remembers where you left off." />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://github.com/teckedd-code2save/convoy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-accent-bright transition-colors shadow-glow-blue"
          >
            <GitHubIcon className="w-4 h-4" />
            <span>Read on GitHub</span>
          </a>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border-custom text-text-primary text-sm font-medium hover:bg-surface-raised transition-colors"
          >
            <Terminal className="w-4 h-4" />
            <span>Documentation</span>
          </Link>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-xs text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <Container className="w-3.5 h-3.5" /> Docker
          </span>
          <span className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" /> Vercel
          </span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> Railway
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> EC2
          </span>
        </div>
      </div>
    </section>
  )
}

/* ─── Problem Section ─── */

const PROBLEM_LINES = [
  { text: '$ npm install -g convoy', color: 'text-accent-blue' },
  { text: '$ convoy init', color: 'text-text-secondary' },
  { text: '  Creating .convoy/state.db...', color: 'text-text-tertiary' },
  { text: '  State engine: SQLite + JSON diff', color: 'text-text-tertiary' },
  { text: '$ convoy plan ./my-app', color: 'text-accent-blue' },
  { text: '  [1/7] Read -- docker-compose.yml', color: 'text-signal-success' },
  { text: '  [2/7] Health check -- GET /health', color: 'text-signal-success' },
  { text: '  [3/7] Verify -- env vars in 1Password', color: 'text-signal-success' },
  { text: '  [4/7] Detect -- 0.2s cold-start budget', color: 'text-signal-success' },
  { text: '  [5/7] Pre-deploy -- staging.rehearse()', color: 'text-signal-success' },
  { text: '  [6/7] Execute -- zero-downtime rolling', color: 'text-signal-success' },
  { text: '  [7/7] Observe -- 5min stability window', color: 'text-signal-success' },
  { text: '  done  -- all stages passed', color: 'text-signal-success' },
]

function ProblemSection() {
  const { ref: termRef, visibleCount } = useTerminalReveal(PROBLEM_LINES.map(l => l.text), { speed: 280 })
  const headingRef = useCharReveal()

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-label text-accent-blue mb-4">The Problem</div>
            <h2 ref={headingRef} className="text-h1 text-text-primary mb-6">
              <SplitText text="Development tools build code. Deployment operators shouldn't touch it." />
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Most AI deployment tools rewrite your <code className="text-accent-blue">src/</code> to "fix" it. 
              That's a boundary violation. Convoy ships what you built — no edits, no drift, no surprises.
            </p>

            <div className="space-y-4">
              {[
                { label: 'Vercel v0, Replit', desc: 'Development tools — building code is their job.', ok: true },
                { label: 'Convoy', desc: 'Deployment operator — ships without touching src/.', ok: true },
                { label: 'Others', desc: 'Rewrite your code during deploy — unexpected diffs.', ok: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border-custom">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${item.ok ? 'bg-signal-success' : 'bg-signal-warning'}`} />
                  <div>
                    <div className="text-sm font-medium text-text-primary">{item.label}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={termRef} className="terminal-panel lg:sticky lg:top-24">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-blue" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-2 text-xs text-text-tertiary">convoy plan</span>
            </div>
            <div className="terminal-body">
              {PROBLEM_LINES.map((line, i) => (
                <div
                  key={i}
                  className={`transition-opacity duration-300 ${i < visibleCount ? 'opacity-100' : 'opacity-0'}`}
                >
                  <span className={line.color}>{line.text}</span>
                </div>
              ))}
              <div className={`mt-2 flex items-center gap-1.5 ${visibleCount >= PROBLEM_LINES.length ? 'opacity-100' : 'opacity-0'}`}>
                <span className="w-2 h-4 bg-accent-blue animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Pipeline Deep Dive — GSAP Pinned Sections ─── */

const STAGES = [
  {
    num: '01',
    title: 'Read',
    desc: 'Ingests your docker-compose.yml, Dockerfile, and environment schema. Builds a structured manifest without executing anything.',
    details: ['Parses compose services & networks', 'Extracts env var dependencies', 'Detects port mappings & volumes'],
    cmd: 'convoy read ./my-app',
    color: '#5B6DF5',
  },
  {
    num: '02',
    title: 'Validate',
    desc: 'Runs health checks, verifies secrets are resolvable, and confirms resource budgets before any infrastructure is touched.',
    details: ['Health endpoint probe (GET /health)', '1Password secret resolution', 'Cold-start budget check'],
    cmd: 'convoy validate --strict',
    color: '#5B6DF5',
  },
  {
    num: '03',
    title: 'Plan',
    desc: 'Generates a deterministic execution plan. Every step is previewed and hashed so you know exactly what will happen.',
    details: ['Dependency graph construction', 'Rollback path pre-computation', 'State diff preview'],
    cmd: 'convoy plan --output=json',
    color: '#5B6DF5',
  },
  {
    num: '04',
    title: 'Rehearse',
    desc: 'Deploys to an isolated staging environment that mirrors production topology. Catches failures before they reach users.',
    details: ['Staging environment clone', 'Integration test execution', 'Traffic shadow validation'],
    cmd: 'convoy rehearse --env=staging',
    color: '#7B8FFF',
  },
  {
    num: '05',
    title: 'Ship',
    desc: 'Executes the plan against production with zero-downtime rolling updates. Each step is atomic and reversible.',
    details: ['Zero-downtime rolling deploy', 'Container health verification', 'DNS cutover with TTL respect'],
    cmd: 'convoy ship --prod',
    color: '#34D399',
  },
  {
    num: '06',
    title: 'Observe',
    desc: 'Monitors stability for a configurable window. If error rates spike, automatically initiates rollback.',
    details: ['5-minute stability window', 'Error rate & latency monitoring', 'Auto-rollback on threshold breach'],
    cmd: 'convoy observe --window=5m',
    color: '#34D399',
  },
  {
    num: '07',
    title: 'Remember',
    desc: 'Persists the full deployment state to SQLite. Next run starts from exactly where you left off — no context lost.',
    details: ['SQLite state persistence', 'JSON diff for incremental updates', 'Cross-session memory'],
    cmd: 'convoy state --show',
    color: '#A78BFA',
  },
]

function PipelineDeepDive() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const sections = container.querySelectorAll<HTMLElement>('.pipeline-stage')
    const triggers: ScrollTrigger[] = []

    sections.forEach((section) => {
      const content = section.querySelector('.stage-content')
      const cmd = section.querySelector('.stage-cmd')
      const details = section.querySelectorAll('.stage-detail')

      if (content) {
        gsap.set(content, { opacity: 0, y: 50 })
        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const progress = self.progress
            gsap.set(content, {
              opacity: Math.min(1, progress * 2.5),
              y: 50 * (1 - Math.min(1, progress * 2.5)),
            })
          },
        })
        triggers.push(st)
      }

      if (cmd) {
        gsap.set(cmd, { opacity: 0, x: -20 })
        const stCmd = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=130%',
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress
            gsap.set(cmd, {
              opacity: p > 0.3 ? Math.min(1, (p - 0.3) * 3) : 0,
              x: p > 0.3 ? -20 * (1 - Math.min(1, (p - 0.3) * 3)) : -20,
            })
          },
        })
        triggers.push(stCmd)
      }

      details.forEach((detail, dIdx) => {
        gsap.set(detail, { opacity: 0, x: 20 })
        const stDetail = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=130%',
          scrub: 0.6,
          onUpdate: (self) => {
            const threshold = 0.25 + dIdx * 0.08
            const p = self.progress
            gsap.set(detail, {
              opacity: p > threshold ? Math.min(1, (p - threshold) * 4) : 0,
              x: p > threshold ? 20 * (1 - Math.min(1, (p - threshold) * 4)) : 20,
            })
          },
        })
        triggers.push(stDetail)
      })
    })

    return () => {
      triggers.forEach(st => st.kill())
    }
  }, [])

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto mb-20">
        <div className="text-label text-accent-blue mb-4">Pipeline Deep Dive</div>
        <h2 className="text-h1 text-text-primary max-w-2xl">
          Seven stages. Each one pinned, inspected, and remembered.
        </h2>
      </div>

      <div ref={containerRef} className="relative">
        {STAGES.map((stage, index) => (
          <div
            key={stage.num}
            className="pipeline-stage min-h-screen flex items-center py-20"
            style={{ background: index % 2 === 0 ? '#07070A' : '#0A0A10' }}
          >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
              <div className={`stage-content grid lg:grid-cols-12 gap-12 items-center ${index % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
                <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className="text-7xl sm:text-8xl font-bold leading-none"
                      style={{ color: stage.color, opacity: 0.2 }}
                    >
                      {stage.num}
                    </span>
                    <div className="h-px flex-1 bg-border-custom" />
                  </div>
                  <h3 className="text-h2 text-text-primary mb-4">{stage.title}</h3>
                  <p className="text-body-lg text-text-secondary mb-8">{stage.desc}</p>

                  <div className="stage-cmd terminal-panel">
                    <div className="terminal-header">
                      <div className="terminal-dot terminal-dot-blue" />
                      <span className="text-xs text-text-tertiary">shell</span>
                    </div>
                    <div className="terminal-body">
                      <span className="text-accent-blue">$ </span>
                      <span className="text-text-primary">{stage.cmd}</span>
                    </div>
                  </div>
                </div>

                <div className={`lg:col-span-7 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="bg-surface rounded-xl border border-border-custom p-6 sm:p-8">
                    <div className="text-label text-text-tertiary mb-4">What happens</div>
                    <div className="space-y-3">
                      {stage.details.map((detail, dIdx) => (
                        <div
                          key={dIdx}
                          className="stage-detail flex items-start gap-3 p-3 rounded-lg bg-void border border-border-subtle"
                        >
                          <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: stage.color }} />
                          <span className="text-sm text-text-secondary">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Features Section ─── */

const FEATURES = [
  {
    icon: Shield,
    title: 'Stateful Core',
    desc: 'SQLite-backed state engine remembers every deployment. Resume from exact context across sessions.',
    color: '#5B6DF5',
  },
  {
    icon: Activity,
    title: 'Deterministic Plans',
    desc: 'Every execution path is hashed and previewed before any infrastructure is touched. No surprises.',
    color: '#34D399',
  },
  {
    icon: RotateCcw,
    title: 'Instant Rollback',
    desc: 'One command restores the last known-good state. Your rollback plan is generated before you ship.',
    color: '#F87171',
  },
  {
    icon: Stethoscope,
    title: 'Medic Agent',
    desc: 'Claude Opus 4.7 tool-use loop that reads logs, diagnoses issues, and proposes fixes — scoped to 4 tools.',
    color: '#A78BFA',
  },
]

function FeaturesSection() {
  const headingRef = useCharReveal()

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-label text-accent-blue mb-4">Features</div>
          <h2 ref={headingRef} className="text-h1 text-text-primary">
            <SplitText text="Built for production, not demos." />
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 sm:p-8 rounded-xl bg-surface border border-border-custom hover:border-border-custom/80 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 className="text-h3 text-text-primary mb-2">{feature.title}</h3>
              <p className="text-body text-text-secondary">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonial Section ─── */

function TestimonialSection() {
  const headingRef = useCharReveal()

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-label text-accent-blue mb-4">Proof of Work</div>
          <h2 ref={headingRef} className="text-h1 text-text-primary">
            <SplitText text="Shipped with Convoy." />
          </h2>
        </div>

        <div className="bg-surface rounded-xl border border-border-custom overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <div className="text-base font-semibold text-text-primary">SoftPharmaManager</div>
                  <div className="text-xs text-text-secondary">softpharmamanager.vercel.app</div>
                </div>
              </div>

              <blockquote className="text-body-lg text-text-secondary mb-6">
                "Convoy deployed our full-stack pharmaceutical inventory management system 
                to Vercel with zero manual intervention. The Medic agent diagnosed a 
                missing env var in staging before it hit production."
              </blockquote>

              <div className="flex flex-wrap gap-2 mb-6">
                {['Next.js', 'Prisma', 'Docker', 'Vercel'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-void border border-border-custom text-xs text-text-secondary">
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href="https://softpharmamanager.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-accent-blue hover:text-accent-bright transition-colors"
              >
                <span>View deployment</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="bg-void p-6 sm:p-8 border-l border-border-custom">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Homepage', url: 'https://softpharmamanager.vercel.app', img: softpharmaHome },
                  { label: 'Detail View', url: 'https://softpharmamanager.vercel.app/detail', img: softpharmaDetail },
                  { label: 'Alerts Page', url: 'https://softpharmamanager.vercel.app/alerts', img: softpharmaAlerts },
                ].map((shot, i) => (
                  <a
                    key={i}
                    href={shot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-lg border border-border-custom overflow-hidden hover:border-accent-blue/30 transition-colors"
                  >
                    <div className="relative aspect-[16/10] bg-surface-raised overflow-hidden">
                      <img
                        src={shot.img}
                        alt={`SoftPharmaManager ${shot.label}`}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="px-3 py-2 bg-surface border-t border-border-custom flex items-center justify-between">
                      <span className="text-xs text-text-secondary">{shot.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent-blue transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Medic Section ─── */

const MEDIC_TURNS = [
  {
    turn: 1,
    action: 'Read log tail',
    result: 'Detected: DATABASE_URL not resolving in staging',
    tool: 'read_log_tail',
  },
  {
    turn: 2,
    action: 'Read .env.example',
    result: 'Found missing CONNECTION_POOL_SIZE variable',
    tool: 'read_file',
  },
  {
    turn: 3,
    action: 'Grep repo for pool config',
    result: 'Located prisma/schema.ts — pool config present but env var unset',
    tool: 'grep_repo',
  },
  {
    turn: 4,
    action: 'Finalize diagnosis',
    result: 'Proposed fix: add CONNECTION_POOL_SIZE=10 to 1Password staging vault',
    tool: 'finalize_diagnosis',
  },
]

function MedicSection() {
  const headingRef = useCharReveal()
  const { ref: termRef, visibleCount } = useTerminalReveal(
    MEDIC_TURNS.map(t => `Turn ${t.turn}: ${t.action} — ${t.result}`),
    { speed: 400 }
  )

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-label text-medic-purple mb-4">Medic Agent</div>
            <h2 ref={headingRef} className="text-h1 text-text-primary mb-6">
              <SplitText text="When deploys fail, Medic investigates." />
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Claude Opus 4.7 with a 4-tool loop: read logs, inspect files, grep the repo, 
              and finalize a diagnosis. No open-ended wandering — scoped, deterministic, actionable.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { icon: Activity, label: 'read_log_tail', desc: 'Stream recent container logs' },
                { icon: FileTextIcon, label: 'read_file', desc: 'Inspect config & source files' },
                { icon: GitBranch, label: 'grep_repo', desc: 'Search codebase for patterns' },
                { icon: CheckIcon, label: 'finalize_diagnosis', desc: 'Propose scoped fix' },
              ].map((tool, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-void border border-border-custom">
                  <tool.icon className="w-4 h-4 text-medic-purple" />
                  <code className="text-sm text-medic-purple">{tool.label}</code>
                  <span className="text-xs text-text-tertiary ml-auto">{tool.desc}</span>
                </div>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-medic-dim border border-medic-purple/20 text-label text-medic-purple">
              <Bot className="w-3.5 h-3.5" />
              <span>Claude Code native — /convoy diagnose</span>
            </div>
          </div>

          <div ref={termRef} className="terminal-panel lg:sticky lg:top-24">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-blue" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-2 text-xs text-text-tertiary">medic agent — 4-turn loop</span>
            </div>
            <div className="terminal-body">
              {MEDIC_TURNS.map((turn, i) => (
                <div
                  key={i}
                  className={`mb-3 transition-opacity duration-300 ${i < visibleCount ? 'opacity-100' : 'opacity-0'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-label text-medic-purple">Turn {turn.turn}</span>
                    <code className="text-xs text-text-tertiary">{turn.tool}</code>
                  </div>
                  <div className="text-accent-bright">{turn.action}</div>
                  <div className="text-text-secondary">{turn.result}</div>
                </div>
              ))}
              {visibleCount >= MEDIC_TURNS.length && (
                <div className="flex items-center gap-2 text-signal-success">
                  <CheckIcon className="w-4 h-4" />
                  <span>Diagnosis complete — fix proposed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FileTextIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg> }
function CheckIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> }

/* ─── Platforms Section ─── */

const PLATFORMS = [
  { name: 'Docker', icon: Container },
  { name: 'Vercel', icon: Cloud },
  { name: 'Railway', icon: Server },
  { name: 'AWS EC2', icon: Cpu },
  { name: 'Render', icon: Activity },
  { name: 'Fly.io', icon: Zap },
]

function PlatformsSection() {
  const headingRef = useCharReveal()

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-label text-accent-blue mb-4">Platforms</div>
        <h2 ref={headingRef} className="text-h1 text-text-primary mb-6">
          <SplitText text="Deploy anywhere. Remember everywhere." />
        </h2>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-12">
          One operator, multiple targets. Convoy abstracts platform differences 
          so your deployment logic stays consistent.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PLATFORMS.map((platform, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface border border-border-custom hover:border-accent-blue/30 transition-colors"
            >
              <platform.icon className="w-8 h-8 text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">{platform.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Install Section ─── */

const PLUGIN_STEPS = [
  { cmd: 'git clone https://github.com/teckedd-code2save/convoy.git', desc: 'Clone the repo' },
  { cmd: 'cd convoy/.claude-plugin && ./install', desc: 'Run the plugin installer' },
  { cmd: 'claude', desc: 'Launch Claude Code in your project' },
  { cmd: '/convoy ship ./my-app --open', desc: 'Ship with native slash command' },
]

const CLI_STEPS = [
  { cmd: 'npm install -g convoy', desc: 'Install globally' },
  { cmd: 'convoy init', desc: 'Initialize state database' },
  { cmd: 'convoy plan ./my-app', desc: 'Preview deployment plan' },
  { cmd: 'npm run convoy -- ship ./my-app --open', desc: 'Ship to production' },
]

function InstallSection() {
  const [mode, setMode] = useState<'claude' | 'cli'>('claude')
  const [copied, setCopied] = useState(false)
  const headingRef = useCharReveal()

  const steps = mode === 'claude' ? PLUGIN_STEPS : CLI_STEPS

  const copyAll = useCallback(() => {
    const text = steps.map(s => s.cmd).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [steps])

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-label text-accent-blue mb-4">Get Started</div>
          <h2 ref={headingRef} className="text-h1 text-text-primary mb-4">
            <SplitText text="Two paths. Same operator." />
          </h2>
          <p className="text-body text-text-secondary">
            Claude Code native integration, or raw CLI if you prefer the terminal.
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 p-1 rounded-lg bg-surface border border-border-custom mb-8">
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

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="terminal-panel"
          >
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-blue" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-2 text-xs text-text-tertiary">
                {mode === 'claude' ? '.claude-plugin/install' : 'npm install -g convoy'}
              </span>
              <button
                onClick={copyAll}
                className="ml-auto flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy all'}</span>
              </button>
            </div>
            <div className="terminal-body">
              {steps.map((step, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2 text-text-tertiary mb-1">
                    <span className="text-label">Step {i + 1}</span>
                    <span className="text-xs">{step.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent-blue">$</span>
                    <span className="text-text-primary">{step.cmd}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {mode === 'claude' && (
          <div className="mt-6 p-4 rounded-lg bg-surface-raised border border-border-custom">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-signal-warning mt-0.5 shrink-0" />
              <div className="text-sm text-text-secondary">
                The plugin creates <code className="text-accent-blue">/convoy</code> slash commands in Claude Code. 
                These shell out to the real CLI — no black-box magic. Inspect 
                <code className="text-accent-blue"> .claude-plugin/commands/</code> to see exactly what runs.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Founder Section ─── */

function FounderSection() {
  const headingRef = useCharReveal()

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-label text-accent-blue mb-4">Built At</div>
        <h2 ref={headingRef} className="text-h1 text-text-primary mb-6">
          <SplitText text="Hackathon-born. Production-hardened." />
        </h2>
        <p className="text-body-lg text-text-secondary mb-8">
          Convoy started as a 48-hour sprint to solve a real problem: deployment tools 
          that mutate your code. It emerged as a stateful operator that stays in its lane.
        </p>
        <a
          href="https://edward-entire.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border-custom text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View portfolio</span>
        </a>
      </div>
    </section>
  )
}

/* ─── Showcase Section ─── */

const SHOWCASES = [
  {
    title: 'Convoy Dashboard',
    img: viewerHome,
    tags: ['Logs', 'State', 'Observe'],
    desc: 'Live log stream and deployment state — what Convoy sees when it ships your code.',
  },
  {
    title: 'Vercel Deployment',
    img: vercelDeploy,
    tags: ['Ship', 'Vercel', 'Rollback'],
    desc: 'Production deployment pipeline visualized — from push to live in under 60 seconds.',
  },
]

function ShowcaseSection() {
  const headingRef = useCharReveal()

  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-label text-accent-blue mb-4">Deployments</div>
          <h2 ref={headingRef} className="text-h1 text-text-primary">
            <SplitText text="Deployed with Convoy." />
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {SHOWCASES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-xl bg-surface border border-border-custom overflow-hidden hover:border-accent-blue/30 transition-colors"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="px-5 py-4">
                <h3 className="text-lg font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary mb-3">{item.desc}</p>
                <div className="flex items-center gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-void border border-border-custom text-xs text-text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Home Assembly ─── */

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <PipelineDeepDive />
      <FeaturesSection />
      <TestimonialSection />
      <ShowcaseSection />
      <MedicSection />
      <PlatformsSection />
      <InstallSection />
      <FounderSection />
    </main>
  )
}

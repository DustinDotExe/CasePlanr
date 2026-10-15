import { useEffect, useState, type ReactNode } from 'react';
import {
  Users,
  TrendingUp,
  Target,
  FileText,
  Sparkles,
  ShieldCheck,
  Download,
  Pencil,
  Eye,
  UserCog,
  Menu,
  X,
} from 'lucide-react';
import CasePlanrLogo from '../CasePlanrLogo';
const DEMO_MAIL = 'mailto:dustin.a.burton@gmail.com?subject=CasePlanr%20demo%20request';

const FEATURES = [
  {
    icon: Users,
    title: 'Participant Profiles',
    description:
      'Every participant’s case number, contacts, assigned manager and history in one clean profile.',
  },
  {
    icon: TrendingUp,
    title: 'Phase Tracking',
    description:
      'Five-phase milestones from intake to completion, so everyone knows exactly where a case stands.',
  },
  {
    icon: Target,
    title: 'Goal Management',
    description: 'Write SMART goals and let AI refine vague goals into measurable, court-ready language.',
  },
  {
    icon: FileText,
    title: 'Case Documentation',
    description: 'Generate printable, court-ready case plans with share & sign in a single click.',
  },
  {
    icon: Sparkles,
    title: 'AI Writing Assistance',
    description: 'Turn rough session notes into objective observations and concise hearing briefs.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit Logs',
    description: 'Every view, edit and export is logged with who, what and when — built for accountability.',
  },
] as const;

const STATS = [
  { value: 'Your rules', label: 'Custom phases, goals, and templates for any team' },
  { value: 'Go live fast', label: 'Same-day setup — start tracking in minutes' },
  { value: 'Fully logged', label: 'Audit trail on every view, edit, and export' },
  { value: 'Team-ready', label: 'Role-based access for staff and partners' },
] as const;

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Set up the participant',
    body: 'Enter their name, case number and contact details. CasePlanr creates their profile and starts them at intake.',
    card: <SetupStepCard />,
  },
  {
    step: 2,
    title: 'Set goals and log progress',
    body: 'Write SMART goals, log observations after each contact, and move them up a phase at each milestone.',
    card: <ProgressStepCard />,
  },
  {
    step: 3,
    title: 'Print or sign the case plan',
    body: 'Build a case plan from their current goals and progress. Print it for staffing or a hearing, or send it with Share & Sign.',
    card: <SignStepCard />,
  },
] as const;

const AUDIT_ROWS = [
  { icon: Download, title: 'M. Ellison exported case plan', sub: 'DC-2026-0417 · PDF', time: '2:14 PM' },
  { icon: Pencil, title: 'A. Okafor updated goal', sub: '"Obtain full-time employment"', time: '1:52 PM' },
  { icon: UserCog, title: 'Role changed to Viewer', sub: 'Probation liaison · by Admin', time: '11:03 AM' },
  { icon: Eye, title: 'K. Tran viewed profile', sub: 'DC-2026-0388', time: '9:40 AM' },
] as const;

function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-[30px] items-center rounded-full bg-blue-100 px-3 text-sm font-semibold text-blue-700 ${className}`}
    >
      {children}
    </span>
  );
}

function PrimaryBtn({
  children,
  href,
  className = '',
  variant = 'blue',
}: {
  children: ReactNode;
  href: string;
  className?: string;
  variant?: 'blue' | 'white';
}) {
  const base =
    variant === 'blue'
      ? 'bg-blue-600 text-white shadow-[0_1px_1px_rgba(29,78,216,0.25)] hover:bg-blue-700'
      : 'bg-white text-blue-700 shadow-[0_1px_1px_rgba(29,78,216,0.25)] hover:bg-blue-50';
  return (
    <a
      href={href}
      className={`inline-flex h-[52px] items-center justify-center rounded-[10px] px-[26px] text-[17px] font-semibold transition-colors ${base} ${className}`}
    >
      {children}
    </a>
  );
}

function OutlineBtn({ children, href, className = '' }: { children: ReactNode; href: string; className?: string }) {
  return (
    <a
      href={href}
      className={`inline-flex h-[52px] items-center justify-center rounded-[10px] border border-slate-300 bg-white px-[26px] text-[17px] font-semibold text-slate-900 transition-colors hover:bg-slate-50 ${className}`}
    >
      {children}
    </a>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    const previousPalette = root.dataset.palette;
    root.classList.remove('dark');
    root.dataset.palette = 'blue';

    return () => {
      if (hadDark) root.classList.add('dark');
      if (previousPalette) root.dataset.palette = previousPalette;
      else delete root.dataset.palette;
    };
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page min-h-screen bg-white font-sans text-slate-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/93 backdrop-blur-sm">
        <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 lg:px-20">
          <a href="/" className="flex items-center gap-2.5">
            <CasePlanrLogo className="size-9 text-blue-600" />
            <span className="text-[21px] font-black tracking-tight text-slate-900">CasePlanr</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <button type="button" onClick={() => scrollTo('features')} className="text-base font-medium text-slate-600 hover:text-slate-900">
              Features
            </button>
            <button type="button" onClick={() => scrollTo('how-it-works')} className="text-base font-medium text-slate-600 hover:text-slate-900">
              How it works
            </button>
            <a href="/cases" className="text-base font-medium text-slate-600 hover:text-slate-900">
              Sign In
            </a>
            <a
              href={DEMO_MAIL}
              className="inline-flex h-11 items-center rounded-[10px] bg-blue-600 px-5 text-base font-semibold text-white shadow-[0_1px_1px_rgba(29,78,216,0.25)] hover:bg-blue-700"
            >
              Request a demo
            </a>
          </nav>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-2xl text-slate-700 md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <button type="button" className="py-2 text-left font-medium text-slate-700" onClick={() => scrollTo('features')}>
                Features
              </button>
              <button type="button" className="py-2 text-left font-medium text-slate-700" onClick={() => scrollTo('how-it-works')}>
                How it works
              </button>
              <a href="/cases" className="py-2 font-medium text-slate-700">
                Sign In
              </a>
              <a href={DEMO_MAIL} className="rounded-[10px] bg-blue-600 py-3 text-center font-semibold text-white">
                Request a demo
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* Hero — copy and CTAs only */}
      <section className="bg-gradient-to-b from-blue-50 via-slate-50 via-70% to-white">
        <div className="mx-auto max-w-[720px] px-5 pb-14 pt-12 text-center lg:px-20 lg:pb-20 lg:pt-[88px]">
          <Pill className="mb-5 whitespace-normal leading-snug">Built for drug court & treatment court teams</Pill>
          <h1 className="text-[40px] font-black leading-[1.04] tracking-[-0.04em] text-slate-900 sm:text-[52px] lg:text-[60px] lg:leading-[62px] lg:tracking-[-2.4px]">
            Less paperwork. More progress. Keep cases moving.
          </h1>
          <p className="mt-5 text-lg leading-[1.6] text-slate-600 lg:text-[19px] lg:leading-[30px]">
            CasePlanr gives case managers one place to track phases, manage SMART goals, and produce court-ready case
            plans — with AI that turns rough notes into clear, objective documentation.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3.5 sm:flex-row sm:items-center">
            <PrimaryBtn href={DEMO_MAIL} className="sm:min-w-[200px]">
              Request a demo
            </PrimaryBtn>
            <OutlineBtn href="#how-it-works" className="sm:min-w-[200px]">
              See how it works →
            </OutlineBtn>
          </div>
          <p className="mt-4 text-sm text-slate-600">No credit card · Set up in a day · Your data stays yours</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-5 py-9 lg:grid-cols-4 lg:px-20 lg:py-9">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-[26px] font-black tracking-tight text-blue-700">{value}</p>
              <p className="mt-1 text-[15px] text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 px-5 py-20 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-[1280px] text-center">
          <div className="mb-4 flex justify-center">
            <Pill>Features</Pill>
          </div>
          <h2 className="text-[32px] font-black tracking-tight text-slate-900 sm:text-[42px] sm:leading-[46px] sm:tracking-[-1.47px]">
            Everything your team needs, nothing it doesn’t
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-lg text-slate-600 lg:text-[19px] lg:leading-[30px]">
            Purpose-built for court case management — not a generic CRM bent into shape.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-300 bg-white p-8 text-left transition-shadow hover:shadow-md"
              >
                <div className="flex size-14 items-center justify-center rounded-[14px] bg-blue-100">
                  <Icon className="size-[26px] text-blue-600" strokeWidth={2} />
                </div>
                <h3 className="mt-[18px] text-xl font-extrabold tracking-tight text-slate-900">{title}</h3>
                <p className="mt-2 text-base leading-relaxed text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 bg-gradient-to-b from-blue-50 to-slate-50 px-5 py-20 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-[1280px] text-center">
          <div className="mb-4 flex justify-center">
            <Pill>How it works</Pill>
          </div>
          <h2 className="text-[32px] font-black tracking-tight text-slate-900 sm:text-[42px] sm:leading-[46px] sm:tracking-[-1.47px]">
            How a case moves through CasePlanr
          </h2>
          <div className="relative mt-16 grid gap-12 lg:grid-cols-3 lg:items-stretch lg:gap-10">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-1 rounded bg-gradient-to-r from-blue-600 to-blue-300 lg:block" />
            {HOW_IT_WORKS.map(({ step, title, body, card }) => (
              <div key={step} className="relative flex h-full flex-col items-center text-center">
                <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-[28px] bg-blue-600 text-[22px] font-black text-white shadow-[0_0_0_8px_#dbeafe]">
                  {step}
                </div>
                <h3 className="mt-7 text-xl font-extrabold tracking-tight text-slate-900">{title}</h3>
                <p className="mt-2 min-h-[5.5rem] max-w-[400px] text-base leading-relaxed text-slate-600">{body}</p>
                <div className="mt-5 flex w-full max-w-[400px] flex-1 flex-col">{card}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section className="px-5 py-20 lg:px-20 lg:py-28">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="w-full max-w-[500px] lg:shrink-0">
            <Pill className="mb-5">AI writing assistance</Pill>
            <h2 className="text-[32px] font-black leading-tight tracking-tight text-slate-900 sm:text-[42px] sm:leading-[46px] sm:tracking-[-1.47px]">
              Rough notes in. Objective observations out.
            </h2>
            <p className="mt-5 text-lg text-slate-600 lg:text-[19px] lg:leading-[30px]">
              Paste your shorthand and CasePlanr drafts neutral, factual language for observations and hearing briefs. You
              review, edit and approve — always.
            </p>
            <ul className="mt-6 space-y-2 text-[17px] text-slate-700">
              {['Objective, strengths-based tone', 'Hearing brief drafts in seconds', 'Nothing is saved without your approval'].map(
                (item) => (
                  <li key={item} className="flex gap-3 py-2">
                    <span className="font-black text-blue-600">✓</span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="w-full max-w-[716px] space-y-3.5">
            <div className="rounded-[14px] border border-slate-300 bg-slate-50 p-[22px]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Your notes</p>
              <p className="mt-2 font-mono text-[15px] leading-6 text-slate-700">
                jr came in late again 2nd time, says bus issue. UA clean. talked abt job at warehouse, seems motivated but
                stressed re rent
              </p>
            </div>
            <div className="flex justify-center">
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">✦ Refine with AI</span>
            </div>
            <div className="rounded-[14px] border-2 border-blue-600 bg-white p-[22px] shadow-[0_12px_16px_rgba(37,99,235,0.2)]">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Observation draft</p>
              <p className="mt-2 text-base leading-relaxed text-slate-700">
                Participant arrived late to the session, the second occurrence this period, citing transportation delays.
                Urinalysis results were negative. Participant discussed a pending warehouse employment opportunity and
                expressed motivation, while noting stress related to housing costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Audit */}
      <section className="bg-slate-900 px-5 py-20 lg:px-20 lg:py-28">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="w-full max-w-[500px]">
            <span className="inline-flex h-[30px] items-center rounded-full bg-blue-900 px-3 text-sm font-semibold text-blue-200">
              Security & accountability
            </span>
            <h2 className="mt-5 text-[32px] font-black leading-tight tracking-tight text-white sm:text-[42px] sm:leading-[46px]">
              Every action, on the record
            </h2>
            <p className="mt-5 text-lg text-slate-300 lg:text-[19px] lg:leading-[30px]">
              Sensitive participant data deserves serious protection. CasePlanr logs every view, edit and export so your
              program can answer “who changed what, and when” instantly.
            </p>
          </div>
          <div className="w-full max-w-[716px] rounded-2xl border border-slate-600 bg-slate-800 p-3">
            {AUDIT_ROWS.map(({ icon: Icon, title, sub, time }, i) => (
              <div
                key={title}
                className={`flex items-center gap-3.5 p-3.5 ${i < AUDIT_ROWS.length - 1 ? 'border-b border-slate-600' : ''}`}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-blue-900">
                  <Icon className="size-[26px] text-blue-200" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-100">{title}</p>
                  <p className="truncate text-sm text-slate-400">{sub}</p>
                </div>
                <span className="shrink-0 text-sm text-slate-400">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 px-5 py-20 text-center lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-[32px] font-black tracking-tight text-white sm:text-[42px] sm:leading-[46px] sm:tracking-[-1.47px]">
            Spend your time on people, not paperwork.
          </h2>
          <p className="mt-4 text-lg text-blue-100 lg:text-[19px]">
            See how CasePlanr fits your court program in a 20-minute walkthrough.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <PrimaryBtn href={DEMO_MAIL} variant="white">
              Request a demo
            </PrimaryBtn>
            <a
              href="/cases"
              className="inline-flex h-[52px] items-center justify-center rounded-[10px] border border-white px-[26px] text-[17px] font-semibold text-white hover:bg-white/10"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-5 pb-8 pt-16 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] lg:gap-20">
            <div className="max-w-[360px]">
              <div className="flex items-center gap-2.5">
                <CasePlanrLogo className="size-9 text-blue-500" />
                <span className="text-[21px] font-black text-white">CasePlanr</span>
              </div>
              <p className="mt-3.5 text-[15px] leading-6 text-slate-300">
                Case management for court and treatment court teams.
              </p>
            </div>
            <FooterCol
              title="Product"
              links={[
                ['Features', '#features'],
                ['How it works', '#how-it-works'],
                ['Security', '#how-it-works'],
              ]}
            />
            <FooterCol title="Company" links={[['Contact', DEMO_MAIL], ['Request a demo', DEMO_MAIL]]} />
            <FooterCol
              title="Legal"
              links={[
                ['Privacy', '/privacy'],
                ['Terms', '/terms'],
                ['Accessibility', '/privacy'],
              ]}
            />
          </div>
          <p className="mt-10 border-t border-slate-600 pt-6 text-sm text-slate-300">
            © {new Date().getFullYear()} CasePlanr. All sample participant data shown is fictional.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="font-bold text-white">{title}</p>
      <ul className="mt-2 space-y-1">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="inline-flex min-h-11 items-center text-[15px] text-slate-300 hover:text-white">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const stepPreviewCardClass =
  'flex h-full min-h-[280px] flex-col rounded-[14px] border border-blue-200 bg-white p-[18px] shadow-[0_10px_14px_rgba(37,99,235,0.25)]';

function SetupStepCard() {
  return (
    <div className={stepPreviewCardClass}>
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700">
          TM
        </div>
        <div>
          <p className="font-bold text-slate-900">Taylor Morgan</p>
          <p className="text-xs text-slate-500">Case TC-2026-0522</p>
        </div>
      </div>
      <dl className="mt-3.5 flex-1 space-y-2 border-t border-blue-50 pt-2 text-[13px]">
        <Row label="Phase" value="Intake" valueClass="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700" />
        <Row label="Case manager" value="M. Ellison" />
        <Row label="Phone" value="(555) 014-2290" />
      </dl>
    </div>
  );
}

function ProgressStepCard() {
  const goals = [
    { text: 'Attend 3 support meetings weekly', done: true },
    { text: 'Negative UA for 30 days', done: true },
    { text: 'Enroll in GED program', done: false },
    { text: 'Complete job readiness workshop', done: false },
  ] as const;

  return (
    <div className={stepPreviewCardClass}>
      <p className="text-[13px] font-bold text-slate-900">Goals & progress</p>

      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${i <= 2 ? 'bg-blue-600' : i === 3 ? 'bg-blue-300' : 'bg-slate-200'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-bold text-blue-700">Phase 2 of 5 · Active treatment</p>
      </div>

      <ul className="mt-3 flex flex-1 flex-col justify-center gap-2">
        {goals.map(({ text, done }) => (
          <li
            key={text}
            className={`rounded-lg border px-2.5 py-2 text-[12px] leading-snug ${
              done
                ? 'border-green-100 bg-green-50/80 text-slate-800'
                : 'border-slate-100 bg-white text-slate-600'
            }`}
          >
            <span className={`mr-1.5 font-bold ${done ? 'text-green-600' : 'text-slate-400'}`}>{done ? '✓' : '○'}</span>
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-left text-xs leading-relaxed text-slate-700">
        <p className="font-bold text-slate-500">Oct 12 · Observation</p>
        <p className="mt-1">Attended all sessions on time; UA negative.</p>
      </div>
    </div>
  );
}

function SignStepCard() {
  return (
    <div className={stepPreviewCardClass}>
      <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
        <p className="text-[13px] font-bold text-slate-900">Case Plan — Taylor Morgan</p>
        <div className="mt-2.5 space-y-2">
          {[298, 249, 272, 199].map((w) => (
            <div key={w} className="h-[7px] rounded bg-blue-100" style={{ width: `${(w / 300) * 100}%` }} />
          ))}
        </div>
      </div>
      <div className="mt-auto flex gap-2.5 pt-3.5">
        <span className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-slate-300 text-sm font-semibold text-slate-900">
          Print
        </span>
        <span className="flex h-10 flex-1 items-center justify-center rounded-[10px] bg-blue-600 text-sm font-semibold text-white">
          Share & Sign
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = 'font-bold text-slate-900',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-2 border-t border-blue-50 py-1.5 first:border-t-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  );
}

import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Route, Switch, Link, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, Headphones, Home, Lightbulb, Pause, Play,
  RotateCcw, Settings2, Sparkles, Target, TimerReset, Type, Volume2, X,
} from 'lucide-react';

type TextSize = 'normal' | 'large';
type ProgressState = {
  completedLessons: number[];
  practiceCorrect: number;
  practiceAnswered: number;
  streak: number;
  sessions: number;
  totalFocusMinutes: number;
  textSize: TextSize;
  reducedMotion: boolean;
};

const initialProgress: ProgressState = {
  completedLessons: [], practiceCorrect: 0, practiceAnswered: 0, streak: 0,
  sessions: 0, totalFocusMinutes: 0, textSize: 'normal', reducedMotion: false,
};
const queryClient = new QueryClient();

function useLocalProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => {
    if (typeof window === 'undefined') return initialProgress;
    try {
      const stored = window.localStorage.getItem('lumalearn-progress');
      return stored ? { ...initialProgress, ...JSON.parse(stored) } : initialProgress;
    } catch { return initialProgress; }
  });
  useEffect(() => {
    window.localStorage.setItem('lumalearn-progress', JSON.stringify(progress));
    document.documentElement.classList.toggle('text-large', progress.textSize === 'large');
    document.documentElement.classList.toggle('reduce-motion', progress.reducedMotion);
  }, [progress]);
  const update = (change: Partial<ProgressState>) => setProgress((current) => ({ ...current, ...change }));
  return { progress, update, setProgress };
}

const navItems = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/study', label: 'Study', icon: BookOpen },
  { href: '/focus', label: 'Focus', icon: Clock3 },
  { href: '/progress', label: 'Progress', icon: Target },
];

function getTodayLabel() {
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function AppShell({ children, progress, update }: { children: ReactNode; progress: ProgressState; update: (change: Partial<ProgressState>) => void }) {
  const [location] = useLocation();
  const [showPreferences, setShowPreferences] = useState(false);
  const toggleTextSize = () => update({ textSize: progress.textSize === 'normal' ? 'large' : 'normal' });
  return (
    <div className="app-shell flex">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="sidebar desktop-sidebar fixed inset-y-0 left-0 z-20 flex w-64 flex-col px-5 py-7">
        <Link href="/" className="mb-12 flex items-center gap-3" data-testid="link-brand">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><Sparkles size={20} aria-hidden="true" /></span>
          <span><span className="block font-display text-2xl font-semibold">Luma</span><span className="block text-xs font-semibold tracking-[.16em] text-[hsl(var(--sidebar-foreground)/.65)]">LEARN</span></span>
        </Link>
        <p className="mb-3 px-3 text-[.68rem] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.48)]">Your space</p>
        <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`sidebar-link ${location === href ? 'active' : ''}`} aria-current={location === href ? 'page' : undefined} data-testid={`link-nav-${label.toLowerCase()}`}>
              <Icon size={19} strokeWidth={location === href ? 2.5 : 2} aria-hidden="true" /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-[hsl(var(--sidebar-accent))] p-4">
          <Lightbulb size={20} className="mb-3 text-[hsl(var(--secondary))]" aria-hidden="true" />
          <p className="text-sm font-semibold leading-5">Small steps count here.</p>
          <p className="mt-1 text-xs leading-5 text-[hsl(var(--sidebar-foreground)/.66)]">There is no catching up. Just the next kind step.</p>
        </div>
      </aside>
      <div className="main-grid min-h-[100dvh] w-full md:ml-64">
        <header className="relative z-10 flex min-h-[76px] items-center justify-between border-b border-[hsl(var(--border)/.7)] bg-[hsl(var(--background)/.86)] px-4 backdrop-blur md:px-11">
          <div className="flex items-center gap-2 md:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Sparkles size={17} aria-hidden="true" /></span>
            <span className="font-display text-xl font-semibold">Luma</span>
          </div>
          <div className="hidden text-sm text-[hsl(var(--muted-foreground))] md:block">{location === '/' ? getTodayLabel() : 'Your learning space'}</div>
          <div className="relative ml-auto flex items-center gap-2">
            <button className="button-quiet" onClick={toggleTextSize} aria-label={`Switch to ${progress.textSize === 'normal' ? 'large' : 'normal'} text`} data-testid="button-text-size"><Type size={17} aria-hidden="true" /><span className="hidden sm:inline">Text size</span><span className="text-xs font-semibold">{progress.textSize === 'normal' ? 'A' : 'A+'}</span></button>
            <button className="button-quiet" onClick={() => setShowPreferences((open) => !open)} aria-expanded={showPreferences} aria-controls="preferences-panel" aria-label="Open preferences" data-testid="button-preferences"><Settings2 size={18} aria-hidden="true" /></button>
            {showPreferences && <div id="preferences-panel" className="surface absolute right-0 top-12 z-30 w-64 rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between"><p className="font-semibold">Preferences</p><button className="button-quiet" onClick={() => setShowPreferences(false)} aria-label="Close preferences" data-testid="button-close-preferences"><X size={16} aria-hidden="true" /></button></div>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg p-2 text-sm hover:bg-[hsl(var(--muted))]"><span>Gentle motion</span><input type="checkbox" checked={!progress.reducedMotion} onChange={(event) => update({ reducedMotion: !event.target.checked })} data-testid="input-gentle-motion" /></label>
              <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Your choices stay on this device.</p>
            </div>}
          </div>
        </header>
        <main id="main-content">{children}</main>
        <nav className="mobile-nav fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.96)] p-2 shadow-[var(--shadow-lift)] backdrop-blur" aria-label="Mobile navigation">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-w-[4.2rem] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[.68rem] font-semibold ${location === href ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`} aria-current={location === href ? 'page' : undefined} data-testid={`link-mobile-${label.toLowerCase()}`}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>)}
        </nav>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, accent = false }: { icon: typeof Clock3; label: string; value: string; accent?: boolean }) {
  return <div className="surface flex items-center gap-3 rounded-2xl p-4" data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-[hsl(var(--secondary))]' : 'bg-[hsl(var(--muted))]'} text-[hsl(var(--primary))]`}><Icon size={19} aria-hidden="true" /></span><div><p className="text-xl font-bold">{value}</p><p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p></div></div>;
}

function HomePage({ progress }: { progress: ProgressState }) {
  const done = progress.completedLessons.includes(1);
  return <div className="page-wrap">
    <section className="hero-panel fade-up rounded-3xl p-6 sm:p-9">
      <div className="max-w-2xl">
        <p className="eyebrow !text-[hsl(var(--secondary))]">A little light for your learning</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">You can do one <em className="text-[hsl(var(--secondary))]">small</em> thing today.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-[hsl(var(--primary-foreground)/.75)] sm:text-lg">Welcome back. Your study space is ready with a short, free lesson designed to leave you feeling more capable than when you arrived.</p>
        <Link href="/study" className="button-primary mt-7 !bg-[hsl(var(--secondary))] !text-[hsl(var(--foreground))]" data-testid="link-start-free-module"><BookOpen size={18} aria-hidden="true" />{done ? 'Revisit your lesson' : 'Start the free lesson'}<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
      <div className="mt-8 flex items-center gap-3 text-sm text-[hsl(var(--primary-foreground)/.76)] sm:absolute sm:bottom-8 sm:right-10 sm:mt-0"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--secondary)/.6)]"><Clock3 size={15} aria-hidden="true" /></span><span>About 8 minutes · no pressure</span></div>
    </section>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
      <section className="fade-up delay-1" aria-labelledby="today-plan-heading">
        <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Your rhythm</p><h2 id="today-plan-heading" className="mt-1 font-display text-3xl font-semibold">Today's gentle plan</h2></div><span className="rounded-full bg-[hsl(var(--secondary)/.48)] px-3 py-1 text-xs font-bold text-[hsl(var(--foreground))]">1 of 3 steps</span></div>
        <div className="surface rounded-2xl p-5 sm:p-7">
          {[{ title: 'Arrive', detail: 'Choose a quiet place and set your intention.', icon: Brain, complete: true }, { title: 'Learn one idea', detail: 'A short lesson on finding the main idea.', icon: BookOpen, complete: done }, { title: 'Reflect', detail: 'Answer one question and notice what clicked.', icon: Lightbulb, complete: done }].map((item, index) => <div className={`step relative flex gap-4 pb-7 last:pb-0 ${item.complete ? 'completed' : index === 1 ? 'current' : ''}`} key={item.title}><span className="step-line" /><span className="step-marker">{item.complete ? <Check size={16} aria-hidden="true" /> : index + 1}</span><div className="pt-0.5"><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.detail}</p></div></div>)}
        </div>
      </section>
      <section className="fade-up delay-2" aria-labelledby="wins-heading">
        <div className="mb-4"><p className="eyebrow">Keep going</p><h2 id="wins-heading" className="mt-1 font-display text-3xl font-semibold">Recent wins</h2></div>
        <div className="surface rounded-2xl p-6">
          {progress.completedLessons.length === 0 && progress.sessions === 0 ? <div className="py-4"><span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><Sparkles size={21} aria-hidden="true" /></span><p className="font-semibold">Your first win is waiting.</p><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Complete a lesson or focus session and it will show up here.</p></div> : <div className="space-y-4"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 text-[hsl(var(--primary))]" size={19} aria-hidden="true" /><div><p className="text-sm font-semibold">You showed up</p><p className="text-xs text-[hsl(var(--muted-foreground))]">That is the hardest part.</p></div></div><div className="flex gap-3"><Clock3 className="mt-0.5 text-[hsl(var(--accent))]" size={19} aria-hidden="true" /><div><p className="text-sm font-semibold">{progress.totalFocusMinutes} minutes of focus</p><p className="text-xs text-[hsl(var(--muted-foreground))]">A little more than before.</p></div></div></div>}
        </div>
      </section>
    </div>
    <section className="mt-8 grid gap-3 sm:grid-cols-3">
      <StatPill icon={Target} label="Lessons complete" value={`${progress.completedLessons.length}/1`} />
      <StatPill icon={Clock3} label="Focus minutes" value={`${progress.totalFocusMinutes}`} accent />
      <StatPill icon={Sparkles} label="Current streak" value={`${progress.streak} ${progress.streak === 1 ? 'day' : 'days'}`} />
    </section>
  </div>;
}

const lessonSections = [
  { title: 'The main idea', body: 'The main idea is what a text is mostly about. It is the big message that holds the smaller details together.', tip: 'Ask yourself: “If I had to tell a friend one sentence, what would I say?”' },
  { title: 'Find the signal', body: 'Look for words and ideas that show up more than once. Headings, first sentences, and repeated phrases are helpful signals.', tip: 'You do not need to understand every word to find the main idea.' },
];

function StudyPage({ progress, update }: { progress: ProgressState; update: (change: Partial<ProgressState>) => void }) {
  const [step, setStep] = useState(0);
  const [comfortableReading, setComfortableReading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const section = lessonSections[Math.min(step, 1)];
  const isComplete = step === 3;
  const chooseAnswer = (choice: string) => {
    if (answer) return;
    setAnswer(choice);
    update({ practiceAnswered: progress.practiceAnswered + 1, practiceCorrect: progress.practiceCorrect + (choice === 'B' ? 1 : 0) });
  };
  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(`${section.title}. ${section.body}. Helpful note: ${section.tip}`);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance); setIsSpeaking(true);
  };
  const completeLesson = () => { update({ completedLessons: progress.completedLessons.includes(1) ? progress.completedLessons : [...progress.completedLessons, 1], streak: progress.streak || 1 }); setStep(3); };
  const next = () => { if (step === 2) completeLesson(); else setStep((current) => Math.min(current + 1, 3)); };
  return <div className="page-wrap">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Free module · reading skills</p><h1 className="mt-2 font-display text-4xl font-semibold">Find the main idea</h1></div><span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">Step {isComplete ? 3 : step + 1} of 3</span></div>
    <div className="mb-7 flex items-center gap-2" aria-label="Lesson progress">{[0, 1, 2].map((number) => <span key={number} className={`h-2 flex-1 rounded-full ${step > number || isComplete ? 'bg-[hsl(var(--primary))]' : step === number ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--muted))]'}`} />)}</div>
    {!isComplete ? <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="surface rounded-3xl p-6 sm:p-10" aria-live="polite">
        {step < 2 ? <><div className="mb-8 flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))]"><BookOpen size={17} aria-hidden="true" />{step === 0 ? 'Before we begin' : 'Lesson 1 of 1'}</span><button className="button-quiet border border-[hsl(var(--border))]" onClick={speak} disabled={!('speechSynthesis' in window)} aria-pressed={isSpeaking} data-testid="button-read-aloud"><Volume2 size={17} aria-hidden="true" />{isSpeaking ? 'Stop reading' : 'Read aloud'}</button></div>
          {step === 0 ? <><h2 className="font-display text-3xl font-semibold sm:text-4xl">Let’s make one idea feel clearer.</h2><p className="reading-copy mt-5 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">In this short lesson, you will learn a simple way to spot the main idea in a paragraph. You can take your time, reread anything, and skip back whenever you need.</p><div className="mt-8 rounded-2xl bg-[hsl(var(--secondary)/.35)] p-5"><p className="flex gap-3 text-sm font-semibold leading-6"><Lightbulb size={19} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />There is no perfect pace. Understanding one thing is enough for today.</p></div></> : <><p className="eyebrow">{section.title}</p><h2 className="mt-3 font-display text-3xl font-semibold">{section.body}</h2><p className="reading-copy mt-7 text-lg leading-8 text-[hsl(var(--muted-foreground))]">{section.tip}</p><div className={`mt-8 rounded-2xl border p-5 transition-colors ${comfortableReading ? 'border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.07)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--muted)/.42)]'}`}><p className="text-sm font-semibold">Try this on your next paragraph</p><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Read the heading, then the first sentence. Say the topic in your own words before looking at the details.</p></div></>}</> : <><div className="mb-8 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))]"><CircleHelp size={18} aria-hidden="true" />Quick check</div><h2 className="font-display text-3xl font-semibold">Which sentence is most likely the main idea?</h2><p className="mt-3 text-[hsl(var(--muted-foreground))]">Read the short paragraph, then choose the big message.</p><div className="mt-6 rounded-2xl bg-[hsl(var(--muted)/.5)] p-5 text-sm leading-7">“Mina moved her plant closer to the window. Within a week, its new leaves looked brighter. She learned that the plant needed more light to grow.”</div><div className="mt-5 space-y-3">{[['A', 'Mina has a plant.'], ['B', 'Plants need the right light to grow.'], ['C', 'Mina has a window.']].map(([letter, text]) => <button key={letter} onClick={() => chooseAnswer(letter)} className={`choice ${answer === letter ? (letter === 'B' ? 'correct' : 'incorrect') : ''}`} aria-pressed={answer === letter} data-testid={`button-answer-${letter.toLowerCase()}`}><span className="choice-letter">{letter}</span><span className="text-sm font-semibold">{text}</span>{answer === letter && (letter === 'B' ? <Check className="ml-auto text-[hsl(155_47%_32%)]" size={18} aria-hidden="true" /> : <X className="ml-auto text-[hsl(var(--accent))]" size={18} aria-hidden="true" />)}</button>)}</div>{answer && <p className={`mt-4 rounded-xl p-4 text-sm font-semibold ${answer === 'B' ? 'bg-[hsl(155_47%_38%/.12)] text-[hsl(155_47%_28%)]' : 'bg-[hsl(var(--accent)/.12)]'}`} role="status">{answer === 'B' ? 'That’s it. You found the big message behind the details.' : 'Almost. Look for the sentence that connects all three details.'}</p>}</>}
        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[hsl(var(--border))] pt-6"><button className="button-secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} data-testid="button-previous-step"><ChevronLeft size={18} aria-hidden="true" />Back</button><button className="button-primary" onClick={next} disabled={step === 2 && !answer} data-testid="button-next-step">{step === 2 ? 'Finish lesson' : 'Continue'}<ChevronRight size={18} aria-hidden="true" /></button></div>
      </section>
      <aside className="space-y-4" aria-label="Study supports"><div className="surface rounded-2xl p-5"><p className="mb-4 flex items-center gap-2 text-sm font-bold"><Settings2 size={17} className="text-[hsl(var(--primary))]" aria-hidden="true" />Make it comfortable</p><label className="flex cursor-pointer items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1" checked={comfortableReading} onChange={(event) => setComfortableReading(event.target.checked)} data-testid="input-comfortable-reading" /><span><strong>Comfort reading</strong><br /><span className="text-[hsl(var(--muted-foreground))]">Give important text a little more breathing room.</span></span></label></div><div className="soft-surface rounded-2xl p-5"><Headphones size={19} className="mb-3 text-[hsl(var(--primary))]" aria-hidden="true" /><p className="text-sm font-semibold">Listening is learning</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Use Read aloud whenever your eyes need a rest.</p></div></aside>
    </div> : <section className="surface fade-up mx-auto max-w-3xl rounded-3xl p-7 text-center sm:p-14" aria-live="polite"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><Check size={31} aria-hidden="true" /></span><p className="eyebrow mt-7">Lesson complete</p><h2 className="mt-3 font-display text-4xl font-semibold">You made space for one new idea.</h2><p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[hsl(var(--muted-foreground))]">That is real progress. Your lesson is saved on this device, ready whenever you want to return.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="button-primary" href="/"><Home size={18} aria-hidden="true" />Back to today</Link><Link className="button-secondary" href="/focus"><Clock3 size={18} aria-hidden="true" />Try a focus session</Link></div></section>}
  </div>;
}

function FocusPage({ progress, update }: { progress: ProgressState; update: (change: Partial<ProgressState>) => void }) {
  const [duration, setDuration] = useState(10);
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { window.clearInterval(timer); setRunning(false); setFinished(true); update({ sessions: progress.sessions + 1, totalFocusMinutes: progress.totalFocusMinutes + duration, streak: progress.streak || 1 }); return 0; } return value - 1; }), 1000); return () => window.clearInterval(timer); }, [running, duration, progress.sessions, progress.totalFocusMinutes, progress.streak, update]);
  const setTimer = (minutes: number) => { setDuration(minutes); setSeconds(minutes * 60); setRunning(false); setFinished(false); };
  const reset = () => { setSeconds(duration * 60); setRunning(false); setFinished(false); };
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  const timerProgress = `${Math.max(0, Math.min(100, ((duration * 60 - seconds) / (duration * 60)) * 100))}%`;
  return <div className="page-wrap">
    <div className="mx-auto max-w-4xl"><p className="eyebrow">A kinder kind of timer</p><h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Focus on one thing.</h1><p className="mt-3 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">A quiet container for your attention. Pausing is allowed. Starting again is allowed too.</p>
      {finished ? <section className="surface fade-up mt-10 rounded-3xl p-8 text-center sm:p-14" aria-live="polite"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))]"><CheckCircle2 size={32} className="text-[hsl(var(--primary))]" aria-hidden="true" /></span><p className="eyebrow mt-6">You kept a promise to yourself</p><h2 className="mt-3 font-display text-4xl font-semibold">That was {duration} minutes well spent.</h2><p className="mx-auto mt-4 max-w-md leading-7 text-[hsl(var(--muted-foreground))]">Take a breath before you choose what comes next. The work counts, even if it felt small.</p><div className="mt-8 flex justify-center gap-3"><button className="button-primary" onClick={reset} data-testid="button-focus-again"><RotateCcw size={18} aria-hidden="true" />Another round</button><Link className="button-secondary" href="/progress" data-testid="link-focus-progress">See progress</Link></div></section> : <div className="surface mt-10 grid items-center gap-8 rounded-3xl p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr]"><div className="text-center lg:order-2"><div className="timer-ring mx-auto" style={{ '--timer-progress': timerProgress } as CSSProperties} aria-label={`${minutes} minutes and ${secs} seconds remaining`}><span className="text-5xl font-bold tracking-tight">{minutes}:{secs}</span><span className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{running ? 'In focus' : 'Ready when you are'}</span></div><div className="mt-7 flex justify-center gap-3"><button className="button-primary min-w-32" onClick={() => setRunning((value) => !value)} data-testid="button-focus-toggle">{running ? <><Pause size={18} aria-hidden="true" />Pause</> : <><Play size={18} aria-hidden="true" />Start focus</>}</button><button className="button-secondary !min-h-[3.25rem] !px-4" onClick={reset} aria-label="Reset focus timer" data-testid="button-focus-reset"><TimerReset size={18} aria-hidden="true" /></button></div></div><div><p className="eyebrow">Choose your container</p><h2 className="mt-2 font-display text-3xl font-semibold">How much feels doable?</h2><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => setTimer(10)} className={`rounded-2xl border p-4 text-left transition-transform hover:-translate-y-0.5 ${duration === 10 ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'border-[hsl(var(--border))]'}`} aria-pressed={duration === 10} data-testid="button-duration-10"><p className="text-xl font-bold">10 min</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">A small start</p></button><button onClick={() => setTimer(25)} className={`rounded-2xl border p-4 text-left transition-transform hover:-translate-y-0.5 ${duration === 25 ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'border-[hsl(var(--border))]'}`} aria-pressed={duration === 25} data-testid="button-duration-25"><p className="text-xl font-bold">25 min</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">A deeper dive</p></button></div><div className="mt-7 flex gap-3 rounded-2xl bg-[hsl(var(--secondary)/.3)] p-4"><Lightbulb size={19} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" /><p className="text-sm leading-6">Before you start, name the one task you want to give your attention to.</p></div></div></div>}
      <div className="mt-5 flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]"><span className="flex items-center gap-2"><Sparkles size={16} aria-hidden="true" />{progress.sessions} completed {progress.sessions === 1 ? 'session' : 'sessions'}</span><span>{progress.totalFocusMinutes} total minutes</span></div>
    </div>
  </div>;
}

function ProgressPage({ progress, update }: { progress: ProgressState; update: (change: Partial<ProgressState>) => void }) {
  const accuracy = progress.practiceAnswered ? Math.round((progress.practiceCorrect / progress.practiceAnswered) * 100) : 0;
  const bars = useMemo(() => [0, 0, 0, 0, 0, 0, progress.sessions ? 1 : 0], [progress.sessions]);
  return <div className="page-wrap">
    <div className="mb-8"><p className="eyebrow">Your path, not a score</p><h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Notice how far you’ve come.</h1><p className="mt-3 max-w-xl leading-7 text-[hsl(var(--muted-foreground))]">Progress is evidence that you returned. It is not a test you can fail.</p></div>
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Progress summary"><StatPill icon={CheckCircle2} label="Lessons complete" value={`${progress.completedLessons.length}`} accent /><StatPill icon={Sparkles} label="Day streak" value={`${progress.streak}`} /><StatPill icon={Clock3} label="Focus minutes" value={`${progress.totalFocusMinutes}`} /></section>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <section className="surface rounded-3xl p-6 sm:p-8" aria-labelledby="path-heading"><div className="flex items-start justify-between"><div><p className="eyebrow">Learning path</p><h2 id="path-heading" className="mt-1 font-display text-3xl font-semibold">Foundations</h2></div><span className="rounded-full bg-[hsl(var(--secondary)/.5)] px-3 py-1 text-xs font-bold">{progress.completedLessons.length}/1 complete</span></div><div className="mt-8 flex gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${progress.completedLessons.includes(1) ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--secondary))]'}`}>{progress.completedLessons.includes(1) ? <Check size={19} aria-hidden="true" /> : <BookOpen size={19} aria-hidden="true" />}</span><div className="flex-1"><p className="font-semibold">Find the main idea</p><p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Learn a simple way to find the big message in a paragraph.</p><div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs text-[hsl(var(--muted-foreground))]">8 minutes</span>{progress.completedLessons.includes(1) ? <span className="text-xs font-bold text-[hsl(var(--primary))]">Complete</span> : <Link href="/study" className="button-quiet !px-0" data-testid="link-progress-study">Start lesson <ArrowRight size={15} aria-hidden="true" /></Link>}</div></div></div></section>
      <section className="surface rounded-3xl p-6 sm:p-8" aria-labelledby="habit-heading"><div className="flex items-start justify-between"><div><p className="eyebrow">Your rhythm</p><h2 id="habit-heading" className="mt-1 font-display text-3xl font-semibold">Showing up</h2></div><span className="flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]"><Sparkles size={15} aria-hidden="true" />{progress.streak} days</span></div><div className="habit-bar mt-6" aria-label="Activity over the last seven days">{bars.map((value, index) => <div className="habit-day" key={index}><div className={`habit-column ${index === 6 ? 'today' : ''}`} style={{ height: `${value ? 68 : 18 + (index % 3) * 5}%` }} /> <span>{['W', 'T', 'F', 'S', 'S', 'M', 'T'][index]}</span></div>)}</div><p className="mt-3 border-t border-[hsl(var(--border))] pt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">A regular rhythm can be tiny. Even ten minutes is a meaningful return.</p></section>
    </div>
    <section className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
      <div className="soft-surface rounded-3xl p-6 sm:p-8"><p className="eyebrow">Practice snapshot</p><h2 className="mt-1 font-display text-3xl font-semibold">Quiet confidence</h2><div className="mt-6 flex items-end gap-3"><span className="font-display text-6xl font-semibold">{accuracy}%</span><span className="pb-2 text-sm text-[hsl(var(--muted-foreground))]">practice accuracy</span></div><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{progress.practiceAnswered ? `${progress.practiceCorrect} of ${progress.practiceAnswered} answers felt right.` : 'Complete the practice question to make this snapshot yours.'}</p></div>
      <div className="surface rounded-3xl p-6 sm:p-8"><p className="eyebrow">Accessible study habits</p><h2 className="mt-1 font-display text-3xl font-semibold">Set yourself up gently.</h2><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[hsl(var(--muted)/.55)] p-4"><Volume2 size={18} className="text-[hsl(var(--primary))]" aria-hidden="true" /><p className="mt-3 text-sm font-semibold">Listen when needed</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Reading aloud is a valid way to learn.</p></div><div className="rounded-2xl bg-[hsl(var(--muted)/.55)] p-4"><Type size={18} className="text-[hsl(var(--primary))]" aria-hidden="true" /><p className="mt-3 text-sm font-semibold">Use your size</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Current preference: {progress.textSize === 'large' ? 'large text' : 'standard text'}.</p></div></div><button className="button-secondary mt-5 w-full" onClick={() => update({ textSize: progress.textSize === 'normal' ? 'large' : 'normal' })} data-testid="button-progress-text-size"><Type size={17} aria-hidden="true" />Switch to {progress.textSize === 'normal' ? 'large' : 'standard'} text</button></div>
    </section>
  </div>;
}

function NotFoundPage() {
  return <div className="page-wrap"><section className="surface mx-auto max-w-xl rounded-3xl p-10 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))]"><CircleHelp size={25} aria-hidden="true" /></span><h1 className="mt-6 font-display text-4xl font-semibold">This page wandered off.</h1><p className="mt-3 leading-7 text-[hsl(var(--muted-foreground))]">Let’s get you back to something useful.</p><Link href="/" className="button-primary mt-7" data-testid="link-not-found-home"><Home size={18} aria-hidden="true" />Back to today</Link></section></div>;
}

function Router() {
  const { progress, update } = useLocalProgress();
  return <AppShell progress={progress} update={update}><Switch><Route path="/" component={() => <HomePage progress={progress} />} /><Route path="/study" component={() => <StudyPage progress={progress} update={update} />} /><Route path="/focus" component={() => <FocusPage progress={progress} update={update} />} /><Route path="/progress" component={() => <ProgressPage progress={progress} update={update} />} /><Route component={NotFoundPage} /></Switch></AppShell>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
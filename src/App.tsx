import React, { useState, useEffect, useRef } from 'react';

const WAITLIST_KEY = 'capyfi_waitlist';

interface Entry { email: string; wallet: string; ts: number; }

function getCount(): number {
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    return raw ? (JSON.parse(raw) as Entry[]).length : 0;
  } catch { return 0; }
}

function saveEntry(entry: Entry) {
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    const list: Entry[] = raw ? JSON.parse(raw) : [];
    list.push(entry);
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

// Deterministic star field
const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  top:  `${(((i * 137.5) % 100))}%`,
  left: `${(((i * 97.3) % 100))}%`,
  size: i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
  dur:  2 + (i % 5) * 0.8,
  delay: (i % 10) * 0.4,
  minOp: 0.15,
  maxOp: i % 5 === 0 ? 0.9 : 0.5,
}));

export default function App() {
  const [email, setEmail]   = useState('');
  const [wallet, setWallet] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]   = useState('');
  const [count, setCount]   = useState(() => 342 + getCount()); // seed + real
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim();
    const wa = wallet.trim();
    if (!em) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError('Please enter a valid email address.'); return; }
    setError('');
    saveEntry({ email: em, wallet: wa, ts: Date.now() });
    setCount(c => c + 1);
    setSubmitted(true);
    // Send to Google Sheet (fire and forget)
    fetch('https://script.google.com/macros/s/AKfycbx5V7aieVSxYo8bQSy0Bm0_4qlfEa3hD7SP6womvyUtjX-SzwOai0rhWYaF8xuwyt0D/exec', {
      method: 'POST',
      body: JSON.stringify({ email: em, wallet: wa }),
    }).catch(() => {});
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#03040f' }}>

      {/* ── Star field ── */}
      <div className="stars">
        {STARS.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              ['--d' as any]: `${s.dur}s`,
              ['--delay' as any]: `${s.delay}s`,
              ['--min-op' as any]: s.minOp,
              ['--max-op' as any]: s.maxOp,
            }}
          />
        ))}
      </div>

      {/* ── Planet ── */}
      <div className="planet" />
      <div className="planet-glow" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <img src="/logo.jpg" alt="CapyFi" className="w-8 h-8 rounded-lg" />
          <span className="text-white font-bold text-lg tracking-tight">capyfi</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://app.capyfi.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-white font-semibold text-sm py-2 px-5 rounded-xl"
          >
            Launch App →
          </a>
          <a
            href="https://x.com/capyfi_xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Follow CapyFi on X"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-24 pt-8 text-center">

        {/* Badge */}
        <div className="fade-in-up delay-100 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Perpetual DEX &nbsp;·&nbsp; Early Access
        </div>

        {/* Headline */}
        <h1 className="fade-in-up delay-200 text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-4 max-w-3xl">
          Trade perpetuals,<br />
          <span className="italic font-light text-blue-200">with max cuteness.</span>
        </h1>

        {/* Live on Fluent badge */}
        <div className="fade-in-up delay-300 flex items-center gap-2 bg-white/5 border border-white/15 rounded-full px-4 py-2 mb-6">
          <span className="text-white/70 text-xs font-medium tracking-wide">live on</span>
          <img src="/fluent-logo.png" alt="Fluent" className="h-3.5 w-auto" />
        </div>

        {/* Subline */}
        <p className="fade-in-up delay-400 text-gray-400 text-base md:text-lg max-w-md mb-10 leading-relaxed">
          Join the waitlist — early signups may receive a{' '}
          <span className="text-blue-300 font-medium">potential surprise gift</span>{' '}
          when mainnet arrives. 🎁
        </p>

        {/* Form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="fade-in-up delay-400 w-full max-w-md flex flex-col gap-3"
          >
            <div className="flex flex-col gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-transparent text-white placeholder-white/60 text-sm px-3 py-2.5 rounded-xl border border-white/10 focus:border-blue-500/60 transition-colors"
              />
              <input
                type="text"
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                placeholder="Your wallet address (optional)"
                className="w-full bg-transparent text-white placeholder-white/60 text-sm px-3 py-2.5 rounded-xl border border-white/10 focus:border-blue-500/60 transition-colors font-mono text-xs"
              />
              <button
                type="submit"
                className="btn-primary w-full text-white font-semibold text-sm py-3 px-6 rounded-xl"
              >
                Join the Waitlist →
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}
          </form>
        ) : (
          <div className="fade-in-up delay-100 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl mb-1">
              🎉
            </div>
            <p className="text-white font-bold text-xl">You're on the list!</p>
            <p className="text-gray-400 text-sm max-w-xs text-center">
              You're in early — stay tuned for a potential surprise gift when mainnet arrives. 🎁
            </p>
          </div>
        )}

        {/* Counter */}
        <div className="fade-in-up delay-500 mt-8 text-white/60 text-xs">
          <span className="text-white font-semibold">{count.toLocaleString()}</span> traders already on the waitlist
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-5 text-white/40 text-xs tracking-widest font-medium">
        CAPYFI &nbsp;·&nbsp; PERPETUAL DEX &nbsp;·&nbsp; COMING SOON
      </footer>
    </div>
  );
}

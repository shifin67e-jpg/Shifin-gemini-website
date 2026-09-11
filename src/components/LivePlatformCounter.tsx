import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  CheckCircle2,
  Zap,
  Globe,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  Bot,
  Shield,
  Lock,
  Terminal,
  Activity,
  Server,
  Layers,
  Compass,
  Cpu,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Clock,
  Check,
} from 'lucide-react';
import { PublicPlatformStats, User } from '../types';
import { NinimoIcon } from './NinimoIcon';
import { getDeviceFingerprint } from '../lib/fingerprint';

interface LivePlatformCounterProps {
  publicStats: PublicPlatformStats | null;
  onSignUp: () => void;
  onSignIn: () => void;
  onAuthSuccess?: (user: User, token: string) => void;
}

export const LivePlatformCounter: React.FC<LivePlatformCounterProps> = ({
  publicStats,
  onSignUp,
  onSignIn,
  onAuthSuccess,
}) => {
  const [pulseKey, setPulseKey] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Embedded Quick-Auth state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Simulated live terminal events
  const [simulatedLogs, setSimulatedLogs] = useState([
    { id: 1, time: '12:00:01', tag: 'SYSTEM', text: 'Ninimo 24/7 engine initialized. Cloud container ready.', color: 'text-zinc-400' },
    { id: 2, time: '12:00:03', tag: 'CONNECT', text: 'Minecraft bot socket handshake to aternos.me:31892', color: 'text-emerald-400' },
    { id: 3, time: '12:00:04', tag: 'AUTH', text: 'Executed On-Join command: /login *******', color: 'text-amber-400' },
    { id: 4, time: '12:00:08', tag: 'ANTI-AFK', text: 'Movement routine: Strafe (0.4 blocks) + 360° head yaw rotation', color: 'text-teal-400' },
    { id: 5, time: '12:00:15', tag: 'HEALTH', text: 'Heartbeat OK. Position: X:142.5 Y:69.0 Z:-280.4', color: 'text-blue-400' },
  ]);

  // Real-time active online bots count
  const onlineBots = publicStats !== null ? publicStats.activeBotsOnline : 1;

  useEffect(() => {
    setPulseKey((k) => k + 1);
  }, [publicStats?.activeBotsOnline]);

  // Rotate simulated logs to give realistic live activity feel
  useEffect(() => {
    const logInterval = setInterval(() => {
      const actions = [
        { tag: 'ANTI-AFK', text: 'Anti-AFK cycle: Sneak crouch & arm swing triggered', color: 'text-emerald-400' },
        { tag: 'KEEPALIVE', text: 'Aternos / Minehut ping confirmed. Server idle timer reset.', color: 'text-teal-300' },
        { tag: 'TELEMETRY', text: 'Bot status: Healthy (Health 20/20, Food 20/20, 0 ms lag)', color: 'text-zinc-300' },
        { tag: 'CHAT', text: '<Server> Automatic daily save completed successfully.', color: 'text-amber-300' },
        { tag: 'ANTI-AFK', text: 'Movement routine: Micro-jump and strafe right', color: 'text-emerald-400' },
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setSimulatedLogs((prev) => [
        ...prev.slice(1),
        { id: Date.now(), time: timeStr, tag: randomAction.tag, text: randomAction.text, color: randomAction.color },
      ]);
    }, 4000);

    return () => clearInterval(logInterval);
  }, []);

  const handleEmbeddedAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        authMode === 'login'
          ? { usernameOrEmail: username || email, password }
          : { username, email, password };

      const deviceId = getDeviceFingerprint();
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
          'X-Device-Fingerprint': deviceId,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('ninimo_token', data.token);
      try {
        localStorage.setItem('ninimo_user_profile', JSON.stringify(data.user));
      } catch {}

      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.token);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How does Ninimo keep Aternos or Minehut servers online 24/7?',
      a: 'Free Minecraft hosts like Aternos and Minehut automatically shut down when no players are detected. Ninimo hosts an isolated 24/7 cloud bot that connects directly to your server. With intelligent Anti-AFK patterns (strafing, sneaking, head movements), the host sees an active player and stays online around the clock.',
    },
    {
      q: 'Do I need to leave my computer or phone turned on?',
      a: 'No! Ninimo runs entirely on cloud servers. Once you click "Start Bot" and close your browser or turn off your PC, your bot continues running in the background 24/7.',
    },
    {
      q: 'What happens if my Minecraft server restarts or crashes?',
      a: 'Ninimo features an automated smart-reconnect loop. If the connection drops or the server reboots, Ninimo waits for the server to come back online, reconnects automatically, and re-executes your on-join authentication commands.',
    },
    {
      q: 'How do I set up auto-login for servers with passwords (/login)?',
      a: 'In your bot settings, simply type your login command (e.g. /login yourpassword) into the "On-Join Command" box. Ninimo will automatically send the command right after joining the server.',
    },
    {
      q: 'Is Ninimo free to use?',
      a: 'Yes, Ninimo provides 100% free 24/7 bot hosting for your Minecraft servers.',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 w-full max-w-7xl mx-auto overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP NOTICE & HERO SECTION WITH PROMINENT FAST-LOGIN PORTAL */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl">
        {/* Ambient floating neon background glow */}
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
          {/* Top Telemetry & Notice Row */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4"
          >
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold tracking-wide">24/7 MINECRAFT CLOUD BOT</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-emerald-400 font-mono text-[11px]">READY FOR DEPLOYMENT</span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800 px-3.5 py-1.5 rounded-2xl text-xs text-zinc-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">Status:</span>
              <span className="font-bold text-emerald-400 font-mono">100% Free 24/7 Hosting</span>
            </div>
          </motion.div>

          {/* Main Hero Grid: Top-Prominent Fast-Login Card + Left Copy & Live Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Fast-Login / Sign-Up Interactive Card - Highly Prominent & Positioned High */}
            <div
              className="lg:col-span-5 lg:order-2 relative"
            >
              {/* Glowing outer aura */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/40 to-emerald-500/30 rounded-[28px] blur-md opacity-90 pointer-events-none" />

              <div className="relative overflow-hidden bg-zinc-950 border-2 border-emerald-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/70">
                {/* Notice Pill atop the card */}
                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/90">
                  <div className="flex items-center gap-2.5">
                    <NinimoIcon size="sm" />
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                        <span>Sign In to Launch Bot</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </h3>
                      <p className="text-[11px] text-zinc-400">Manage your private 24/7 cloud bot</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm shrink-0">
                    Instant Access
                  </span>
                </div>

                {/* Instant Zero-Lag Tab Switcher */}
                <div className="mt-4 grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      authMode === 'login'
                        ? 'bg-zinc-800 text-white border border-emerald-500/50 shadow-sm text-emerald-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Lock className={`w-3.5 h-3.5 ${authMode === 'login' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      authMode === 'signup'
                        ? 'bg-zinc-800 text-white border border-emerald-500/50 shadow-sm text-emerald-300'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${authMode === 'signup' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span>Create Account</span>
                  </button>
                </div>

                {/* Direct Form */}
                <form onSubmit={handleEmbeddedAuthSubmit} className="mt-4 space-y-3">
                  {authError && (
                    <div className="p-2.5 bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2 font-medium shadow-sm animate-in fade-in duration-150">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Username or Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      {authMode === 'login' ? 'Username or Email' : 'Choose Username'}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={authMode === 'login' ? 'e.g. player1 or player@example.com' : 'e.g. MinecraftPro99'}
                      required
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                    />
                  </div>

                  {/* Email for signup (Snappy instant transition without layout lag) */}
                  {authMode === 'signup' && (
                    <div className="animate-in fade-in duration-150">
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required={authMode === 'signup'}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                      />
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-400 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/70 disabled:opacity-50 cursor-pointer mt-2 border border-emerald-400/40"
                  >
                    {authLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{authMode === 'login' ? 'Sign In & Launch Bot' : 'Create Free Account & Launch'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer hint */}
                <div className="mt-3.5 pt-3 border-t border-zinc-800/90 text-center">
                  <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 font-medium">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Encrypted session storage. Private per-user bot fleet.
                  </span>
                </div>
              </div>
            </div>

            {/* Left Hero Content */}
            <div className="lg:col-span-7 lg:order-1 space-y-6">
              {/* Staggered animated title text */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/70 px-3 py-1 rounded-lg border border-emerald-500/40 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" style={{ animationDuration: '6s' }} />
                  Automated Server Keep-Alive
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]"
                >
                  Keep Your Minecraft Server <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
                    Online 24/7 With Zero Sleep
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-zinc-300 text-sm sm:text-base leading-relaxed"
                >
                  Deploy high-speed Minecraft bots to prevent <strong>Aternos</strong>, <strong>Minehut</strong>, and private SMPs from going to sleep. Sign in to manage your bots instantly.
                </motion.p>
              </div>

              {/* Real-time Fleet Counter Mini Card */}
              <motion.div
                key={`online-card-${pulseKey}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="bg-zinc-950/90 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
                      <span>{onlineBots}</span>
                      <span className="text-xs sm:text-sm text-emerald-400 font-sans font-bold">
                        {onlineBots === 1 ? 'Bot Active Now' : 'Bots Active Now'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Cloud fleet keeping Minecraft worlds online
                    </div>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </motion.div>

              {/* Feature Checklist Chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-300 pt-1"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No PC Kept On</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Anti-AFK Movement</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Auto-Auth /login</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Free Forever</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SCROLL-TRIGGERED: LIVE IN-GAME BOT SIMULATOR & CONSOLE PREVIEW */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400"
            >
              <Terminal className="w-4 h-4" />
              <span>LIVE CLOUD BOT SIMULATION</span>
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Watch What Happens When Ninimo Connects
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Your bot performs realistic player interactions to keep servers active 24/7 without manual intervention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Console Active
            </span>
          </div>
        </div>

        {/* Live Terminal & HUD Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulated In-Game HUD Card */}
          <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Bot Status: Online</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                24/7 AFK
              </span>
            </div>

            {/* Health & Food bars */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Health</span>
                  <span className="text-emerald-400 font-bold">20 / 20 HP</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-rose-500 rounded-full w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Hunger / Food</span>
                  <span className="text-amber-400 font-bold">20 / 20</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-amber-500 rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* Telemetry info */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-[11px] font-mono">
              <div className="p-2 bg-zinc-900 rounded-lg">
                <div className="text-zinc-500 text-[9px] uppercase">Coordinates</div>
                <div className="text-zinc-200 font-bold mt-0.5">X: 142 Y: 69 Z: -280</div>
              </div>
              <div className="p-2 bg-zinc-900 rounded-lg">
                <div className="text-zinc-500 text-[9px] uppercase">Ping Latency</div>
                <div className="text-emerald-400 font-bold mt-0.5">14 ms</div>
              </div>
            </div>

            {/* Anti-AFK state */}
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span>Anti-AFK Movement: <strong>Active (Strafe & Look)</strong></span>
            </div>
          </div>

          {/* Simulated Terminal Streaming Box */}
          <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 font-mono text-xs overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 text-zinc-500 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 text-zinc-400">ninimo-bot-telemetry.log</span>
              </div>
              <span>UTF-8</span>
            </div>

            <div className="space-y-2">
              {simulatedLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2.5 text-[11px] leading-relaxed"
                >
                  <span className="text-zinc-500 shrink-0">[{log.time}]</span>
                  <span className="px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-400 font-bold shrink-0">
                    {log.tag}
                  </span>
                  <span className={`${log.color} truncate`}>{log.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Streaming events continuously in isolated background containers...</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 3. SCROLL-TRIGGERED: 6 CORE SUPERPOWERS (BENTO GRID WITH POP-UPS) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30"
          >
            <Cpu className="w-3.5 h-3.5" />
            Engine Architecture
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight"
          >
            Built Specifically For 24/7 Minecraft Servers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-sm text-zinc-400"
          >
            Everything you need to keep your SMP, Aternos server, and farms operating without ever stopping.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all shadow-lg"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">24/7 Cloud Background Persistence</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bots execute continuously in isolated server processes. Your bots stay active even if you close the browser, turn off your PC, or disconnect your phone.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all shadow-lg"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Intelligent Anti-AFK Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Multi-pattern movement randomizer including strafing, sneaking, jumping, swinging arms, and rotating 360° head yaw to defeat AFK kick plugins.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.15 }}
            whileHover={{ y: -4 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all shadow-lg"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Automated On-Join Commands</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatically sends <code className="text-emerald-300 font-mono">/login password</code> or server hub navigation commands after joining to prevent server auth timeouts.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all shadow-lg"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live In-Game Chat Console</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Read real-time Minecraft server chat and send messages or admin commands directly from the web panel into the Minecraft world.
            </p>
          </motion.div>

          {/* Card 5 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.25 }}
            whileHover={{ y: -4 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all shadow-lg"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Nether Portal Link Calculator</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Integrated real-time coordinate synchronizer. Compute exact Overworld and Nether portal pairs with 1-click coordinate syncing.
            </p>
          </motion.div>

          {/* Card 6 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition-all shadow-lg"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Account Isolation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every user receives an isolated, password-protected account with persistent configuration storage and independent bot profiles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SCROLL-TRIGGERED: 3-STEP QUICK LAUNCH ROADMAP */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8"
      >
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            Simple 3-Step Setup
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">How To Start Your 24/7 Bot</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-3 relative"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-base flex items-center justify-center border border-emerald-500/30">
              01
            </div>
            <h3 className="text-base font-bold text-white">Create Your Profile</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sign up in 10 seconds with a username and password. No credit card or payment required.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-3 relative"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-base flex items-center justify-center border border-emerald-500/30">
              02
            </div>
            <h3 className="text-base font-bold text-white">Enter Server IP & Port</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter your server address (e.g. <code className="text-emerald-300 font-mono">node.aternos.me</code> and dynamic port), bot name, and version.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-3 relative"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-base flex items-center justify-center border border-emerald-500/30">
              03
            </div>
            <h3 className="text-base font-bold text-white">Activate 24/7 Mode</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Click "Start Bot". Your bot will connect immediately, authenticate, and keep the server online 24/7.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 5. SCROLL-TRIGGERED: VERIFIED COMPATIBILITY BADGES */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-4"
      >
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          Works seamlessly across all Minecraft servers & hosts
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['Aternos (Free)', 'Minehut', 'FalixNodes', 'PloudOS', 'Server.pro', 'PaperMC', 'Purpur', 'Spigot', 'Fabric', 'Forge'].map((badge) => (
            <span
              key={badge}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:border-emerald-500/40 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{badge}</span>
            </span>
          ))}
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 6. SCROLL-TRIGGERED: INTERACTIVE FAQ ACCORDION */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Got Questions? We Have Answers</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 7. SCROLL-TRIGGERED: FINAL CALL TO ACTION CARD */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Ready To Keep Your Server Online 24/7?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Join thousands of Minecraft players maintaining active Aternos & SMP servers with zero sleep.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onSignUp}
              className="px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-2xl text-xs sm:text-sm font-black tracking-wide shadow-xl shadow-emerald-950/80 transition-all cursor-pointer border border-emerald-400/30 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onSignIn}
              className="px-6 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Sign In</span>
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

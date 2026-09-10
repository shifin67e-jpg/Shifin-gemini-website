import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { PublicPlatformStats } from '../types';

interface LivePlatformCounterProps {
  publicStats: PublicPlatformStats | null;
  onSignUp: () => void;
  onSignIn: () => void;
}

export const LivePlatformCounter: React.FC<LivePlatformCounterProps> = ({
  publicStats,
  onSignUp,
  onSignIn,
}) => {
  const [pulseKey, setPulseKey] = useState(0);

  // Real-time active online bots count
  const onlineBots = publicStats !== null ? publicStats.activeBotsOnline : 1;

  useEffect(() => {
    setPulseKey((k) => k + 1);
  }, [publicStats?.activeBotsOnline]);

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Primary Hero Banner with Live Bots Online Counter */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-8">
          {/* Header Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold tracking-wide">LIVE PLATFORM TELEMETRY</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-zinc-300 font-mono text-[11px]">REAL-TIME SYNC</span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-2xl text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">Status:</span>
              <span className="font-bold text-emerald-400 font-mono">System Active</span>
            </div>
          </div>

          {/* Main Hero Header & Direct Live Bots Online Counter Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                24/7 Minecraft Bot Hosting <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
                  Live & Isolated in Complete Privacy
                </span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
                Launch dedicated 24/7 Minecraft bots with automatic reconnect, custom on-join commands, and intelligent anti-AFK movement routines on high-performance cloud hosting.
              </p>
            </div>

            {/* Focused "Currently Bots Online" Counter */}
            <div className="lg:col-span-5">
              <motion.div
                key={`online-card-${pulseKey}`}
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative overflow-hidden bg-zinc-950/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/30 flex flex-col justify-between hover:border-emerald-400/70 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live
                  </span>
                </div>

                <div className="mt-6 space-y-1">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight flex items-baseline gap-3">
                    <span>{onlineBots}</span>
                    <span className="text-sm sm:text-base text-emerald-400 font-sans font-bold">
                      {onlineBots === 1 ? 'Bot Online' : 'Bots Online'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-400 font-medium pt-1">
                    Currently Online & Active
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span>State:</span>
                  <span className="text-emerald-400 font-semibold font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Running 24/7
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Primary Interactive Actions - Join / Sign In */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                id="landing-signup-cta"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={onSignUp}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-2xl text-xs sm:text-sm font-black tracking-wide shadow-xl shadow-emerald-950/80 transition-all cursor-pointer border border-emerald-400/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join & Create Bot (Free)</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                id="landing-signin-cta"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={onSignIn}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/90 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Sign In to Existing Session</span>
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Free 24/7 Hosting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Anti-AFK</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 350 }}
          className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">24/7 Cloud Execution</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Continuous background execution keeps your bot logged in 24/7 without needing your personal device turned on.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 350 }}
          className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Automated Anti-AFK Engine</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Multi-pattern anti-AFK protocols including strafe walking, arm swings, sneak wiggles, and yaw adjustments to stay in-game safely.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 350 }}
          className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Automated On-Join Commands</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Automatically sends authentication commands like <code className="text-emerald-300 font-mono">/login password</code> and auto-reconnects on server restart.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

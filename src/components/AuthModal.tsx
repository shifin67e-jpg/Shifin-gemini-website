import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { getDeviceFingerprint } from '../lib/fingerprint';
import { User } from '../types';
import { NinimoIcon } from './NinimoIcon';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: User, token: string) => void;
  canDismiss?: boolean;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  canDismiss = true,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        mode === 'login'
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

      // Save token and user profile in local client storage for persistent session
      localStorage.setItem('ninimo_token', data.token);
      try {
        localStorage.setItem('ninimo_user_profile', JSON.stringify(data.user));
      } catch {}
      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 sm:backdrop-blur-md overflow-y-auto overscroll-contain">
      <motion.div
        id="auth-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[92dvh] sm:max-h-none overflow-y-auto shadow-2xl relative my-auto transform-gpu"
      >
        {/* Hardware-accelerated ambient glowing light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none transform-gpu" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between relative border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <NinimoIcon size="md" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                Ninimo
                <span className="text-emerald-400 font-bold text-[9px] sm:text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  24/7 Platform
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">High-Performance Minecraft Bot Fleet</p>
            </div>
          </div>

          {canDismiss && onClose && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Tab switchers with fluid spring layout pill */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5">
          <div className="grid grid-cols-2 p-1 sm:p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl sm:rounded-2xl relative">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 sm:py-2.5 text-xs font-bold rounded-lg sm:rounded-xl transition-colors relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                mode === 'login' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
              {mode === 'login' && (
                <motion.div
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 bg-zinc-800 border border-emerald-500/30 rounded-lg sm:rounded-xl -z-10 shadow-sm shadow-emerald-950/40"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 sm:py-2.5 text-xs font-bold rounded-lg sm:rounded-xl transition-colors relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                mode === 'signup' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Create Account</span>
              {mode === 'signup' && (
                <motion.div
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 bg-zinc-800 border border-emerald-500/30 rounded-lg sm:rounded-xl -z-10 shadow-sm shadow-emerald-950/40"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Form with optimized snug padding */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="p-2.5 sm:p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl sm:rounded-2xl text-xs flex items-center gap-2 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
              <span>{mode === 'login' ? 'Username or Email' : 'Choose Username'}</span>
              <span className="text-[10px] text-zinc-500 font-mono font-normal">
                {mode === 'signup' ? '3-16 characters' : ''}
              </span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'login' ? 'player1 or player@example.com' : 'e.g. MinecraftPro99'}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-sans"
              />
            </div>
          </div>

          {/* Email (Signup only with smooth accordion entry) */}
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required={mode === 'signup'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-sans"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">
                Password
              </label>
              {mode === 'signup' && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  Min 6 characters
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? '••••••••' : '••••••••'}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Button with spring physics */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/60 disabled:opacity-50 cursor-pointer mt-1 sm:mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Ninimo' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          {/* Guarantee pill banner */}
          <div className="pt-1 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Session stored securely. Bots auto-resume on server updates.</span>
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

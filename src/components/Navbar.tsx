import React from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  Plus,
  Activity,
  LogOut,
  LogIn,
  ShieldAlert,
  ArrowLeftRight,
} from 'lucide-react';
import { GlobalStats, PublicPlatformStats, User } from '../types';

interface NavbarProps {
  stats: GlobalStats;
  publicStats?: PublicPlatformStats | null;
  isStreamConnected: boolean;
  currentUser: User | null;
  globalBotLimit?: number;
  showingAdminPage?: boolean;
  isImpersonating?: boolean;
  onOpenAdmin?: () => void;
  onExitImpersonation?: () => void;
  onAddNewBot: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  publicStats,
  isStreamConnected,
  currentUser,
  globalBotLimit = 1,
  showingAdminPage = false,
  isImpersonating = false,
  onOpenAdmin,
  onExitImpersonation,
  onAddNewBot,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-2.5 sm:px-4 lg:px-8 py-2.5 sm:py-3 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -6 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-950 flex items-center justify-center cursor-pointer shrink-0"
          >
            <div className="w-full h-full bg-zinc-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
          </motion.div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none truncate">
                Ninimo
              </h1>
              <span className="text-[9px] sm:text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full shrink-0">
                24/7
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-zinc-400 mt-0.5 leading-none">
              Minecraft Bot Commander
            </p>
          </div>
        </div>

        {/* Center Live Stats Badge or Impersonation Banner */}
        {isImpersonating ? (
          <div className="hidden sm:flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 rounded-2xl px-3 py-1 text-xs text-amber-300 font-semibold shadow-sm animate-pulse shrink-0">
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{currentUser?.username}</span>
            <button
              onClick={onExitImpersonation}
              className="ml-1 px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition-all shrink-0"
            >
              Exit
            </button>
          </div>
        ) : currentUser ? (
          <div className="hidden lg:flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  stats.activeBots > 0
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="text-zinc-300 font-medium">
                <strong className="text-emerald-400 font-bold">{stats.activeBots}</strong> / {stats.totalBots} Online
              </span>
            </div>

            <span className="text-zinc-700">|</span>

            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>
                {isStreamConnected ? 'Live Connection' : 'Syncing...'}
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl px-3.5 py-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
            <span className="text-zinc-300 font-medium">
              <strong className="text-emerald-400 font-bold">{publicStats?.activeBotsOnline ?? 1}</strong>{' '}
              {(publicStats?.activeBotsOnline ?? 1) === 1 ? 'Bot Online' : 'Bots Online'}
            </span>
          </div>
        )}

        {/* Right action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Admin Page Switcher for Shifin or other admin users */}
          {currentUser?.isAdmin && onOpenAdmin && (
            <motion.button
              id="navbar-admin-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAdmin}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border shrink-0 ${
                showingAdminPage
                  ? 'bg-amber-500 text-black border-amber-400 shadow-amber-900/30'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              }`}
              title={showingAdminPage ? 'Return to Dashboard' : 'Open Admin Panel'}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">{showingAdminPage ? 'Dashboard' : 'Admin Panel'}</span>
              <span className="hidden xs:inline md:hidden">{showingAdminPage ? 'Back' : 'Admin'}</span>
            </motion.button>
          )}

          {/* Dynamic Bot Limit Indicator & Add Bot Action */}
          {!showingAdminPage && currentUser && (
            stats.totalBots >= globalBotLimit ? (
              <div
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-[11px] sm:text-xs font-bold select-none shadow-sm shrink-0"
                title={`Account Limit: ${stats.totalBots}/${globalBotLimit} bots configured`}
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                <span>{stats.totalBots}/{globalBotLimit}</span>
                <span className="hidden sm:inline text-zinc-400">Bots</span>
              </div>
            ) : (
              <motion.button
                id="btn-add-new-bot"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={onAddNewBot}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-md shadow-emerald-950/60 cursor-pointer shrink-0"
                title={`You have ${stats.totalBots} of ${globalBotLimit} bots configured`}
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Add</span>
                <span className="text-[10px] bg-emerald-700/80 px-1 py-0.2 rounded font-mono">
                  {stats.totalBots}/{globalBotLimit}
                </span>
              </motion.button>
            )
          )}

          {/* User Auth Profile & Sign Out Button */}
          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* User Identity Pill */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl shrink-0">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black uppercase shrink-0 ${
                    currentUser.isAdmin
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  {currentUser.username.slice(0, 1)}
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-zinc-200 truncate max-w-[55px] xs:max-w-[75px] sm:max-w-[120px]">
                  {currentUser.username}
                </span>
                {currentUser.isAdmin && (
                  <span className="hidden md:inline-block px-1 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono font-bold uppercase tracking-wider border border-amber-500/30">
                    Admin
                  </span>
                )}
              </div>

              {/* Explicit Sign Out Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center justify-center gap-1 p-2 sm:px-2.5 sm:py-2 bg-zinc-900/90 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm shrink-0"
                title="Sign Out of Account"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-zinc-400 hover:text-rose-400 shrink-0" />
                <span className="hidden lg:inline text-[11px]">Sign Out</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/60 cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

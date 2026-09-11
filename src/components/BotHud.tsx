import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Square,
  RotateCw,
  Edit3,
  Trash2,
  Clock,
  Shield,
  Zap,
  RotateCcw,
  Compass,
  AlertTriangle,
  Heart,
  Beef,
} from 'lucide-react';
import { BotState } from '../types';
import { HeartsAndHunger } from './HeartsAndHunger';

interface BotHudProps {
  bot: BotState;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onEdit: (bot: BotState) => void;
  onDelete: (id: string) => void;
  onToggleAntiAfk: (id: string, enabled: boolean) => void;
  onOpenNetherCalc?: () => void;
  isAdmin?: boolean;
}

export const BotHud: React.FC<BotHudProps> = ({
  bot,
  onStart,
  onStop,
  onRestart,
  onEdit,
  onDelete,
  onToggleAntiAfk,
  onOpenNetherCalc,
  isAdmin,
}) => {
  const [avatarError, setAvatarError] = useState(false);

  // Avatar URL from official Minecraft avatar CDN
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(bot.config.username)}/96`;

  // Format uptime
  const formatUptime = (sec: number) => {
    if (!sec || sec <= 0) return '00:00';
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  const statusConfig = {
    online: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse',
      label: 'CONNECTED',
    },
    starting: {
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400 animate-spin',
      label: 'CONNECTING...',
    },
    reconnecting: {
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400 animate-pulse',
      label: bot.nextReconnectIn ? `REJOINING IN ${bot.nextReconnectIn}s` : 'RECONNECTING',
    },
    stopped: {
      color: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40',
      dot: 'bg-zinc-500',
      label: 'STOPPED',
    },
    kicked: {
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      dot: 'bg-orange-500 animate-ping',
      label: 'KICKED',
    },
    error: {
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
      label: 'ERROR',
    },
  };

  const curStatus = statusConfig[bot.status] || statusConfig.stopped;

  return (
    <div
      id="bot-hud-main"
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5"
    >
      {/* Top Bar: Skin Head, IGN, Server IP, Status Pill, Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-4">
          {/* Minecraft Skin Head with motion */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative shrink-0"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-700/60 p-1 flex items-center justify-center shadow-lg shadow-black/60 relative">
              <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center">
                {!avatarError ? (
                  <img
                    src={avatarUrl}
                    alt={bot.config.username}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover pixelated rounded-xl"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-zinc-900 flex items-center justify-center font-black text-emerald-300 text-xl">
                    {bot.config.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Online indicator dot */}
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 z-10 shadow-sm ${curStatus.dot}`}
              />
            </div>
          </motion.div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {bot.config.username}
              </h2>
              {bot.config.name && bot.config.name !== bot.config.username && (
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-lg font-medium border border-zinc-700/50">
                  {bot.config.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 flex-wrap">
              <span className="font-mono text-zinc-300 font-medium">
                {bot.config.host}:{bot.config.port}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="capitalize text-zinc-400 font-medium">
                {bot.config.auth === 'offline' ? 'Cracked' : 'Premium'}
              </span>
              {bot.config.version ? (
                <>
                  <span className="text-zinc-600">•</span>
                  <span>v{bot.config.version}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Status Pill & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider ${curStatus.color}`}
          >
            <span className={`w-2 h-2 rounded-full ${curStatus.dot}`} />
            <span>{curStatus.label}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1.5 rounded-2xl">
            {bot.status === 'online' || bot.status === 'starting' || bot.status === 'reconnecting' ? (
              <motion.button
                id="btn-stop-bot"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={() => onStop(bot.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Stop Bot"
              >
                <Square className="w-3.5 h-3.5 fill-rose-400" />
                <span>Stop</span>
              </motion.button>
            ) : (
              <motion.button
                id="btn-start-bot"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={() => onStart(bot.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-950 cursor-pointer"
                title="Connect & Run 24/7"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start</span>
              </motion.button>
            )}

            <motion.button
              id="btn-restart-bot"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              onClick={() => onRestart(bot.id)}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              title="Restart Bot"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </motion.button>

            <motion.button
              id="btn-edit-bot"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              onClick={() => onEdit(bot)}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              title="Configure Bot Settings"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </motion.button>

            <motion.button
              id="btn-delete-bot"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              onClick={() => onDelete(bot.id)}
              className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Delete Bot Profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Error alert banner if any */}
      {bot.lastError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Connection Notice:</span> {bot.lastError}
          </div>
        </motion.div>
      )}

      {/* Primary Telemetry: Health, Hunger, Experience Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
        {/* Authentic Minecraft Health & Hunger */}
        <HeartsAndHunger
          health={bot.health}
          maxHealth={bot.maxHealth}
          food={bot.food}
          saturation={bot.saturation}
        />

        {/* Experience & Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Experience Level</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold font-mono text-xs">
                Lv. {bot.experience.level}
              </span>
              <span className="text-zinc-500 text-[11px] font-mono">
                {Math.round(bot.experience.progress * 100)}%
              </span>
            </div>
          </div>

          {/* Minecraft XP Bar */}
          <div className="w-full bg-zinc-900 rounded-full h-2.5 border border-zinc-800 p-0.5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(4, Math.min(100, bot.experience.progress * 100))}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Telemetry: Uptime, Reconnects, Anti-AFK state, Coordinates */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Live Uptime */}
        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Uptime</span>
          </div>
          <p className="text-sm font-bold font-mono text-white">
            {formatUptime(bot.uptimeSeconds)}
          </p>
        </div>

        {/* Auto-Reconnect Status */}
        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>Auto Reconnect</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold font-mono text-white">
              {bot.reconnectCount} Rejoins
            </p>
            {bot.config.autoReconnect ? (
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                24/7 ON
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                OFF
              </span>
            )}
          </div>
        </div>

        {/* Anti-AFK Routine Status */}
        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Anti-AFK</span>
            </div>
            <input
              type="checkbox"
              checked={bot.config.antiAfk.enabled}
              onChange={(e) => onToggleAntiAfk(bot.id, e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
            />
          </div>
          <p className="text-sm font-bold font-mono text-white">
            {bot.config.antiAfk.enabled ? `Every ${bot.config.antiAfk.intervalSeconds}s` : 'Paused'}
          </p>
        </div>

        {/* Coordinates */}
        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 text-zinc-400 text-xs mb-1">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold text-zinc-300">Coordinates</span>
            </div>
            {onOpenNetherCalc && (
              <button
                type="button"
                onClick={onOpenNetherCalc}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5 cursor-pointer hover:underline"
                title="Open coordinates in Nether Portal Calculator"
              >
                <span>Calc Portal</span>
              </button>
            )}
          </div>
          <p className="text-xs font-mono font-bold text-zinc-200 truncate">
            {Math.round(bot.position.x)}, {Math.round(bot.position.y)}, {Math.round(bot.position.z)}
          </p>
        </div>
      </div>
    </div>
  );
};

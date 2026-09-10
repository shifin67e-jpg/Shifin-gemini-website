import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Square,
  Zap,
  Users,
  Plus,
} from 'lucide-react';
import { BotState } from '../types';

interface BotListProps {
  bots: BotState[];
  selectedBotId: string | null;
  globalBotLimit?: number;
  onSelectBot: (id: string) => void;
  onStartBot: (id: string) => void;
  onStopBot: (id: string) => void;
  onAddNewBot: () => void;
}

export const BotList: React.FC<BotListProps> = ({
  bots,
  selectedBotId,
  globalBotLimit = 1,
  onSelectBot,
  onStartBot,
  onStopBot,
  onAddNewBot,
}) => {
  return (
    <div id="bot-list-container" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Bot Fleet ({bots.length}/{globalBotLimit} Bots)</span>
        </div>
        {bots.length >= globalBotLimit ? (
          <span className="text-[11px] text-zinc-400 font-medium px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            {bots.length}/{globalBotLimit} Limit Reached
          </span>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddNewBot}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Bot ({bots.length}/{globalBotLimit})</span>
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bots.map((bot, index) => {
          const isSelected = bot.id === selectedBotId;
          const isOnline = bot.status === 'online';
          const isReconnecting = bot.status === 'reconnecting';
          const isStarting = bot.status === 'starting';

          const statusColor = isOnline
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
            : isReconnecting
            ? 'bg-amber-500 animate-pulse'
            : isStarting
            ? 'bg-blue-500 animate-pulse'
            : 'bg-zinc-600';

          return (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 350, damping: 20 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectBot(bot.id)}
              className={`group relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-md ${
                isSelected
                  ? 'bg-zinc-900 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar with Head */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
                      <img
                        src={`https://mc-heads.net/avatar/${encodeURIComponent(bot.config.username)}/64`}
                        alt={bot.config.username}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-lg object-cover pixelated"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 z-10 ${statusColor}`}
                    />
                  </div>

                  {/* Name & Host */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="font-extrabold text-sm text-zinc-100 truncate">
                        {bot.config.username}
                      </h4>
                    </div>
                    <p className="text-xs font-mono text-zinc-400 truncate">
                      {bot.config.host}:{bot.config.port}
                    </p>
                  </div>
                </div>

                {/* Quick Start/Stop with animated buttons */}
                <div onClick={(e) => e.stopPropagation()}>
                  {isOnline || isReconnecting || isStarting ? (
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onStopBot(bot.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                      title="Stop Bot"
                    >
                      <Square className="w-3.5 h-3.5 fill-rose-400" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onStartBot(bot.id)}
                      className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
                      title="Start Bot"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-300" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Badges & Meta */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md ${
                      isOnline
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : isReconnecting
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : isStarting
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isOnline ? 'CONNECTED' : isStarting ? 'CONNECTING' : bot.status}
                  </span>

                  {bot.config.antiAfk.enabled && (
                    <span className="flex items-center gap-1 text-amber-400/90 text-[11px] font-semibold">
                      <Zap className="w-3 h-3" />
                      AFK ({bot.config.antiAfk.intervalSeconds}s)
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs text-zinc-400">
                  {isOnline ? `HP: ${bot.health}/20` : 'Offline'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

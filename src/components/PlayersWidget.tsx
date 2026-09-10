import React from 'react';
import { Users, Shield, User } from 'lucide-react';

interface PlayersWidgetProps {
  players: string[];
  botUsername: string;
}

export const PlayersWidget: React.FC<PlayersWidgetProps> = ({ players, botUsername }) => {
  return (
    <div id="players-nearby-widget" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <Users className="w-4 h-4 text-blue-400" />
          <span>Players in Range ({players.length})</span>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="py-4 text-center text-xs text-zinc-500 font-sans">
          No players detected nearby
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {players.map((p) => {
            const isSelf = p.toLowerCase() === botUsername.toLowerCase();
            return (
              <div
                key={p}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                  isSelf
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                }`}
              >
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(p)}/16`}
                  alt={p}
                  referrerPolicy="no-referrer"
                  className="w-3.5 h-3.5 rounded-sm object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span>{p}</span>
                {isSelf && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded uppercase">
                    You
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

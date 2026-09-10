import React from 'react';

interface HeartsAndHungerProps {
  health: number; // 0-20
  maxHealth?: number; // 20
  food: number; // 0-20
  saturation?: number;
  level?: number;
  expProgress?: number; // 0-1
}

export const HeartsAndHunger: React.FC<HeartsAndHungerProps> = ({
  health,
  maxHealth = 20,
  food,
  saturation = 0,
  level = 0,
  expProgress = 0,
}) => {
  // 10 hearts total, each heart = 2 HP
  const hearts = Array.from({ length: 10 }, (_, i) => {
    const heartVal = (i + 1) * 2;
    if (health >= heartVal) return 'full';
    if (health === heartVal - 1) return 'half';
    return 'empty';
  });

  // 10 hunger shanks total, each shank = 2 food
  const hunger = Array.from({ length: 10 }, (_, i) => {
    const shankVal = (i + 1) * 2;
    if (food >= shankVal) return 'full';
    if (food === shankVal - 1) return 'half';
    return 'empty';
  });

  return (
    <div id="minecraft-hud-bars" className="space-y-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Health */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Health ({health}/{maxHealth})
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {Math.round((health / maxHealth) * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            {hearts.map((state, i) => (
              <div
                key={`heart-${i}`}
                className="relative w-4 h-4 flex items-center justify-center transition-transform hover:scale-110"
                title={`Heart ${i + 1} (${state})`}
              >
                {state === 'full' && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-500 stroke-red-700 stroke-1 drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                )}
                {state === 'half' && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-red-700 stroke-1">
                    <defs>
                      <linearGradient id={`halfHeart-${i}`} x1="0" x2="1" y1="0" y2="0">
                        <stop offset="50%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#27272a" />
                      </linearGradient>
                    </defs>
                    <path
                      fill={`url(#halfHeart-${i})`}
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                )}
                {state === 'empty' && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-zinc-800 stroke-zinc-700 stroke-1">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Food / Hunger */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
              Hunger ({food}/20)
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Sat: {saturation}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {hunger.map((state, i) => (
              <div
                key={`shank-${i}`}
                className="relative w-4 h-4 flex items-center justify-center transition-transform hover:scale-110"
                title={`Hunger shank ${i + 1} (${state})`}
              >
                {state === 'full' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-600 border border-amber-800 shadow-[0_0_3px_rgba(217,119,6,0.5)] flex items-center justify-center text-[8px] text-amber-200">
                    🍗
                  </div>
                )}
                {state === 'half' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-700 border border-amber-900 opacity-80 flex items-center justify-center text-[7px]">
                    🍗
                  </div>
                )}
                {state === 'empty' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center opacity-40">
                    🍗
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Bar */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span>Level {level}</span>
          </span>
          <span className="font-mono text-zinc-500 text-[10px]">
            {Math.round(expProgress * 100)}%
          </span>
        </div>
        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, expProgress * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

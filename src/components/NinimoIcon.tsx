import React from 'react';
import { motion } from 'motion/react';

interface NinimoIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NinimoIcon: React.FC<NinimoIconProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12',
  }[size];

  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: [0, -4, 4, 0] }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
      className={`relative ${sizeClasses} ${className} select-none cursor-pointer shrink-0`}
      title="Ninimo Bot Commander 24/7"
    >
      {/* Outer ambient aura glow */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/40 via-teal-500/30 to-cyan-500/40 rounded-xl sm:rounded-2xl blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Main Beveled Container */}
      <div className="relative w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 p-[1.5px] shadow-xl shadow-emerald-950/40 border border-emerald-500/40 overflow-hidden flex items-center justify-center">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:6px_6px] opacity-20" />

        {/* Custom Minecraft Bot SVG Face */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        >
          {/* Cyber Antenna */}
          <rect x="16" y="2" width="4" height="4" rx="1" fill="#34d399" />
          <circle cx="18" cy="4" r="1.2" fill="#ecfdf5" className="animate-pulse" />
          <rect x="17" y="6" width="2" height="2" fill="#059669" />

          {/* Bot Head / Helmet Outline */}
          <rect x="5" y="8" width="26" height="23" rx="4" fill="#18181b" stroke="#10b981" strokeWidth="1.5" />

          {/* Minecraft Pixel Ear Bolters */}
          <rect x="3" y="15" width="2" height="7" rx="1" fill="#059669" />
          <rect x="31" y="15" width="2" height="7" rx="1" fill="#059669" />

          {/* Visor Area (Dark High-Tech Glass) */}
          <rect x="8" y="13" width="20" height="9" rx="2" fill="#09090b" stroke="#059669" strokeWidth="1" />

          {/* Glowing Emerald Pixel Eyes (Dual-Core Sensor) */}
          <rect x="10.5" y="15" width="4.5" height="4.5" rx="1" fill="#34d399">
            <animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" />
          </rect>
          <rect x="11.5" y="16" width="1.5" height="1.5" fill="#ffffff" />

          <rect x="21" y="15" width="4.5" height="4.5" rx="1" fill="#34d399">
            <animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" />
          </rect>
          <rect x="22" y="16" width="1.5" height="1.5" fill="#ffffff" />

          {/* Visor Scanline Reflection */}
          <line x1="9" y1="14" x2="27" y2="14" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.4" strokeLinecap="round" />

          {/* Minecraft Pixel Mouth / Speaker Grille */}
          <rect x="12" y="24" width="3" height="2" rx="0.5" fill="#34d399" />
          <rect x="16.5" y="24" width="3" height="2" rx="0.5" fill="#10b981" />
          <rect x="21" y="24" width="3" height="2" rx="0.5" fill="#34d399" />
        </svg>

        {/* Live Active Status Indicator Dot */}
        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse" />
      </div>
    </motion.div>
  );
};

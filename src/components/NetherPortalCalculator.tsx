import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  Copy,
  Check,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  Info,
  Layers,
  AlertTriangle,
  Bot,
  MapPin,
  Flame,
} from 'lucide-react';
import { BotState } from '../types';

interface NetherPortalCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  activeBot?: BotState | null;
}

export const NetherPortalCalculator: React.FC<NetherPortalCalculatorProps> = ({
  isOpen,
  onClose,
  activeBot,
}) => {
  const [direction, setDirection] = useState<'overworld_to_nether' | 'nether_to_overworld'>('overworld_to_nether');
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(64);
  const [z, setZ] = useState<number>(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Second portal cross-link verification
  const [showLinkChecker, setShowLinkChecker] = useState(false);
  const [checkX, setCheckX] = useState<number>(0);
  const [checkY, setCheckY] = useState<number>(64);
  const [checkZ, setCheckZ] = useState<number>(0);

  // Auto-fill from active bot if available
  const handleUseBotCoords = () => {
    if (!activeBot) return;
    const posX = Math.round(activeBot.position.x);
    const posY = Math.round(activeBot.position.y);
    const posZ = Math.round(activeBot.position.z);

    setX(posX);
    setY(posY);
    setZ(posZ);

    if (activeBot.dimension === 'the_nether') {
      setDirection('nether_to_overworld');
    } else {
      setDirection('overworld_to_nether');
    }
  };

  const initializedRef = React.useRef(false);
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      if (activeBot && (activeBot.position.x !== 0 || activeBot.position.z !== 0)) {
        setX(Math.round(activeBot.position.x));
        setY(Math.round(activeBot.position.y));
        setZ(Math.round(activeBot.position.z));
        if (activeBot.dimension === 'the_nether') {
          setDirection('nether_to_overworld');
        } else {
          setDirection('overworld_to_nether');
        }
      }
    } else if (!isOpen) {
      initializedRef.current = false;
    }
  }, [isOpen, activeBot?.id]);

  if (!isOpen) return null;

  // Calculation Math
  const isOverworldToNether = direction === 'overworld_to_nether';
  const targetX = isOverworldToNether ? Math.floor(x / 8) : x * 8;
  const targetZ = isOverworldToNether ? Math.floor(z / 8) : z * 8;
  const targetY = y; // Y coordinate is 1:1 in vanilla Minecraft

  // Distance calculation for Link Checker
  const dx = targetX - checkX;
  const dy = targetY - checkY;
  const dz = targetZ - checkZ;
  const distance3D = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const maxSearchRadius = isOverworldToNether ? 128 : 1024;
  const isWithinLinkingDistance = distance3D <= maxSearchRadius;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 overflow-y-auto">
      <motion.div
        id="nether-portal-modal"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="bg-zinc-900 border border-purple-500/30 rounded-3xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto shadow-2xl flex flex-col relative my-auto transform-gpu will-change-transform"
      >
        {/* Subtle ambient obsidian accent */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none rounded-t-3xl" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/90 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-md shadow-purple-950/50">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                Nether Portal Link Calculator
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full">
                  1:8 Ratio
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Calculate exact portal coordinate pairs & prevent accidental cross-linking
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="p-6 space-y-6 relative z-10 text-xs">
          {/* Active Bot Quick Sync Action */}
          {activeBot && (
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-zinc-300 text-xs truncate">
                  Active Bot: <strong className="text-white font-mono">{activeBot.config.username}</strong> at{' '}
                  <span className="text-purple-300 font-mono font-bold">
                    {Math.round(activeBot.position.x)}, {Math.round(activeBot.position.y)}, {Math.round(activeBot.position.z)}
                  </span>{' '}
                  ({activeBot.dimension === 'the_nether' ? 'Nether' : 'Overworld'})
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUseBotCoords}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-md shadow-purple-950/60 cursor-pointer shrink-0 text-xs flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Use Bot Coords</span>
              </motion.button>
            </div>
          )}

          {/* Direction Switcher Pill */}
          <div className="grid grid-cols-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl relative">
            <button
              type="button"
              onClick={() => setDirection('overworld_to_nether')}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2 ${
                isOverworldToNether ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Overworld &rarr; Nether (÷8)</span>
              {isOverworldToNether && (
                <motion.div
                  layoutId="portal-direction-pill"
                  className="absolute inset-0 bg-zinc-800 border border-purple-500/40 rounded-xl -z-10 shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDirection('nether_to_overworld')}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2 ${
                !isOverworldToNether ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Nether &rarr; Overworld (&times;8)</span>
              {!isOverworldToNether && (
                <motion.div
                  layoutId="portal-direction-pill"
                  className="absolute inset-0 bg-zinc-800 border border-purple-500/40 rounded-xl -z-10 shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          </div>

          {/* Input Coordinates Grid */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                Source Coordinates ({isOverworldToNether ? 'Overworld' : 'Nether'})
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <button
                  type="button"
                  onClick={() => { setX(0); setY(64); setZ(0); }}
                  className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                >
                  Reset (0, 64, 0)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* X Input */}
              <div className="space-y-1">
                <span className="block text-[11px] font-bold text-zinc-400 font-mono">X Axis</span>
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-none transition-all"
                />
              </div>

              {/* Y Input */}
              <div className="space-y-1">
                <span className="block text-[11px] font-bold text-zinc-400 font-mono">Y Height (Elevation)</span>
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-none transition-all"
                />
              </div>

              {/* Z Input */}
              <div className="space-y-1">
                <span className="block text-[11px] font-bold text-zinc-400 font-mono">Z Axis</span>
                <input
                  type="number"
                  value={z}
                  onChange={(e) => setZ(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Height Presets */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-zinc-500 font-semibold">Height Presets:</span>
              <button
                type="button"
                onClick={() => setY(115)}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-500/20 text-[10px] font-mono cursor-pointer"
              >
                Nether Highway (Y=115)
              </button>
              <button
                type="button"
                onClick={() => setY(128)}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-500/20 text-[10px] font-mono cursor-pointer"
              >
                Bedrock Roof (Y=128)
              </button>
              <button
                type="button"
                onClick={() => setY(64)}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono cursor-pointer"
              >
                Sea Level (Y=64)
              </button>
              <button
                type="button"
                onClick={() => setY(32)}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/20 text-[10px] font-mono cursor-pointer"
              >
                Nether Lava Sea (Y=32)
              </button>
            </div>
          </div>

          {/* Results Display Card */}
          <div className="bg-gradient-to-br from-purple-950/40 via-zinc-950 to-zinc-900 border border-purple-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            {/* Animated Portal Swirl Glow */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Target Portal Coordinates in {isOverworldToNether ? 'The Nether' : 'The Overworld'}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight mt-1 flex items-baseline gap-2">
                  <span>X: {targetX}</span>
                  <span className="text-purple-400">Y: {targetY}</span>
                  <span>Z: {targetZ}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Build your receiving portal frame exactly at this location for flawless 1:1 synchronization.
                </p>
              </div>

              {/* Action Copy Buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => copyToClipboard(`${targetX} ${targetY} ${targetZ}`, 'coords')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-950 cursor-pointer"
                >
                  {copiedType === 'coords' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Coords</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => copyToClipboard(`/tp @s ${targetX} ${targetY} ${targetZ}`, 'tp')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                >
                  {copiedType === 'tp' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>Copy /tp Command</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Linking Distance & Accidental Cross-Link Checker */}
          <div className="border border-zinc-800 rounded-2xl bg-zinc-950/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLinkChecker(!showLinkChecker)}
              className="w-full px-4 py-3 flex items-center justify-between text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Portal Cross-Link Conflict Checker</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  (Check if another portal will steal the link)
                </span>
              </div>
              <span className="text-purple-400 font-mono font-bold">
                {showLinkChecker ? 'Hide Checker' : 'Test Coords'}
              </span>
            </button>

            <AnimatePresence>
              {showLinkChecker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 border-t border-zinc-800/80 pt-3 space-y-3"
                >
                  <p className="text-xs text-zinc-400">
                    In Minecraft, portals search within <strong className="text-white">128 blocks</strong> in the Nether and <strong className="text-white">1,024 blocks</strong> in the Overworld. Enter a neighboring portal’s coordinates to check if it interferes:
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Neighbor X"
                      value={checkX}
                      onChange={(e) => setCheckX(parseInt(e.target.value, 10) || 0)}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="number"
                      placeholder="Neighbor Y"
                      value={checkY}
                      onChange={(e) => setCheckY(parseInt(e.target.value, 10) || 0)}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="number"
                      placeholder="Neighbor Z"
                      value={checkZ}
                      onChange={(e) => setCheckZ(parseInt(e.target.value, 10) || 0)}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    isWithinLinkingDistance
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isWithinLinkingDistance ? (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      ) : (
                        <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                      )}
                      <span>
                        Distance: <strong className="font-mono">{Math.round(distance3D)} blocks</strong>.{' '}
                        {isWithinLinkingDistance
                          ? `Warning: Within search radius (<=${maxSearchRadius}b). Portals may cross-link if built too close.`
                          : `Safe: Outside linking range (>${maxSearchRadius}b). No cross-linking conflicts.`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Pro Tips */}
          <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-2xl flex items-start gap-2.5 text-zinc-400">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed space-y-1">
              <p>
                <strong className="text-zinc-200">How 2-Way Linking Works:</strong> Always ignite both portals manually at their respective calculated coordinates. If you walk through a newly generated portal before building the pair, Minecraft may offset the portal to the nearest safe ground cavern.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

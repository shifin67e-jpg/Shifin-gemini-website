import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  Clock,
  MoveHorizontal,
  Eye,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  ShieldCheck,
  Repeat,
} from 'lucide-react';
import { AntiAfkConfig } from '../types';

interface AntiAfkCardProps {
  config: AntiAfkConfig;
  isOnline: boolean;
  botId: string;
  onUpdateConfig: (updated: AntiAfkConfig) => void;
  onTriggerTestMove: () => Promise<void>;
}

export const AntiAfkCard: React.FC<AntiAfkCardProps> = ({
  config,
  isOnline,
  botId,
  onUpdateConfig,
  onTriggerTestMove,
}) => {
  const [testing, setTesting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const handleToggle = () => {
    onUpdateConfig({ ...config, enabled: !config.enabled });
  };

  const handleIntervalPreset = (sec: number) => {
    onUpdateConfig({ ...config, intervalSeconds: sec });
  };

  const handleMovementTypeChange = (type: AntiAfkConfig['movementType']) => {
    onUpdateConfig({ ...config, movementType: type });
  };

  const handleTestClick = async () => {
    setTesting(true);
    setTestFeedback('Executing left-right strafe routine...');
    try {
      await onTriggerTestMove();
      setTestFeedback('Returned to starting coordinates successfully!');
      setTimeout(() => setTestFeedback(null), 4000);
    } catch {
      setTestFeedback('Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div id="anti-afk-settings-card" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header with main toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Anti-AFK Movement System
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                Active Routine
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Moves bot left & right and returns to the exact same spot
            </p>
          </div>
        </div>

        {/* Big Switch */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleToggle}
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
            config.enabled ? 'bg-emerald-600' : 'bg-zinc-800'
          }`}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`bg-white w-4 h-4 rounded-full shadow-md ${
              config.enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </motion.button>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* Interval Selector */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Execution Interval
            </label>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              Every {config.intervalSeconds} seconds
            </span>
          </div>

          {/* Quick preset buttons with motion */}
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 60, 120].map((sec) => (
              <motion.button
                key={sec}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleIntervalPreset(sec)}
                className={`py-1.5 rounded-xl border text-xs font-semibold font-mono transition-all cursor-pointer ${
                  config.intervalSeconds === sec
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {sec}s
              </motion.button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={config.intervalSeconds}
              onChange={(e) => onUpdateConfig({ ...config, intervalSeconds: Number(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Movement Style / Routine Type */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
            <MoveHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            Movement Pattern
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleMovementTypeChange('strafe_lr')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                config.movementType === 'strafe_lr'
                  ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <div className="font-bold text-xs text-zinc-200 flex items-center justify-between">
                <span>Left & Right Strafe</span>
                {config.movementType === 'strafe_lr' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Strafes left for {config.strafeDurationMs}ms then right for {config.strafeDurationMs}ms. Never drifts.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleMovementTypeChange('full_routine')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                config.movementType === 'full_routine'
                  ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <div className="font-bold text-xs text-zinc-200 flex items-center justify-between">
                <span>Full Anti-AFK Suite</span>
                {config.movementType === 'full_routine' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Left/right strafe + look wobble + arm swing + sneak crouch.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleMovementTypeChange('rotate_look')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                config.movementType === 'rotate_look'
                  ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <div className="font-bold text-xs text-zinc-200 flex items-center justify-between">
                <span>Look Wobble Only</span>
                {config.movementType === 'rotate_look' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Gently adjusts pitch/yaw and resets. Best for tight standing spots.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleMovementTypeChange('jump_strafe')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                config.movementType === 'jump_strafe'
                  ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <div className="font-bold text-xs text-zinc-200 flex items-center justify-between">
                <span>Jump & Strafe</span>
                {config.movementType === 'jump_strafe' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Small hop with left/right micro-step to bypass aggressive AFK plugins.
              </p>
            </motion.button>
          </div>
        </div>

        {/* Micro Options */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <label className="flex items-center gap-2 p-2.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl cursor-pointer hover:bg-zinc-800/30 transition-colors">
            <input
              type="checkbox"
              checked={config.swingArm}
              onChange={(e) => onUpdateConfig({ ...config, swingArm: e.target.checked })}
              className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30"
            />
            <span className="text-xs text-zinc-300 font-medium">Swing Arm</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl cursor-pointer hover:bg-zinc-800/30 transition-colors">
            <input
              type="checkbox"
              checked={config.sneakWiggle}
              onChange={(e) => onUpdateConfig({ ...config, sneakWiggle: e.target.checked })}
              className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30"
            />
            <span className="text-xs text-zinc-300 font-medium">Sneak Crouch</span>
          </label>
        </div>

        {/* Test Button & Feedback */}
        <div className="pt-2 border-t border-zinc-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleTestClick}
            disabled={testing || !isOnline}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isOnline
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            <PlayCircle className="w-4 h-4 text-amber-400" />
            <span>{testing ? 'Performing Routine...' : 'Test Movement Routine Now'}</span>
          </motion.button>

          {testFeedback && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs text-emerald-400 font-medium mt-2"
            >
              {testFeedback}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

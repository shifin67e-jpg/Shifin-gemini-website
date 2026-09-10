import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Bot,
  Server,
  Zap,
  RotateCcw,
  Terminal,
  Shield,
  Crown,
} from 'lucide-react';
import { BotConfig, BotState } from '../types';

interface BotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BotConfig>) => Promise<void>;
  initialBot?: BotState | null;
}

export const BotModal: React.FC<BotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBot,
}) => {
  const [formData, setFormData] = useState<Partial<BotConfig>>({
    name: 'NinimoBot',
    host: 'play.hypixel.net',
    port: 25565,
    username: 'NinimoBot',
    auth: 'offline',
    password: '',
    version: '',
    autoReconnect: true,
    reconnectDelaySeconds: 5,
    onJoinCommand: '',
    onJoinDelayMs: 2000,
    antiAfk: {
      enabled: true,
      intervalSeconds: 30,
      movementType: 'strafe_lr',
      strafeDurationMs: 400,
      swingArm: true,
      sneakWiggle: true,
    },
  });

  const [portInput, setPortInput] = useState<string>('25565');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialBot) {
      setFormData({ ...initialBot.config });
      setPortInput(String(initialBot.config.port || 25565));
    } else {
      setFormData({
        name: 'NinimoBot',
        host: 'play.hypixel.net',
        port: 25565,
        username: 'NinimoBot',
        auth: 'offline',
        password: '',
        version: '',
        autoReconnect: true,
        reconnectDelaySeconds: 5,
        onJoinCommand: '',
        onJoinDelayMs: 2000,
        antiAfk: {
          enabled: true,
          intervalSeconds: 30,
          movementType: 'strafe_lr',
          strafeDurationMs: 400,
          swingArm: true,
          sneakWiggle: true,
        },
      });
      setPortInput('25565');
    }
  }, [initialBot, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const parsedPort = parseInt(portInput.trim(), 10) || 25565;
      await onSave({ ...formData, port: parsedPort });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        id="bot-config-modal"
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {initialBot ? 'Edit Bot Profile' : 'Create 24/7 Minecraft Bot'}
              </h3>
              <p className="text-xs text-zinc-400">
                Configure connection, anti-AFK, and auto-join
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Bot Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Profile Display Name
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. NinimoBot"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 font-sans focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Minecraft Username (IGN)
              </label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. NinimoBot"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Server Host & Port */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-300 mb-1">
                Server IP / Hostname
              </label>
              <input
                type="text"
                value={formData.host || ''}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="play.hypixel.net or 127.0.0.1"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Port</label>
              <input
                type="text"
                inputMode="numeric"
                value={portInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPortInput(val);
                  setFormData((prev) => ({
                    ...prev,
                    port: val === '' ? 25565 : (parseInt(val, 10) || 25565),
                  }));
                }}
                onBlur={() => {
                  if (!portInput.trim()) {
                    setPortInput('25565');
                    setFormData((prev) => ({ ...prev, port: 25565 }));
                  }
                }}
                placeholder="25565"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Auth mode */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Account Authentication
            </label>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setFormData({ ...formData, auth: 'offline' })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formData.auth === 'offline'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cracked (Offline Mode)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setFormData({ ...formData, auth: 'microsoft' })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formData.auth === 'microsoft'
                    ? 'bg-blue-950/40 border-blue-500 text-blue-300 font-bold shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Premium (Microsoft)
              </motion.button>
            </div>
          </div>

          {/* On-Join Command */}
          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-3.5 space-y-2">
            <label className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              On-Join Custom Command or Word
            </label>
            <input
              type="text"
              value={formData.onJoinCommand || ''}
              onChange={(e) => setFormData({ ...formData, onJoinCommand: e.target.value })}
              placeholder="e.g. /login 123456 or /register 123456 123456"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Anti-AFK Config */}
          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Anti-AFK Movement
              </label>
              <input
                type="checkbox"
                checked={formData.antiAfk?.enabled ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    antiAfk: {
                      ...(formData.antiAfk || {
                        intervalSeconds: 30,
                        movementType: 'strafe_lr',
                        strafeDurationMs: 400,
                        swingArm: true,
                        sneakWiggle: true,
                      }),
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Moves left & right every {formData.antiAfk?.intervalSeconds || 30}s and returns to exact same position.
            </p>
          </div>

          {/* Auto Reconnect */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-2xl">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-bold text-zinc-200 block text-xs">
                  24/7 Auto-Reconnect
                </span>
                <span className="text-[11px] text-zinc-400">
                  Rejoins automatically after disconnects, kicks, or restarts
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.autoReconnect ?? true}
              onChange={(e) => setFormData({ ...formData, autoReconnect: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors font-semibold text-xs cursor-pointer"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors rounded-xl shadow-md shadow-emerald-950/60 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : initialBot ? 'Update Bot' : 'Create Bot'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Server,
  RefreshCw,
  Key,
  ShieldCheck,
  Terminal,
  Clock,
  Zap,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';
import { BotConfig } from '../types';

interface ConnectionSettingsCardProps {
  config: BotConfig;
  isOnline: boolean;
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
  onTestDisconnect?: () => void;
}

export const ConnectionSettingsCard: React.FC<ConnectionSettingsCardProps> = ({
  config,
  isOnline,
  onSaveConfig,
  onTestDisconnect,
}) => {
  const [formData, setFormData] = useState<BotConfig>({ ...config });
  const [portInput, setPortInput] = useState<string>(String(config.port || 25565));
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setFormData({ ...config });
    setPortInput(String(config.port || 25565));
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedPort = parseInt(portInput.trim(), 10) || 25565;
      await onSaveConfig({ ...formData, port: parsedPort });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const versions = [
    { label: 'Auto Detect (Recommended)', value: '' },
    { label: '1.20.4', value: '1.20.4' },
    { label: '1.20.1', value: '1.20.1' },
    { label: '1.19.4', value: '1.19.4' },
    { label: '1.18.2', value: '1.18.2' },
    { label: '1.16.5', value: '1.16.5' },
    { label: '1.12.2', value: '1.12.2' },
    { label: '1.8.9', value: '1.8.9' },
  ];

  return (
    <div id="connection-settings-card" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-sm">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Server & Auto-Rejoin Configuration
            </h3>
            <p className="text-xs text-zinc-400">
              Connection credentials, on-join command, and reconnect rules
            </p>
          </div>
        </div>

        {isSaved && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold"
          >
            <Check className="w-3.5 h-3.5" />
            Saved!
          </motion.span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Server & Port */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Minecraft Server Host / IP
            </label>
            <input
              type="text"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              placeholder="e.g. play.hypixel.net or localhost"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">Port</label>
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Username & Auth Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Bot Username / In-Game Name
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. NinimoBot"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Authentication Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setFormData({ ...formData, auth: 'offline' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formData.auth === 'offline'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cracked (Offline)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setFormData({ ...formData, auth: 'microsoft' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formData.auth === 'microsoft'
                    ? 'bg-blue-950/40 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Premium (Microsoft)
              </motion.button>
            </div>
          </div>
        </div>

        {/* Version */}
        <div>
          <label className="block font-semibold text-zinc-300 mb-1.5">
            Minecraft Version
          </label>
          <select
            value={formData.version || ''}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {versions.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* On-Join Command / Word */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              On-Join Command or Word
            </label>
            <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              Delay: {formData.onJoinDelayMs}ms
            </span>
          </div>

          <p className="text-[11px] text-zinc-400">
            Automatically executed once the bot spawns into the Minecraft world.
          </p>

          <input
            type="text"
            value={formData.onJoinCommand}
            onChange={(e) => setFormData({ ...formData, onJoinCommand: e.target.value })}
            placeholder="e.g. /login 123456 or /register pass pass or /server survival"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500 text-xs"
          />

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-medium">Fast (500ms)</span>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={formData.onJoinDelayMs}
              onChange={(e) => setFormData({ ...formData, onJoinDelayMs: Number(e.target.value) })}
              className="flex-1 accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 font-medium">Safe (5000ms)</span>
          </div>
        </div>

        {/* Reconnect System */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-zinc-200">24/7 Auto-Reconnect System</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setFormData({ ...formData, autoReconnect: !formData.autoReconnect })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.autoReconnect ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ${
                  formData.autoReconnect ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </motion.button>
          </div>

          <p className="text-[11px] text-zinc-400">
            Automatically rejoins server if kicked, timed out, or after server restarts.
          </p>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-zinc-400 font-medium">Reconnect retry delay:</span>
            <div className="flex gap-1.5">
              {[3, 5, 10, 30].map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setFormData({ ...formData, reconnectDelaySeconds: s })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                    formData.reconnectDelaySeconds === s
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s}s
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit & Save */}
        <div className="flex items-center justify-end pt-2">
          <motion.button
            id="btn-save-settings"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-950/60 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Apply & Save Settings'}</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
};

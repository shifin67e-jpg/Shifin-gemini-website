import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  Server,
  Terminal,
  Zap,
  RotateCcw,
  Check,
  Save,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Command,
  Sparkles,
} from 'lucide-react';
import { BotDefaults, QuickCommandItem } from '../types';

export const DEFAULT_QUICK_COMMANDS: QuickCommandItem[] = [
  { id: '1', label: '/spawn', cmd: '/spawn' },
  { id: '2', label: '/home', cmd: '/home' },
  { id: '3', label: '/list', cmd: '/list' },
  { id: '4', label: '/help', cmd: '/help' },
  { id: '5', label: '/ping', cmd: '/ping' },
  { id: '6', label: 'Hello!', cmd: 'Hello everyone!' },
];

export const FACTORY_BOT_DEFAULTS: BotDefaults = {
  host: 'play.hypixel.net',
  port: 25565,
  onJoinCommand: '',
  onJoinDelayMs: 2000,
  auth: 'offline',
  version: '',
  autoReconnect: true,
  reconnectDelaySeconds: 5,
  antiAfk: {
    enabled: true,
    intervalSeconds: 30,
    movementType: 'strafe_lr',
    strafeDurationMs: 400,
    swingArm: true,
    sneakWiggle: true,
  },
  quickCommands: DEFAULT_QUICK_COMMANDS,
};

interface BotDefaultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDefaults: BotDefaults;
  onSaveDefaults: (defaults: BotDefaults) => Promise<void>;
  initialTab?: 'server' | 'quick_messages' | 'antiafk';
}

export const BotDefaultsModal: React.FC<BotDefaultsModalProps> = ({
  isOpen,
  onClose,
  currentDefaults,
  onSaveDefaults,
  initialTab = 'server',
}) => {
  const [activeTab, setActiveTab] = useState<'server' | 'quick_messages' | 'antiafk'>(initialTab);
  const [formData, setFormData] = useState<BotDefaults>(() => ({
    ...FACTORY_BOT_DEFAULTS,
    ...(currentDefaults || {}),
    quickCommands:
      currentDefaults?.quickCommands && currentDefaults.quickCommands.length > 0
        ? currentDefaults.quickCommands
        : DEFAULT_QUICK_COMMANDS,
  }));
  const [portInput, setPortInput] = useState<string>(String(currentDefaults?.port || 25565));
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New quick command input state
  const [newCmdLabel, setNewCmdLabel] = useState('');
  const [newCmdText, setNewCmdText] = useState('');
  const [editingCmdId, setEditingCmdId] = useState<string | null>(null);
  const [editCmdLabel, setEditCmdLabel] = useState('');
  const [editCmdText, setEditCmdText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFormData({
        ...FACTORY_BOT_DEFAULTS,
        ...(currentDefaults || {}),
        quickCommands:
          currentDefaults?.quickCommands && currentDefaults.quickCommands.length > 0
            ? currentDefaults.quickCommands
            : DEFAULT_QUICK_COMMANDS,
      });
      setPortInput(String(currentDefaults?.port || 25565));
      setSavedSuccess(false);
      setEditingCmdId(null);
    }
  }, [isOpen, currentDefaults, initialTab]);

  if (!isOpen) return null;

  const handleResetFactory = () => {
    setFormData(FACTORY_BOT_DEFAULTS);
    setPortInput('25565');
  };

  const handleAddQuickCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmdLabel.trim() || !newCmdText.trim()) return;

    const newItem: QuickCommandItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: newCmdLabel.trim(),
      cmd: newCmdText.trim(),
    };

    setFormData((prev) => ({
      ...prev,
      quickCommands: [...(prev.quickCommands || []), newItem],
    }));

    setNewCmdLabel('');
    setNewCmdText('');
  };

  const handleDeleteQuickCommand = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      quickCommands: (prev.quickCommands || []).filter((item) => item.id !== id),
    }));
  };

  const handleStartEditQuickCommand = (item: QuickCommandItem) => {
    setEditingCmdId(item.id);
    setEditCmdLabel(item.label);
    setEditCmdText(item.cmd);
  };

  const handleSaveEditQuickCommand = (id: string) => {
    if (!editCmdLabel.trim() || !editCmdText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      quickCommands: (prev.quickCommands || []).map((item) =>
        item.id === id ? { ...item, label: editCmdLabel.trim(), cmd: editCmdText.trim() } : item
      ),
    }));
    setEditingCmdId(null);
  };

  const handleResetQuickCommands = () => {
    setFormData((prev) => ({
      ...prev,
      quickCommands: DEFAULT_QUICK_COMMANDS,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedPort = parseInt(portInput.trim(), 10) || 25565;
      const finalDefaults: BotDefaults = {
        ...formData,
        port: parsedPort,
        quickCommands: formData.quickCommands && formData.quickCommands.length > 0
          ? formData.quickCommands
          : DEFAULT_QUICK_COMMANDS,
      };
      await onSaveDefaults(finalDefaults);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 sm:backdrop-blur-md overflow-y-auto overscroll-contain">
      <motion.div
        id="bot-defaults-modal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 360 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92dvh] overflow-y-auto shadow-2xl flex flex-col relative my-auto transform-gpu"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/50 shrink-0">
              <Sliders className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                Bot Settings & Presets
                <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Saved
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Configure default server, quick chat commands, and anti-AFK
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 sm:p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </motion.button>
        </div>

        {/* Tab Switcher with animated pill */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4">
          <div className="grid grid-cols-3 p-1 bg-zinc-950 border border-zinc-800 rounded-xl relative">
            <button
              type="button"
              onClick={() => setActiveTab('server')}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-colors relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                activeTab === 'server' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Server & Join</span>
              {activeTab === 'server' && (
                <motion.div
                  layoutId="defaults-tab-pill"
                  className="absolute inset-0 bg-zinc-800 border border-emerald-500/30 rounded-lg -z-10 shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quick_messages')}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-colors relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                activeTab === 'quick_messages' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Quick Messages</span>
              {activeTab === 'quick_messages' && (
                <motion.div
                  layoutId="defaults-tab-pill"
                  className="absolute inset-0 bg-zinc-800 border border-sky-500/30 rounded-lg -z-10 shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('antiafk')}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-colors relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                activeTab === 'antiafk' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Anti-AFK</span>
              {activeTab === 'antiafk' && (
                <motion.div
                  layoutId="defaults-tab-pill"
                  className="absolute inset-0 bg-zinc-800 border border-amber-500/30 rounded-lg -z-10 shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content with smooth AnimatePresence */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeTab === 'server' && (
              <motion.div
                key="tab-server"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Server Connection Defaults */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Default Minecraft Server
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Default Server Host / Domain / IP
                      </label>
                      <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        placeholder="e.g. mc.hypixel.net or aternos.me"
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Default Port
                      </label>
                      <input
                        type="number"
                        value={portInput}
                        onChange={(e) => setPortInput(e.target.value)}
                        placeholder="25565"
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Default Auth Type
                      </label>
                      <select
                        value={formData.auth}
                        onChange={(e) => setFormData({ ...formData, auth: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all text-xs cursor-pointer"
                      >
                        <option value="offline">Offline / Cracked (Free & Universal)</option>
                        <option value="microsoft">Microsoft / Mojang (Online Mode)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Default Version (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.version || ''}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        placeholder="Leave empty for Auto-Detect"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* On-Join Command Automation */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Default On-Join Automation
                  </h4>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                      Default On-Join Chat / Command
                    </label>
                    <input
                      type="text"
                      value={formData.onJoinCommand || ''}
                      onChange={(e) => setFormData({ ...formData, onJoinCommand: e.target.value })}
                      placeholder="e.g. /login mypassword or /server survival"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Automatically pre-fills whenever you click "Add Bot". You can always edit it per bot.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Execution Delay (Milliseconds)
                      </label>
                      <input
                        type="number"
                        value={formData.onJoinDelayMs || 2000}
                        onChange={(e) => setFormData({ ...formData, onJoinDelayMs: parseInt(e.target.value, 10) || 2000 })}
                        min={500}
                        step={250}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Default Auto-Reconnect Delay (Seconds)
                      </label>
                      <input
                        type="number"
                        value={formData.reconnectDelaySeconds || 5}
                        onChange={(e) => setFormData({ ...formData, reconnectDelaySeconds: parseInt(e.target.value, 10) || 5 })}
                        min={2}
                        max={60}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quick_messages' && (
              <motion.div
                key="tab-quick-messages"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Quick Messages Editor */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                        Custom Quick Messages & Commands
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        These buttons appear below the live console chat for quick 1-tap sending.
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleResetQuickCommands}
                      className="text-[10px] text-zinc-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Defaults</span>
                    </motion.button>
                  </div>

                  {/* Add New Command Form */}
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                    <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                      Add New Quick Message / Command:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={newCmdLabel}
                        onChange={(e) => setNewCmdLabel(e.target.value)}
                        placeholder="Button Label (e.g. /afk or GG)"
                        className="sm:col-span-4 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="text"
                        value={newCmdText}
                        onChange={(e) => setNewCmdText(e.target.value)}
                        placeholder="Message/Command (e.g. /afk or Good game!)"
                        className="sm:col-span-6 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={handleAddQuickCommand}
                        disabled={!newCmdLabel.trim() || !newCmdText.trim()}
                        className="sm:col-span-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Existing Quick Messages List */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(formData.quickCommands || []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl gap-2 hover:border-zinc-700 transition-colors"
                      >
                        {editingCmdId === item.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editCmdLabel}
                              onChange={(e) => setEditCmdLabel(e.target.value)}
                              className="w-28 bg-zinc-950 border border-sky-500/80 rounded-lg px-2 py-1 text-white font-mono text-xs"
                            />
                            <input
                              type="text"
                              value={editCmdText}
                              onChange={(e) => setEditCmdText(e.target.value)}
                              className="flex-1 bg-zinc-950 border border-sky-500/80 rounded-lg px-2 py-1 text-white font-mono text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditQuickCommand(item.id)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCmdId(null)}
                              className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-md cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono font-medium shrink-0">
                                {item.label}
                              </span>
                              <span className="text-zinc-400 font-mono text-[11px] truncate">
                                → {item.cmd}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditQuickCommand(item)}
                                className="p-1.5 text-zinc-400 hover:text-sky-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit Command"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuickCommand(item.id)}
                                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                title="Delete Command"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Live Preview Bar */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1.5">
                      Console Bar Preview:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {(formData.quickCommands || []).map((q) => (
                        <span
                          key={q.id}
                          className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono whitespace-nowrap"
                        >
                          {q.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'antiafk' && (
              <motion.div
                key="tab-antiafk"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Anti-AFK Defaults */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Default Anti-AFK Routine
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.antiAfk.enabled}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            antiAfk: { ...formData.antiAfk, enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Movement Routine
                      </label>
                      <select
                        value={formData.antiAfk.movementType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            antiAfk: { ...formData.antiAfk, movementType: e.target.value as any },
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all text-xs cursor-pointer"
                      >
                        <option value="strafe_lr">Strafe Left & Right (Position Locked)</option>
                        <option value="jump_strafe">Jump + Strafe (Heavy AFK Detectors)</option>
                        <option value="full_routine">Full Routine (Strafe, Look, Swing)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Default Interval (Seconds)
                      </label>
                      <input
                        type="number"
                        value={formData.antiAfk.intervalSeconds}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            antiAfk: {
                              ...formData.antiAfk,
                              intervalSeconds: Math.max(5, parseInt(e.target.value, 10) || 30),
                            },
                          })
                        }
                        min={5}
                        max={300}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 gap-2 sm:gap-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handleResetFactory}
              className="px-3 py-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700/60 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Reset All Factory Defaults</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/80 cursor-pointer text-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white animate-bounce" />
                  <span>Settings Saved!</span>
                </>
              ) : isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

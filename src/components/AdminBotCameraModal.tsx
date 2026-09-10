import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  X,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  RefreshCw,
  Eye,
  Activity,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export interface AdminBotOption {
  id: string;
  name?: string;
  username: string;
  host: string;
  port: number;
  status: string;
}

interface AdminBotCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBotId?: string;
  bots: AdminBotOption[];
  token: string;
}

export const AdminBotCameraModal: React.FC<AdminBotCameraModalProps> = ({
  isOpen,
  onClose,
  initialBotId,
  bots,
  token,
}) => {
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (initialBotId) {
      setSelectedBotId(initialBotId);
    } else if (bots.length > 0 && !selectedBotId) {
      // Default to first online bot or first bot
      const onlineBot = bots.find((b) => b.status === 'online');
      setSelectedBotId(onlineBot ? onlineBot.id : bots[0].id);
    }
  }, [initialBotId, bots]);

  if (!isOpen) return null;

  const currentBot = bots.find((b) => b.id === selectedBotId) || bots[0];
  const cameraUrl = currentBot
    ? `/admin-pov/${encodeURIComponent(currentBot.id)}/?token=${encodeURIComponent(token)}`
    : '';

  const handleOpenExternal = () => {
    if (cameraUrl) {
      window.open(cameraUrl, '_blank', 'noopener,noreferrer,width=1280,height=720');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative z-10 w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            isFullscreen
              ? 'fixed inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] max-w-none rounded-xl'
              : 'max-w-5xl h-[88vh] max-h-[820px]'
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 relative">
                <Video className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                    Admin Surveillance Camera
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    PRISMARINE 3D POV
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  Real-time voxel chunk rendering and 1st-person perspective tracking (Admin Eyes Only).
                </p>
              </div>
            </div>

            {/* Actions & Bot Selector */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Camera Channel Dropdown */}
              {bots.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[130px]">
                      {currentBot?.name || currentBot?.username || 'Select Bot'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1.5 z-30 max-h-60 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Available Bot Feeds
                      </div>
                      {bots.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedBotId(b.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                            b.id === selectedBotId ? 'bg-zinc-800/80 font-bold text-emerald-400' : 'text-zinc-300'
                          }`}
                        >
                          <div className="truncate">
                            <div className="truncate">{b.name || b.username}</div>
                            <div className="text-[10px] text-zinc-500 font-mono truncate">
                              {b.host}:{b.port}
                            </div>
                          </div>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ml-2 ${
                              b.status === 'online'
                                ? 'bg-emerald-400'
                                : b.status === 'reconnecting'
                                ? 'bg-amber-400'
                                : 'bg-zinc-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pop out external window */}
              <button
                onClick={handleOpenExternal}
                title="Pop out in separate window"
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pop-out</span>
              </button>

              {/* Toggle modal fullscreen */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'Expand View'}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-red-500/20 hover:text-red-400 border border-zinc-700 hover:border-red-500/30 text-zinc-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Camera Frame Viewport */}
          <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
            {currentBot ? (
              <iframe
                key={currentBot.id}
                src={cameraUrl}
                title={`Bot POV • ${currentBot.username}`}
                className="w-full h-full border-0"
                allow="fullscreen; autoplay"
              />
            ) : (
              <div className="text-center p-8 text-zinc-500 text-xs">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                No active bot selected for surveillance.
              </div>
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-zinc-300">
                ACTIVE FEED: {currentBot ? (currentBot.name || currentBot.username) : 'None'}
              </span>
              <span className="text-zinc-600 font-mono">•</span>
              <span className="font-mono text-zinc-400">
                TARGET: {currentBot?.host}:{currentBot?.port}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500">
                🔒 Admin Clearance Verified
              </span>
              <button
                onClick={() => {
                  const iframe = document.querySelector('iframe');
                  if (iframe) iframe.src = iframe.src;
                }}
                className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                title="Reload Camera Stream"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Terminal,
  Trash2,
  ArrowDown,
  Command,
  MessageSquare,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { ChatMessage, QuickCommandItem } from '../types';

interface ChatConsoleProps {
  chatHistory: ChatMessage[];
  botUsername: string;
  isOnline: boolean;
  botStatus?: string;
  quickCommands?: QuickCommandItem[];
  onSendMessage: (message: string) => Promise<boolean>;
  onClearChat?: () => void;
  onOpenQuickMessagesSettings?: () => void;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  chatHistory,
  botUsername,
  isOnline,
  botStatus,
  quickCommands,
  onSendMessage,
  onClearChat,
  onOpenQuickMessagesSettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'chat' | 'system'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canSend = isOnline || botStatus === 'starting';

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const msg = inputText.trim();
    setIsSending(true);
    setInputText('');

    try {
      await onSendMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const sendQuickCommand = (cmd: string) => {
    onSendMessage(cmd);
  };

  const filteredHistory = chatHistory.filter((msg) => {
    if (filter === 'all') return true;
    if (filter === 'chat') return msg.type === 'chat' || msg.type === 'whisper' || msg.type === 'bot_sent';
    if (filter === 'system') return msg.type === 'system' || msg.type === 'info' || msg.type === 'error';
    return true;
  });

  const defaultQuickCommands: QuickCommandItem[] = [
    { id: '1', label: '/spawn', cmd: '/spawn' },
    { id: '2', label: '/home', cmd: '/home' },
    { id: '3', label: '/list', cmd: '/list' },
    { id: '4', label: '/help', cmd: '/help' },
    { id: '5', label: '/ping', cmd: '/ping' },
    { id: '6', label: 'Hello!', cmd: 'Hello everyone!' },
  ];

  const activeQuickCommands = quickCommands && quickCommands.length > 0 ? quickCommands : defaultQuickCommands;

  return (
    <div id="chat-console" className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-zinc-950/90 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-xs text-white truncate">
              Minecraft Live Chat & Console
            </h3>
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            ) : botStatus === 'starting' ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 font-bold bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-spin" />
                CONNECTING...
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 font-medium shrink-0">OFFLINE</span>
            )}
          </div>
        </div>

        {/* Filter buttons and Clear action */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-[11px] relative">
            {(['all', 'chat', 'system'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors relative z-10 ${
                  filter === tab ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
                {filter === tab && (
                  <motion.div
                    layoutId="chat-filter-tab"
                    className="absolute inset-0 bg-zinc-800 border border-zinc-700/60 rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            ))}
          </div>

          <motion.button
            id="btn-clear-chat-console"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClearChat && onClearChat()}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-200 border border-zinc-800 hover:border-rose-500/50 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Clear Console History"
            aria-label="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-[11px] font-medium">Clear</span>
          </motion.button>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono text-xs bg-zinc-950/40 select-text"
      >
        {filteredHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
            <MessageSquare className="w-8 h-8 text-zinc-700" />
            <p>No chat messages received yet</p>
          </div>
        ) : (
          filteredHistory.map((msg) => {
            const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            // Extract sender if encoded in raw string like <Player> message
            let displaySender = msg.sender;
            let displayText = msg.text;
            if (!displaySender && (msg.type === 'chat' || msg.type === 'whisper')) {
              const match = displayText.match(/^[<\[]([A-Za-z0-9_]{3,16})[>\]]\s*(.*)$/);
              if (match) {
                displaySender = match[1];
                displayText = match[2];
              }
            }

            const isBotSelf =
              msg.type === 'bot_sent' ||
              (displaySender && displaySender.toLowerCase() === botUsername.toLowerCase());
            const isOtherPlayer = (msg.type === 'chat' || msg.type === 'whisper') && !isBotSelf;
            const isSystem = msg.type === 'system' || msg.type === 'info';
            const isError = msg.type === 'error';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`py-1 px-2.5 rounded-lg flex items-start gap-2 hover:bg-zinc-800/40 transition-colors ${
                  isBotSelf
                    ? 'bg-sky-950/20 border-l-2 border-sky-400'
                    : isOtherPlayer
                    ? 'bg-emerald-950/25 border-l-2 border-emerald-500'
                    : isError
                    ? 'bg-rose-950/20 border-l-2 border-rose-500 text-rose-300'
                    : isSystem
                    ? 'text-zinc-400'
                    : 'text-zinc-200'
                }`}
              >
                {/* Timestamp */}
                <span className="text-[10px] text-zinc-500 shrink-0 select-none mt-0.5 font-mono">
                  [{timeStr}]
                </span>

                {/* Sender badge if chat */}
                {isBotSelf ? (
                  <span className="text-sky-400 font-bold shrink-0 flex items-center gap-1 font-mono">
                    &lt;{botUsername}&gt;
                  </span>
                ) : isOtherPlayer ? (
                  <span className="text-emerald-400 font-bold shrink-0 font-mono">
                    &lt;{displaySender || 'Player'}&gt;
                  </span>
                ) : displaySender ? (
                  <span className="text-amber-300 font-bold shrink-0 font-mono">
                    [{displaySender}]
                  </span>
                ) : null}

                {/* Content */}
                <div
                  className={`flex-1 break-words leading-relaxed font-mono ${
                    isBotSelf
                      ? 'text-zinc-100'
                      : isOtherPlayer
                      ? 'text-emerald-300'
                      : 'text-zinc-300'
                  }`}
                >
                  {msg.formattedHtml && !isOtherPlayer && !isBotSelf ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: msg.formattedHtml }}
                      className="inline"
                    />
                  ) : (
                    <span>{displayText}</span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Quick Command Pills with motion */}
      <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1 shrink-0">
          <Command className="w-3 h-3 text-zinc-400" />
          Quick:
        </span>
        {activeQuickCommands.map((q) => (
          <motion.button
            key={q.id || q.cmd}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendQuickCommand(q.cmd)}
            disabled={!canSend}
            className="shrink-0 px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-[11px] font-mono font-medium transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            {q.label}
          </motion.button>
        ))}

        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {onOpenQuickMessagesSettings && (
            <motion.button
              whileHover={{ scale: 1.12, rotate: 45 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={onOpenQuickMessagesSettings}
              className="p-1 text-zinc-500 hover:text-sky-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Customize Quick Messages in Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => onClearChat && onClearChat()}
            className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Clear Console Messages"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Chat Input Bar with motion button */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            id="chat-input-field"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              canSend
                ? `Type message or /command as ${botUsername}...`
                : 'Bot is offline (Connect to send messages)'
            }
            disabled={!canSend}
            className="w-full bg-zinc-900/90 text-white placeholder-zinc-500 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
          />
          {inputText.startsWith('/') && (
            <span className="absolute right-3 top-2.5 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold">
              Command
            </span>
          )}
        </div>

        <motion.button
          id="btn-send-chat"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!canSend || !inputText.trim() || isSending}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:shadow-none shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </motion.button>
      </form>
    </div>
  );
};

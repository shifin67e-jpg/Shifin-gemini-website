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
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatConsoleProps {
  chatHistory: ChatMessage[];
  botUsername: string;
  isOnline: boolean;
  botStatus?: string;
  onSendMessage: (message: string) => Promise<boolean>;
  onClearChat?: () => void;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  chatHistory,
  botUsername,
  isOnline,
  botStatus,
  onSendMessage,
  onClearChat,
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

  const quickCommands = [
    { label: '/spawn', cmd: '/spawn' },
    { label: '/home', cmd: '/home' },
    { label: '/list', cmd: '/list' },
    { label: '/help', cmd: '/help' },
    { label: '/ping', cmd: '/ping' },
    { label: 'Hello!', cmd: 'Hello everyone!' },
  ];

  return (
    <div id="chat-console" className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white flex items-center gap-2">
              Minecraft Live Chat & Command Console
              {isOnline ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              ) : botStatus === 'starting' ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 font-bold bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-spin" />
                  CONNECTING...
                </span>
              ) : (
                <span className="text-[10px] text-zinc-500 font-medium">OFFLINE</span>
              )}
            </h3>
          </div>
        </div>

        {/* Filter buttons with layout pill */}
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

            const isBotSelf = msg.type === 'bot_sent';
            const isSystem = msg.type === 'system' || msg.type === 'info';
            const isError = msg.type === 'error';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`py-0.5 px-2 rounded flex items-start gap-2 hover:bg-zinc-800/40 transition-colors ${
                  isBotSelf
                    ? 'bg-emerald-950/20 border-l-2 border-emerald-500'
                    : isError
                    ? 'bg-rose-950/20 border-l-2 border-rose-500 text-rose-300'
                    : isSystem
                    ? 'text-zinc-400'
                    : 'text-zinc-200'
                }`}
              >
                {/* Timestamp */}
                <span className="text-[10px] text-zinc-500 shrink-0 select-none mt-0.5">
                  [{timeStr}]
                </span>

                {/* Sender badge if chat */}
                {isBotSelf ? (
                  <span className="text-emerald-400 font-bold shrink-0">
                    &lt;{botUsername}&gt;
                  </span>
                ) : msg.sender ? (
                  <span className="text-amber-300 font-bold shrink-0">
                    &lt;{msg.sender}&gt;
                  </span>
                ) : null}

                {/* Content */}
                <div className="flex-1 text-zinc-300 break-words leading-relaxed">
                  {msg.formattedHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: msg.formattedHtml }}
                      className="inline"
                    />
                  ) : (
                    <span>{msg.text}</span>
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
        {quickCommands.map((q) => (
          <motion.button
            key={q.cmd}
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => sendQuickCommand(q.cmd)}
            disabled={!canSend}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-mono font-medium transition-colors cursor-pointer"
          >
            {q.label}
          </motion.button>
        ))}
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

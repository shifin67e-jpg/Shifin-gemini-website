import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Users,
  Bot as BotIcon,
  Sliders,
  LogIn,
  Play,
  Square,
  Trash2,
  Search,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Sparkles,
  Video,
  Eye,
} from 'lucide-react';
import { AdminAccountInfo, User } from '../types';
import { AdminBotCameraModal } from './AdminBotCameraModal';

interface AdminPageProps {
  currentUser: User;
  onBackToDashboard: () => void;
  onImpersonate: (token: string, user: User) => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  onBackToDashboard,
  onImpersonate,
  authFetch,
}) => {
  const [accounts, setAccounts] = useState<AdminAccountInfo[]>([]);
  const [globalBotLimit, setGlobalBotLimit] = useState<number>(1);
  const [newLimitInput, setNewLimitInput] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [selectedCameraBotId, setSelectedCameraBotId] = useState<string | undefined>(undefined);

  const token = localStorage.getItem('ninimo_token') || '';

  const allFleetBots = React.useMemo(() => {
    return accounts.flatMap((acc) =>
      acc.bots.map((b) => ({
        id: b.id,
        name: b.name,
        username: b.username,
        host: b.host,
        port: b.port,
        status: b.status,
      }))
    );
  }, [accounts]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/accounts');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load administrator accounts data');
      }
      const data = await res.json();
      setAccounts(data.accounts || []);
      if (typeof data.globalBotLimit === 'number') {
        setGlobalBotLimit(data.globalBotLimit);
        setNewLimitInput(String(data.globalBotLimit));
      }
    } catch (err: any) {
      setError(err.message || 'Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseInt(newLimitInput, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      setError('Bot limit must be a positive integer between 1 and 100');
      return;
    }

    setActionLoading('limit');
    setError(null);
    try {
      const res = await authFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ globalBotLimit: limitNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update limit');

      setGlobalBotLimit(data.globalBotLimit);
      setSuccessMessage(`Global bot limit successfully updated to ${data.globalBotLimit} bot(s) per account!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleImpersonateUser = async (targetUserId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to log into the account "${username}"? You will switch directly to their session.`)) {
      return;
    }

    setActionLoading(`impersonate-${targetUserId}`);
    setError(null);
    try {
      const res = await authFetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to impersonate user');

      onImpersonate(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
      setActionLoading(null);
    }
  };

  const handleBotAction = async (botId: string, action: 'start' | 'stop' | 'delete') => {
    if (action === 'delete' && !window.confirm('Delete this bot instance?')) {
      return;
    }

    setActionLoading(`${action}-${botId}`);
    try {
      const method = action === 'delete' ? 'DELETE' : 'POST';
      const endpoint = action === 'delete' ? `/api/admin/bots/${botId}` : `/api/admin/bots/${botId}/${action}`;
      const res = await authFetch(endpoint, { method });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${action} bot`);
      }
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    return (
      acc.username.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.bots.some((b) => b.name.toLowerCase().includes(q) || b.username.toLowerCase().includes(q))
    );
  });

  const totalBots = accounts.reduce((acc, curr) => acc + curr.botCount, 0);
  const activeBots = accounts.reduce(
    (acc, curr) => acc + curr.bots.filter((b) => b.status === 'online').length,
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white tracking-tight">Super Administrator Control Center</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Root Admin ({currentUser.username})
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full governance over all user accounts, active bot instances, and global platform rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="admin-refresh-btn"
              onClick={fetchAdminData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              id="admin-back-btn"
              onClick={onBackToDashboard}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-medium"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              Dismiss
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-medium"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview Stats + Global Bot Limit Changer + Surveillance Camera */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quick Stats 1 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{accounts.length}</div>
            <div className="text-xs text-zinc-400 font-medium">Registered Accounts</div>
          </div>
        </div>

        {/* Quick Stats 2 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BotIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              {activeBots} <span className="text-sm font-normal text-zinc-500">/ {totalBots} active</span>
            </div>
            <div className="text-xs text-zinc-400 font-medium">Minecraft Bots In Fleet</div>
          </div>
        </div>

        {/* Admin POV Surveillance Camera Quick Launch */}
        <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Bot POV Feeds</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300">
              PRISMARINE
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-3 leading-tight">
            Stream first-person eyes & live 3D chunk voxels as an admin.
          </p>
          <button
            onClick={() => {
              setSelectedCameraBotId(allFleetBots[0]?.id);
              setIsCameraModalOpen(true);
            }}
            disabled={allFleetBots.length === 0}
            className="w-full py-2 px-3 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-red-950/40 disabled:opacity-50"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch Cameras ({allFleetBots.length})</span>
          </button>
        </div>

        {/* Global Bot Limit Card */}
        <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Account Bot Limit</h3>
          </div>
          <form onSubmit={handleUpdateLimit} className="flex items-center gap-2">
            <input
              id="admin-bot-limit-input"
              type="number"
              min="1"
              max="50"
              value={newLimitInput}
              onChange={(e) => setNewLimitInput(e.target.value)}
              className="w-24 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              id="admin-save-limit-btn"
              type="submit"
              disabled={actionLoading === 'limit'}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
            >
              {actionLoading === 'limit' ? 'Updating...' : 'Set Limit'}
            </button>
            <span className="text-xs text-zinc-400 font-mono">Current: {globalBotLimit}/acc</span>
          </form>
          <p className="text-[11px] text-zinc-400 mt-2 leading-tight">
            Sets the max bot instances allowed per user account and browser session.
          </p>
        </div>
      </div>

      {/* Search & Account Directory */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Active User Accounts & Bots Directory</h2>
              <p className="text-xs text-zinc-400">Inspect all registered users, see their bots, and log in directly to manage them.</p>
            </div>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, or bot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* List of Accounts */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <p className="text-xs">Fetching accounts directory...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            No accounts found matching "{searchQuery}".
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAccounts.map((account) => {
              const isCurrentAdmin = account.id === currentUser.id;

              return (
                <div
                  key={account.id}
                  className={`rounded-xl border p-4 transition-all ${
                    account.isAdmin
                      ? 'bg-zinc-950/60 border-amber-500/30'
                      : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* User Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-sm">
                        {account.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{account.username}</span>
                          {account.isAdmin && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Admin
                            </span>
                          )}
                          {isCurrentAdmin && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                          <span>{account.email}</span>
                          <span>&bull;</span>
                          <span>Created: {new Date(account.createdAt).toLocaleDateString()}</span>
                          {account.registrationIp && account.registrationIp !== 'unknown' && (
                            <>
                              <span>&bull;</span>
                              <span className="text-zinc-500">IP: {account.registrationIp}</span>
                            </>
                          )}
                          {account.deviceFingerprint && account.deviceFingerprint !== 'unknown' && (
                            <>
                              <span>&bull;</span>
                              <span className="text-zinc-500 font-mono text-[10px]">
                                Dev: {account.deviceFingerprint.slice(0, 16)}...
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Impersonate Button */}
                    <div className="flex items-center gap-2">
                      {!isCurrentAdmin && (
                        <button
                          id={`impersonate-${account.id}`}
                          onClick={() => handleImpersonateUser(account.id, account.username)}
                          disabled={actionLoading === `impersonate-${account.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-950/40"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          {actionLoading === `impersonate-${account.id}` ? 'Switching...' : 'Log in as User'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Account's Bots */}
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                      <BotIcon className="w-3.5 h-3.5 text-zinc-400" />
                      Assigned Bots ({account.bots.length}/{globalBotLimit}):
                    </div>

                    {account.bots.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No bots configured yet for this account.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {account.bots.map((bot) => (
                          <div
                            key={bot.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                                <img
                                  src={`https://mc-heads.net/avatar/${encodeURIComponent(bot.username)}/48`}
                                  alt={bot.username}
                                  className="w-full h-full rounded object-cover pixelated"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                  <span>{bot.name || bot.username}</span>
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      bot.status === 'online'
                                        ? 'bg-emerald-400'
                                        : bot.status === 'reconnecting'
                                        ? 'bg-yellow-400'
                                        : 'bg-zinc-500'
                                    }`}
                                  />
                                </div>
                                <div className="text-[11px] font-mono text-zinc-400 truncate">
                                  {bot.host}:{bot.port} ({bot.status})
                                </div>
                              </div>
                            </div>

                            {/* Bot controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                title="Watch Bot POV Camera (Admin Only)"
                                onClick={() => {
                                  setSelectedCameraBotId(bot.id);
                                  setIsCameraModalOpen(true);
                                }}
                                className="p-1.5 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all flex items-center gap-1 text-[10px] font-bold"
                              >
                                <Video className="w-3.5 h-3.5 text-red-400" />
                                <span className="hidden sm:inline">POV</span>
                              </button>

                              {bot.status === 'online' ? (
                                <button
                                  title="Stop Bot"
                                  onClick={() => handleBotAction(bot.id, 'stop')}
                                  disabled={actionLoading === `stop-${bot.id}`}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                  <Square className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  title="Start Bot"
                                  onClick={() => handleBotAction(bot.id, 'start')}
                                  disabled={actionLoading === `start-${bot.id}`}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                title="Delete Bot"
                                onClick={() => handleBotAction(bot.id, 'delete')}
                                disabled={actionLoading === `delete-${bot.id}`}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Bot POV Surveillance Camera Modal */}
      <AdminBotCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        initialBotId={selectedCameraBotId}
        bots={allFleetBots}
        token={token}
      />
    </div>
  );
};

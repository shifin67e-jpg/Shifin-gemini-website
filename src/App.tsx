import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BotState, GlobalStats, BotConfig, User, PublicPlatformStats } from './types';
import { Navbar } from './components/Navbar';
import { BotList } from './components/BotList';
import { BotHud } from './components/BotHud';
import { ChatConsole } from './components/ChatConsole';
import { AntiAfkCard } from './components/AntiAfkCard';
import { ConnectionSettingsCard } from './components/ConnectionSettingsCard';
import { BotModal } from './components/BotModal';
import { AuthModal } from './components/AuthModal';
import { PlayersWidget } from './components/PlayersWidget';
import { AdminPage } from './components/AdminPage';
import { LivePlatformCounter } from './components/LivePlatformCounter';
import { TesterSwarmCommander } from './components/TesterSwarmCommander';
import { AdminBotCameraModal } from './components/AdminBotCameraModal';
import {
  Shield,
  Zap,
  Bot,
  Lock,
  ArrowRight,
  Server,
  LogIn,
  UserPlus,
  Info,
  ShieldAlert,
  ArrowLeftRight,
} from 'lucide-react';

import { getDeviceFingerprint } from './lib/fingerprint';

export default function App() {
  const [bots, setBots] = useState<BotState[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [stats, setStats] = useState<GlobalStats>({
    totalBots: 0,
    activeBots: 0,
    reconnectingBots: 0,
    stoppedBots: 0,
    totalUptimeSeconds: 0,
  });
  const [publicStats, setPublicStats] = useState<PublicPlatformStats | null>(null);
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [editingBot, setEditingBot] = useState<BotState | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'hud_chat' | 'anti_afk' | 'settings' | 'bots'>('hud_chat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const [adminReturnToken, setAdminReturnToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ninimo_admin_return_token');
    } catch {
      return null;
    }
  });
  const [globalBotLimit, setGlobalBotLimit] = useState<number>(1);
  const [isUserCameraOpen, setIsUserCameraOpen] = useState(false);
  const [userCameraBotId, setUserCameraBotId] = useState<string | undefined>(undefined);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Client device ID generator & persistent cookie/storage sync
  const getBrowserDeviceId = (): string => {
    return getDeviceFingerprint();
  };

  // Helper for authenticated requests
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('ninimo_token');
    const deviceId = getDeviceFingerprint();
    const headers = {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      'X-Device-Fingerprint': deviceId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  }, []);

  const refreshBots = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await authFetch('/api/bots');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bots)) {
          setBots(data.bots);
          if (data.bots.length > 0 && !selectedBotId) {
            setSelectedBotId(data.bots[0].id);
          }
        }
      }
    } catch {}
  }, [currentUser, authFetch, selectedBotId]);

  // Check existing auth, global settings, and load public platform metrics on load
  useEffect(() => {
    // Load public metrics immediately
    fetch('/api/stats/public')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPublicStats(data);
      })
      .catch(() => {});

    // Load global settings
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.globalBotLimit) {
          setGlobalBotLimit(data.globalBotLimit);
        }
      })
      .catch(() => {});

    const token = localStorage.getItem('ninimo_token');
    const cachedProfileRaw = localStorage.getItem('ninimo_user_profile');
    let cachedProfile: User | null = null;
    try {
      if (cachedProfileRaw) cachedProfile = JSON.parse(cachedProfileRaw);
    } catch {}

    if (!token && !cachedProfile) {
      setIsAuthChecking(false);
      return;
    }

    const deviceId = getDeviceFingerprint();
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Device-Id': deviceId,
        'X-Device-Fingerprint': deviceId,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          return res.json();
        }

        // If server had a container reboot or session dropped, self-heal via restore-session
        if (token && cachedProfile) {
          console.log('[AUTO-RESTORE] Restoring user session from local client cache...');
          try {
            const restoreRes = await fetch('/api/auth/restore-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, user: cachedProfile }),
            });
            if (restoreRes.ok) {
              return restoreRes.json();
            }
          } catch {}
        }

        if (res.status === 401 && !cachedProfile) {
          localStorage.removeItem('ninimo_token');
          localStorage.removeItem('ninimo_user_profile');
          setCurrentUser(null);
        }
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          try {
            localStorage.setItem('ninimo_user_profile', JSON.stringify(data.user));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Network issue during auth verification, preserving cached session:', err);
        if (cachedProfile) {
          setCurrentUser(cachedProfile);
        }
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  const handleImpersonate = (token: string, targetUser: User) => {
    const currentToken = localStorage.getItem('ninimo_token');
    if (currentToken && currentUser?.isAdmin) {
      localStorage.setItem('ninimo_admin_return_token', currentToken);
      setAdminReturnToken(currentToken);
    }
    localStorage.setItem('ninimo_token', token);
    setCurrentUser(targetUser);
    setShowAdminPage(false);
    fetchBots();
    showToast(`Logged into account "${targetUser.username}". You can manage their bots now.`);
  };

  const handleExitImpersonation = async () => {
    if (!adminReturnToken) return;
    localStorage.setItem('ninimo_token', adminReturnToken);
    localStorage.removeItem('ninimo_admin_return_token');
    setAdminReturnToken(null);
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${adminReturnToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setShowAdminPage(true);
        fetchBots();
        showToast('Returned to Administrator account.');
      }
    } catch {
      showToast('Returned to Administrator account.');
    }
  };

  // Backup bot configs in browser storage per user so data is never lost across container restarts
  const saveBotsToLocalStorage = useCallback((userId: string, currentBots: BotState[]) => {
    try {
      if (!userId || currentBots.length === 0) return;
      const configsToSave = currentBots.map((b) => b.config);
      localStorage.setItem(`ninimo_bots_${userId}`, JSON.stringify(configsToSave));
    } catch {}
  }, []);

  const getBotsFromLocalStorage = useCallback((userId: string): BotConfig[] => {
    try {
      if (!userId) return [];
      const raw = localStorage.getItem(`ninimo_bots_${userId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  // Fetch current user's bots with automatic recovery if server was reset
  const fetchBots = useCallback(async () => {
    const token = localStorage.getItem('ninimo_token');
    if (!token || !currentUser) {
      setBots([]);
      setSelectedBotId(null);
      return;
    }

    try {
      const res = await authFetch('/api/bots');
      if (res.ok) {
        const data = await res.json();
        let userBots: BotState[] = data.bots || [];

        // Check if server experienced a container reboot and has default profile whereas client had customized bots
        const cachedBots = getBotsFromLocalStorage(currentUser.id);
        const hasCustomizedCached = cachedBots.length > 0 && (
          cachedBots.length > userBots.length ||
          (userBots.length === 1 && userBots[0].config.name === 'NinimoBot' && cachedBots[0]?.name !== 'NinimoBot') ||
          (userBots.length === 1 && userBots[0].config.host === 'play.hypixel.net' && cachedBots[0]?.host !== 'play.hypixel.net')
        );

        if (hasCustomizedCached) {
          console.log('[AUTO-RESTORE] Restoring cached bot configurations to server after container restart...');
          try {
            const syncRes = await authFetch('/api/bots/sync', {
              method: 'POST',
              body: JSON.stringify({ bots: cachedBots }),
            });
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              if (syncData.bots && syncData.bots.length > 0) {
                userBots = syncData.bots;
              }
            }
          } catch (syncErr) {
            console.error('Failed to sync cached bots:', syncErr);
          }
        }

        setBots(userBots);
        saveBotsToLocalStorage(currentUser.id, userBots);

        if (userBots.length > 0) {
          setSelectedBotId((prev) => {
            if (prev && userBots.some((b) => b.id === prev)) {
              return prev;
            }
            return userBots[0].id;
          });
        } else {
          setSelectedBotId(null);
        }
      } else if (res.status === 401) {
        // Token invalid/expired
        localStorage.removeItem('ninimo_token');
        setCurrentUser(null);
        setBots([]);
        setSelectedBotId(null);
      }

      const statsRes = await authFetch('/api/stats');
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }
    } catch (err) {
      console.error('Failed to fetch user state:', err);
    }
  }, [authFetch, currentUser, getBotsFromLocalStorage, saveBotsToLocalStorage]);

  // Self-healing keepalive ping loop every 25 seconds to keep Google Cloud Run active and prevent container idle kill
  useEffect(() => {
    const keepaliveTimer = setInterval(() => {
      fetch('/api/ping', { method: 'POST' }).catch(() => {});
    }, 25000);

    return () => clearInterval(keepaliveTimer);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchBots();
    } else {
      setBots([]);
      setSelectedBotId(null);
      setStats({
        totalBots: 0,
        activeBots: 0,
        reconnectingBots: 0,
        stoppedBots: 0,
        totalUptimeSeconds: 0,
      });
    }
  }, [currentUser, fetchBots]);

  // Real-time SSE Stream for the authenticated user with automatic reconnection
  useEffect(() => {
    const token = localStorage.getItem('ninimo_token');
    if (!currentUser || !token) {
      setIsStreamConnected(false);
      return;
    }

    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    const connectSSE = () => {
      if (!isSubscribed) return;
      if (eventSource) {
        eventSource.close();
      }

      const deviceId = getBrowserDeviceId();
      eventSource = new EventSource(`/api/events?token=${encodeURIComponent(token)}&deviceId=${encodeURIComponent(deviceId)}`);

      eventSource.onopen = () => {
        if (isSubscribed) setIsStreamConnected(true);
      };

      eventSource.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const payload = JSON.parse(event.data);

          if (payload.event === 'initial_state') {
            if (payload.data.globalBotLimit) {
              setGlobalBotLimit(payload.data.globalBotLimit);
            }
            if (payload.data.bots) {
              setBots(payload.data.bots);
              saveBotsToLocalStorage(currentUser.id, payload.data.bots);
              if (payload.data.bots.length > 0 && !selectedBotId) {
                setSelectedBotId(payload.data.bots[0].id);
              }
            }
            if (payload.data.stats) {
              setStats(payload.data.stats);
            }
          } else if (payload.event === 'settings_update') {
            if (payload.data.globalBotLimit) {
              setGlobalBotLimit(payload.data.globalBotLimit);
            }
          } else if (payload.event === 'bot_update') {
            const updatedBot: BotState = payload.data;
            setBots((prev) => {
              const updated = prev.map((b) => (b.id === updatedBot.id ? updatedBot : b));
              saveBotsToLocalStorage(currentUser.id, updated);
              return updated;
            });
          } else if (payload.event === 'chat_message') {
            const { botId, message } = payload.data;
            setBots((prev) =>
              prev.map((b) => {
                if (b.id === botId) {
                  const newHistory = [...b.chatHistory, message];
                  if (newHistory.length > 200) newHistory.shift();
                  return { ...b, chatHistory: newHistory };
                }
                return b;
              })
            );
          } else if (payload.event === 'bot_created') {
            setBots((prev) => {
              const next = [...prev, payload.data];
              saveBotsToLocalStorage(currentUser.id, next);
              return next;
            });
            setSelectedBotId(payload.data.id);
          } else if (payload.event === 'bot_deleted') {
            setBots((prev) => {
              const next = prev.filter((b) => b.id !== payload.data.id);
              saveBotsToLocalStorage(currentUser.id, next);
              return next;
            });
            setSelectedBotId((prev) => (prev === payload.data.id ? null : prev));
          } else if (payload.event === 'stats') {
            setStats(payload.data);
          }
        } catch {
          // ignore
        }
      };

      eventSource.onerror = () => {
        if (!isSubscribed) return;
        setIsStreamConnected(false);
        eventSource?.close();
        // Automatically reconnect after short pause
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          if (isSubscribed) connectSSE();
        }, 3000);
      };
    };

    connectSSE();

    fallbackInterval = setInterval(() => {
      if (!isStreamConnected && currentUser) {
        fetchBots();
      }
    }, 5000);

    return () => {
      isSubscribed = false;
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [currentUser, fetchBots, isStreamConnected, saveBotsToLocalStorage, selectedBotId]);

  // Real-time Public SSE stream for guest live counter
  useEffect(() => {
    if (currentUser) return;

    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const connectPublicSSE = () => {
      eventSource = new EventSource('/api/events/public');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'initial_public_state' || payload.event === 'public_stats_update') {
            setPublicStats(payload.data);
          }
        } catch {
          // ignore
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    };

    connectPublicSSE();

    fallbackInterval = setInterval(() => {
      fetch('/api/stats/public')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setPublicStats(data);
        })
        .catch(() => {});
    }, 6000);

    return () => {
      eventSource?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [currentUser]);

  const handleLogout = async () => {
    const token = localStorage.getItem('ninimo_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('ninimo_token');
    localStorage.removeItem('ninimo_user_profile');
    localStorage.removeItem('ninimo_admin_return_token');
    setAdminReturnToken(null);
    setShowAdminPage(false);
    setCurrentUser(null);
    setBots([]);
    setSelectedBotId(null);
    setIsStreamConnected(false);
    showToast('Signed out. Your private bot configurations are saved.');
  };

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Active bot selection
  const activeBot = bots.find((b) => b.id === selectedBotId) || bots[0] || null;

  // Bot actions
  const handleStartBot = async (id: string) => {
    const runningBots = bots.filter(
      (b) => b.id !== id && (b.status === 'online' || b.status === 'reconnecting' || b.status === 'starting')
    );

    if (runningBots.length >= globalBotLimit) {
      showToast(`Active limit reached (${globalBotLimit} max): Please stop your running bot before activating this one!`);
      return;
    }

    try {
      const res = await authFetch(`/api/bots/${id}/start`, { method: 'POST' });
      if (res.ok) {
        showToast('Connecting bot to Minecraft server...');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Active limit: Only ${globalBotLimit} active bot(s) allowed. Stop your other bot first!`);
      }
    } catch {
      showToast('Error connecting bot');
    }
  };

  const handleStopBot = async (id: string) => {
    try {
      const res = await authFetch(`/api/bots/${id}/stop`, { method: 'POST' });
      if (res.ok) {
        showToast('Bot stopped');
      } else {
        showToast('Failed to stop bot');
      }
    } catch {
      showToast('Error stopping bot');
    }
  };

  const handleRestartBot = async (id: string) => {
    try {
      const res = await authFetch(`/api/bots/${id}/restart`, { method: 'POST' });
      if (res.ok) {
        showToast('Restarting bot connection...');
      } else {
        showToast('Failed to restart bot');
      }
    } catch {
      showToast('Error restarting bot');
    }
  };

  const handleSendMessage = async (msg: string): Promise<boolean> => {
    if (!activeBot) return false;
    try {
      const res = await authFetch(`/api/bots/${activeBot.id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: msg }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleSaveBotConfig = async (updated: Partial<BotConfig>) => {
    if (!activeBot) return;
    try {
      const res = await authFetch(`/api/bots/${activeBot.id}`, {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state immediately
        if (data.bot) {
          setBots((prev) => prev.map((b) => (b.id === data.bot.id ? data.bot : b)));
        }
        showToast('Configuration saved to your account!');
      } else {
        showToast('Failed to update bot configuration');
      }
    } catch {
      showToast('Error updating configuration');
    }
  };

  const handleToggleAntiAfk = async (id: string, enabled: boolean) => {
    const target = bots.find((b) => b.id === id);
    if (!target) return;
    const updatedAfk = { ...target.config.antiAfk, enabled };
    try {
      const res = await authFetch(`/api/bots/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ antiAfk: updatedAfk }),
      });
      if (res.ok) {
        setBots((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, config: { ...b.config, antiAfk: updatedAfk } } : b
          )
        );
        showToast(enabled ? 'Anti-AFK movement activated' : 'Anti-AFK paused');
      }
    } catch {
      showToast('Failed to update Anti-AFK');
    }
  };

  const handleTriggerTestMove = async () => {
    if (!activeBot) return;
    const updated = {
      ...activeBot.config.antiAfk,
      enabled: true,
    };
    await authFetch(`/api/bots/${activeBot.id}`, {
      method: 'PUT',
      body: JSON.stringify({ antiAfk: updated }),
    });
    showToast('Testing Anti-AFK movement...');
  };

  const handleDeleteBot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bot profile?')) return;
    try {
      const res = await authFetch(`/api/bots/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBots((prev) => prev.filter((b) => b.id !== id));
        setSelectedBotId((prev) => (prev === id ? null : prev));
        showToast('Bot profile deleted');
      } else {
        showToast('Failed to delete bot');
      }
    } catch {
      showToast('Error deleting bot');
    }
  };

  const handleCreateOrUpdateModal = async (data: Partial<BotConfig>) => {
    if (editingBot) {
      const res = await authFetch(`/api/bots/${editingBot.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated.bot) {
          setBots((prev) => prev.map((b) => (b.id === updated.bot.id ? updated.bot : b)));
        }
        showToast('Bot updated successfully!');
      } else {
        showToast('Failed to update bot');
      }
    } else {
      if (bots.length >= globalBotLimit) {
        showToast(`Limit reached: ${globalBotLimit} bot(s) per account. Edit your active bot settings.`);
        return;
      }
      const res = await authFetch('/api/bots', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        showToast('Bot profile created!');
        if (created.bot?.id) {
          setBots((prev) => [...prev, created.bot]);
          setSelectedBotId(created.bot.id);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to create bot: ${globalBotLimit} bot limit per account`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navbar with Ninimo branding, admin tools, and auth */}
      <Navbar
        stats={stats}
        publicStats={publicStats}
        isStreamConnected={isStreamConnected}
        currentUser={currentUser}
        globalBotLimit={globalBotLimit}
        showingAdminPage={showAdminPage}
        isImpersonating={!!adminReturnToken}
        onOpenAdmin={() => setShowAdminPage((prev) => !prev)}
        onExitImpersonation={handleExitImpersonation}
        onAddNewBot={() => {
          if (!currentUser) {
            openAuth('login');
            return;
          }
          if (bots.length >= globalBotLimit) {
            showToast(`Limit reached: Maximum ${globalBotLimit} bot(s) allowed per account. Edit your active bot to change settings.`);
            return;
          }
          setEditingBot(null);
          setIsModalOpen(true);
        }}
        onOpenAuth={() => openAuth('login')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toast Notification with spring animation */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authenticated View vs Guest Security Gateway with Live Bot Profiles & Online Counter */}
        {!currentUser && !isAuthChecking ? (
          <div className="py-2 sm:py-4">
            <LivePlatformCounter
              publicStats={publicStats}
              onSignUp={() => openAuth('signup')}
              onSignIn={() => openAuth('login')}
            />
          </div>
        ) : currentUser && showAdminPage && currentUser.isAdmin ? (
          <AdminPage
            currentUser={currentUser}
            onBackToDashboard={() => setShowAdminPage(false)}
            onImpersonate={handleImpersonate}
            authFetch={authFetch}
          />
        ) : (
          <>
            {/* Impersonation Indicator Banner */}
            {adminReturnToken && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 text-xs shadow-md">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Admin Impersonation Mode:</strong> Currently viewing and managing the account of <strong>{currentUser?.username}</strong>.
                  </span>
                </div>
                <button
                  onClick={handleExitImpersonation}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm"
                >
                  Return to Admin Account
                </button>
              </div>
            )}

            {/* Tester Account Multi-Bot Swarm Commander */}
            {(currentUser?.isTester || currentUser?.username?.toUpperCase() === 'TESTER') && (
              <TesterSwarmCommander
                currentUser={currentUser}
                token={localStorage.getItem('ninimo_token') || ''}
                bots={bots}
                onRefresh={refreshBots}
              />
            )}

            {/* Bot Profiles Carousel / Selector */}
            <BotList
              bots={bots}
              selectedBotId={activeBot?.id || null}
              globalBotLimit={globalBotLimit}
              onSelectBot={(id) => setSelectedBotId(id)}
              onStartBot={handleStartBot}
              onStopBot={handleStopBot}
              onAddNewBot={() => {
                if (bots.length >= globalBotLimit) {
                  showToast(`Limit: Maximum ${globalBotLimit} bot(s) allowed per account. Edit your active bot to modify settings.`);
                  return;
                }
                setEditingBot(null);
                setIsModalOpen(true);
              }}
            />

            {/* Mobile Navigation Tabs */}
            <div className="flex md:hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-1 text-xs">
              <button
                onClick={() => setActiveMobileTab('hud_chat')}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                  activeMobileTab === 'hud_chat'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400'
                }`}
              >
                HUD & Chat
              </button>
              <button
                onClick={() => setActiveMobileTab('anti_afk')}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                  activeMobileTab === 'anti_afk'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400'
                }`}
              >
                Anti-AFK
              </button>
              <button
                onClick={() => setActiveMobileTab('settings')}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                  activeMobileTab === 'settings'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400'
                }`}
              >
                Server & Join
              </button>
            </div>

            {/* Active Bot Main Dashboard View */}
            {activeBot ? (
              <div className="space-y-6">
                {/* Top Bot HUD */}
                <div className={`${activeMobileTab === 'hud_chat' || 'hidden md:block'}`}>
                  <BotHud
                    bot={activeBot}
                    onStart={handleStartBot}
                    onStop={handleStopBot}
                    onRestart={handleRestartBot}
                    onEdit={(b) => {
                      setEditingBot(b);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDeleteBot}
                    onToggleAntiAfk={handleToggleAntiAfk}
                    isAdmin={Boolean(currentUser?.isAdmin)}
                    onOpenAdminCamera={() => {
                      setUserCameraBotId(activeBot.id);
                      setIsUserCameraOpen(true);
                    }}
                  />
                </div>

                {/* Split Columns for Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Live Chat & Nearby Players (7 cols) */}
                  <div
                    className={`lg:col-span-7 space-y-6 ${
                      activeMobileTab === 'hud_chat' ? 'block' : 'hidden md:block'
                    }`}
                  >
                    <ChatConsole
                      chatHistory={activeBot.chatHistory}
                      botUsername={activeBot.config.username}
                      isOnline={activeBot.status === 'online'}
                      botStatus={activeBot.status}
                      onSendMessage={handleSendMessage}
                    />

                    <PlayersWidget
                      players={activeBot.playersNearby}
                      botUsername={activeBot.config.username}
                    />
                  </div>

                  {/* Right Column: Anti-AFK & Server Configuration (5 cols) */}
                  <div
                    className={`lg:col-span-5 space-y-6 ${
                      activeMobileTab === 'anti_afk' || activeMobileTab === 'settings'
                        ? 'block'
                        : 'hidden md:block'
                    }`}
                  >
                    {/* Anti AFK Settings */}
                    <div className={`${activeMobileTab === 'settings' ? 'hidden md:block' : 'block'}`}>
                      <AntiAfkCard
                        config={activeBot.config.antiAfk}
                        isOnline={activeBot.status === 'online'}
                        botId={activeBot.id}
                        onUpdateConfig={(updated) => handleSaveBotConfig({ antiAfk: updated })}
                        onTriggerTestMove={handleTriggerTestMove}
                      />
                    </div>

                    {/* Connection & Join Automation Settings */}
                    <div className={`${activeMobileTab === 'anti_afk' ? 'hidden md:block' : 'block'}`}>
                      <ConnectionSettingsCard
                        config={activeBot.config}
                        isOnline={activeBot.status === 'online'}
                        onSaveConfig={handleSaveBotConfig}
                      />
                    </div>

                    {/* 24/7 Hosting Information Card */}
                    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-zinc-300">
                        <Info className="w-4 h-4 text-emerald-400" />
                        <span>Ninimo 24/7 Private Hosting</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">
                        Ninimo runs your Mineflayer bot continuously in the background. The auto-reconnect engine automatically detects kicks, restarts, or timeouts and rejoins with your configured on-join login command. All changes are saved to your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
                <Server className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Bot Profiles in Your Account</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Create your first 24/7 Minecraft bot to connect to cracked or premium servers with anti-AFK movement and live chat.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/60 cursor-pointer"
                >
                  Add First Bot
                </motion.button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal for Creating / Editing Bots */}
      <AnimatePresence>
        {isModalOpen && (
          <BotModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateOrUpdateModal}
            initialBot={editingBot}
          />
        )}
      </AnimatePresence>

      {/* Real Login and Sign Up Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            initialMode={authModalMode}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(user) => {
              setCurrentUser(user);
              setIsAuthModalOpen(false);
              showToast(`Welcome to Ninimo, ${user.username}!`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Admin Bot POV Surveillance Camera Modal */}
      {currentUser?.isAdmin && (
        <AdminBotCameraModal
          isOpen={isUserCameraOpen}
          onClose={() => setIsUserCameraOpen(false)}
          initialBotId={userCameraBotId || activeBot?.id}
          bots={bots.map((b) => ({
            id: b.id,
            name: b.name,
            username: b.config.username,
            host: b.config.host,
            port: b.config.port,
            status: b.status,
          }))}
          token={localStorage.getItem('ninimo_token') || ''}
        />
      )}
    </div>
  );
}

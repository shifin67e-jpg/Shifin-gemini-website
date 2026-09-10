import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { botManager } from './server/botManager.js';
import { authManager } from './server/auth.js';

// Prevent any unhandled network errors (DNS lookup failures, broken pipes, timeouts) from crashing the server
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION GUARD]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION GUARD]:', reason);
});

async function startServer() {
  const app = express();
  // Port resolution: AI Studio sandbox routes strictly to port 3000 via internal proxy.
  // On Railway or standard production hosts, listen dynamically on the assigned process.env.PORT.
  const isAiStudioSandbox = Boolean(process.env.APPLET_ID || process.env.CONTROL_PLANE_PORT);
  const PORT = isAiStudioSandbox
    ? (Number(process.env.DEFAULT_APP_PORT) || 3000)
    : (Number(process.env.PORT) || 3000);

  app.use(express.json());

  // Helper auth extraction
  function getAuthUser(req: express.Request) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : (req.query.token as string | undefined);
    if (!token) return null;
    return authManager.getUserFromToken(token);
  }

  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    (req as any).user = user;
    next();
  }

  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Administrator access required' });
    }
    (req as any).user = user;
    next();
  }

  function getClientIp(req: express.Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
    const cfIp = req.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string') return cfIp.trim();
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') return realIp.trim();
    return req.socket.remoteAddress || 'unknown';
  }

  function getDeviceId(req: express.Request): string {
    const headerFp = req.headers['x-device-fingerprint'] || req.headers['x-device-id'];
    if (typeof headerFp === 'string' && headerFp.trim().length > 3) {
      return headerFp.trim();
    }
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/ninimo_device_id=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    const ip = getClientIp(req);
    return `ip_${ip.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  // API Health & Public Stats
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', brand: 'Ninimo', time: Date.now() });
  });

  app.get('/api/stats/public', (req, res) => {
    const stats = botManager.getPlatformPublicStats();
    res.json(stats);
  });

  // Auth Routes
  app.post('/api/auth/signup', (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }
      const clientIp = getClientIp(req);
      const deviceId = getDeviceId(req);
      const result = authManager.createUser(username, email, password, clientIp, deviceId);
      // Ensure user has their isolated default bot ready
      botManager.getUserBots(result.user.id, deviceId, clientIp, result.user.isAdmin);
      botManager.broadcastPublicStats();
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create user' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'Username/email and password are required' });
      }
      const clientIp = getClientIp(req);
      const deviceId = getDeviceId(req);
      const result = authManager.login(usernameOrEmail, password, clientIp, deviceId);
      // Ensure user has their isolated default bot ready
      botManager.getUserBots(result.user.id, deviceId, clientIp, result.user.isAdmin);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Login failed' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }
    res.json({ user });
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
      authManager.invalidateSession(token);
    }
    res.json({ success: true });
  });

  app.post('/api/auth/restore-session', (req, res) => {
    try {
      const { token, user } = req.body;
      if (!token || !user) {
        return res.status(400).json({ error: 'Token and user required' });
      }
      const result = authManager.restoreSessionAndUser(token, user);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to restore session' });
    }
  });

  // User-isolated bot management routes
  app.get('/api/bots', requireAuth, (req, res) => {
    const user = (req as any).user;
    const deviceId = getDeviceId(req);
    const clientIp = getClientIp(req);
    res.json({ bots: botManager.getUserBots(user.id, deviceId, clientIp, user.isAdmin) });
  });

  app.post('/api/bots/sync', requireAuth, (req, res) => {
    try {
      const user = (req as any).user;
      const deviceId = getDeviceId(req);
      const clientIp = getClientIp(req);
      const clientBots = req.body?.bots || [];
      const updatedBots = botManager.syncUserBots(user.id, clientBots, deviceId, clientIp);
      res.json({ bots: updatedBots });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to sync bots' });
    }
  });

  // Heartbeat ping route to keep connection alive and prevent cloud idle timeout
  app.post('/api/ping', (req, res) => {
    res.json({ pong: true, time: Date.now() });
  });

  app.get('/api/bots/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const bot = botManager.getUserBot(user.id, req.params.id);
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    res.json({ bot: bot.getState() });
  });

  app.post('/api/bots', requireAuth, (req, res) => {
    try {
      const user = (req as any).user;
      const deviceId = getDeviceId(req);
      const clientIp = getClientIp(req);
      const newBot = botManager.createBot(user.id, deviceId, clientIp, req.body, user.isAdmin);
      res.status(201).json({ bot: newBot });
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  app.put('/api/bots/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const updated = botManager.updateBot(user.id, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Bot not found or unauthorized' });
    }
    res.json({ bot: updated });
  });

  app.delete('/api/bots/:id', requireAuth, (req, res) => {
    const user = (req as any).user;
    const ok = botManager.deleteBot(user.id, req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Bot not found or unauthorized' });
    }
    res.json({ success: true });
  });

  app.post('/api/bots/:id/start', requireAuth, (req, res) => {
    try {
      const user = (req as any).user;
      const deviceId = getDeviceId(req);
      const clientIp = getClientIp(req);
      const ok = botManager.startBot(user.id, req.params.id, clientIp, deviceId, user.isAdmin);
      if (!ok) {
        return res.status(404).json({ error: 'Bot not found or unauthorized' });
      }
      res.json({ success: true, message: 'Bot starting' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Cannot activate bot' });
    }
  });

  app.post('/api/bots/:id/stop', requireAuth, (req, res) => {
    const user = (req as any).user;
    const ok = botManager.stopBot(user.id, req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Bot not found or unauthorized' });
    }
    res.json({ success: true, message: 'Bot stopped' });
  });

  app.post('/api/bots/:id/restart', requireAuth, (req, res) => {
    const user = (req as any).user;
    const ok = botManager.restartBot(user.id, req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Bot not found or unauthorized' });
    }
    res.json({ success: true, message: 'Bot restarting' });
  });

  app.post('/api/bots/:id/chat', requireAuth, (req, res) => {
    const user = (req as any).user;
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    const ok = botManager.sendChat(user.id, req.params.id, message);
    if (!ok) {
      return res.status(400).json({ error: 'Failed to send chat message' });
    }
    res.json({ success: true });
  });

  app.get('/api/stats', requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json(botManager.getUserStats(user.id));
  });

  // Public/User settings
  app.get('/api/settings', (req, res) => {
    res.json({
      globalBotLimit: botManager.getGlobalBotLimit(),
    });
  });

  // --- ADMIN ROUTES ---
  // Admin: Get all accounts and their bots
  app.get('/api/admin/accounts', requireAdmin, (req, res) => {
    const allUsers = authManager.getAllUsers();
    const accounts = allUsers.map((u) => {
      const userBots = botManager.getBotsByUserId(u.id);
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin,
        registrationIp: u.registrationIp,
        deviceFingerprint: u.deviceFingerprint,
        createdAt: u.createdAt,
        botCount: userBots.length,
        bots: userBots.map((b) => ({
          id: b.id,
          name: b.config.name,
          username: b.config.username,
          host: b.config.host,
          port: b.config.port,
          status: b.status,
          uptimeSeconds: b.uptimeSeconds,
        })),
      };
    });
    res.json({
      accounts,
      globalBotLimit: botManager.getGlobalBotLimit(),
    });
  });

  // Admin: Impersonate / switch directly to any account
  app.post('/api/admin/impersonate', requireAdmin, (req, res) => {
    try {
      const admin = (req as any).user;
      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ error: 'targetUserId is required' });
      }
      const impersonated = authManager.impersonateUser(admin.id, targetUserId);
      res.json(impersonated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to switch to user account' });
    }
  });

  // Admin: Update global bot limit for all accounts
  app.post('/api/admin/settings', requireAdmin, (req, res) => {
    const { globalBotLimit } = req.body;
    if (typeof globalBotLimit !== 'number' || globalBotLimit < 1) {
      return res.status(400).json({ error: 'globalBotLimit must be a number of at least 1' });
    }
    const updatedLimit = botManager.setGlobalBotLimit(globalBotLimit);
    res.json({
      globalBotLimit: updatedLimit,
      success: true,
      message: `Global bot limit updated to ${updatedLimit}`,
    });
  });

  // Admin: List all bots in the system
  app.get('/api/admin/bots', requireAdmin, (req, res) => {
    res.json({ bots: botManager.getAllBotsAdmin() });
  });

  // Admin: Start any bot
  app.post('/api/admin/bots/:id/start', requireAdmin, (req, res) => {
    const ok = botManager.adminStartBot(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Bot not found' });
    res.json({ success: true, message: 'Bot started by admin' });
  });

  // Admin: Stop any bot
  app.post('/api/admin/bots/:id/stop', requireAdmin, (req, res) => {
    const ok = botManager.adminStopBot(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Bot not found' });
    res.json({ success: true, message: 'Bot stopped by admin' });
  });

  // Admin: Delete any bot
  app.delete('/api/admin/bots/:id', requireAdmin, (req, res) => {
    const ok = botManager.adminDeleteBot(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Bot not found' });
    res.json({ success: true, message: 'Bot deleted by admin' });
  });

  // User-isolated Server-Sent Events (SSE) stream
  app.get('/api/events', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized SSE connection' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const deviceId = getDeviceId(req);
    // Send initial snapshot for this specific user
    const initialData = JSON.stringify({
      event: 'initial_state',
      data: {
        bots: botManager.getUserBots(user.id, deviceId),
        stats: botManager.getUserStats(user.id),
        globalBotLimit: botManager.getGlobalBotLimit(),
      },
      timestamp: Date.now(),
    });
    res.write(`data: ${initialData}\n\n`);

    // Listener for broadcasts strictly for this user
    const onEvent = (payload: any) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    botManager.addSseClient(user.id, onEvent);

    // Keepalive ping every 25s
    const pingInterval = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(pingInterval);
      botManager.removeSseClient(user.id, onEvent);
      res.end();
    });
  });

  // Public real-time platform stats SSE stream for landing & guest page
  app.get('/api/events/public', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const stats = botManager.getPlatformPublicStats();
    const initialData = JSON.stringify({
      event: 'initial_public_state',
      data: stats,
      timestamp: Date.now(),
    });
    res.write(`data: ${initialData}\n\n`);

    const onPublicEvent = (payload: any) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    botManager.addPublicSseClient(onPublicEvent);

    const pingInterval = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(pingInterval);
      botManager.removePublicSseClient(onPublicEvent);
      res.end();
    });
  });

  // Vite middleware setup (development mode in AI Studio) vs static files (production / Railway)
  const isDev = Boolean(process.env.APPLET_ID && process.env.NODE_ENV !== 'production');
  const distPath = path.join(process.cwd(), 'dist');

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Railway or production: serve pre-compiled frontend assets
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).send('Building application assets, please refresh in a moment...');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ninimo 24/7 server running on http://0.0.0.0:${PORT}`);
    
    // Server-wide memory watchdog: prevents Cloud Run container OOM kills
    setInterval(() => {
      try {
        const mem = process.memoryUsage();
        const rssMb = Math.round(mem.rss / 1024 / 1024);
        const heapMb = Math.round(mem.heapUsed / 1024 / 1024);
        if (rssMb > 250 || heapMb > 180) {
          console.log(`[RAM WATCHDOG] Memory at RSS: ${rssMb}MB, Heap: ${heapMb}MB. Running memory sweep...`);
          if ((global as any).gc) {
            try { (global as any).gc(); } catch {}
          }
        }
      } catch {}
    }, 30000);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

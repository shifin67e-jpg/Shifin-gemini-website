import path from 'path';
import fs from 'fs';
import http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { BotManager } from './botManager.js';
import { authManager } from './auth.js';

export function setupBotViewer(
  app: express.Application,
  server: http.Server,
  botManager: BotManager
) {
  const pvPublicDir = path.join(process.cwd(), 'node_modules/prismarine-viewer/public');

  // Socket.IO Server attached with custom internal path
  const io = new SocketIOServer(server, {
    path: '/bot-viewer-socket.io',
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
  });

  // Intercept socket.io HTTP requests before Express
  server.on('request', (req, res) => {
    if (req.url && req.url.includes('/admin-pov/') && req.url.includes('/socket.io')) {
      const match = req.url.match(/\/admin-pov\/([^/]+)\/socket\.io(\/.*)?/);
      if (match) {
        const botId = match[1];
        const subpath = match[2] || '';
        const sep = req.url.includes('?') ? '&' : '?';
        req.url = `/bot-viewer-socket.io${subpath}` + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '') + `${sep}botId=${encodeURIComponent(botId)}`;
      }
    }
  });

  // Intercept WebSocket upgrade requests for socket.io
  server.on('upgrade', (req, socket, head) => {
    if (req.url && req.url.includes('/admin-pov/') && req.url.includes('/socket.io')) {
      const match = req.url.match(/\/admin-pov\/([^/]+)\/socket\.io(\/.*)?/);
      if (match) {
        const botId = match[1];
        const subpath = match[2] || '';
        const sep = req.url.includes('?') ? '&' : '?';
        req.url = `/bot-viewer-socket.io${subpath}` + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '') + `${sep}botId=${encodeURIComponent(botId)}`;
      }
    }
  });

  // Helper to extract and verify admin user from request
  function verifyAdminRequest(req: express.Request): boolean {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : (req.query.token as string | undefined) ||
        (req.headers.cookie?.match(/admin_token=([^;]+)/)?.[1]);

    if (!token) return false;
    const user = authManager.getUserFromToken(token);
    return Boolean(user && user.isAdmin);
  }

  // Admin Bot POV HTML Page
  app.get('/admin-pov/:botId', (req, res) => {
    // Ensure trailing slash for relative asset resolution (index.js, worker.js)
    if (!req.path.endsWith('/')) {
      const queryStr = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      return res.redirect(301, `/admin-pov/${encodeURIComponent(req.params.botId)}/${queryStr}`);
    }
    serveCameraHtml(req, res);
  });

  app.get('/admin-pov/:botId/', (req, res) => {
    serveCameraHtml(req, res);
  });

  function serveCameraHtml(req: express.Request, res: express.Response) {
    const { botId } = req.params;
    const isAdmin = verifyAdminRequest(req);

    if (!isAdmin) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Access Denied • Admin Bot POV</title>
          <style>
            body {
              background: #09090b;
              color: #ef4444;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .card {
              background: #18181b;
              border: 1px solid #7f1d1d;
              padding: 32px 48px;
              border-radius: 16px;
              max-width: 480px;
              box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
            }
            h1 { font-size: 18px; margin-bottom: 8px; color: #f87171; }
            p { font-size: 13px; color: #a1a1aa; line-height: 1.6; }
            .badge {
              display: inline-block;
              background: #450a0a;
              color: #fca5a5;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 16px;
              border: 1px solid #991b1b;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">SECURITY RESTRICTION</div>
            <h1>ADMIN CLEARANCE REQUIRED</h1>
            <p>Access to live Prismarine bot first-person perspective camera feeds is strictly restricted to platform administrators.</p>
          </div>
        </body>
        </html>
      `);
    }

    const botInstance = botManager.getBot(botId);
    if (!botInstance) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Bot Not Found • Ninimo Camera</title>
          <style>
            body { background: #09090b; color: #e4e4e7; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #18181b; border: 1px solid #27272a; padding: 32px; border-radius: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2 style="color: #fbbf24;">Bot Instance Not Found</h2>
            <p style="color: #71717a; font-size: 13px;">No active bot with ID "${botId}" exists in the fleet.</p>
          </div>
        </body>
        </html>
      `);
    }

    const token = (req.query.token as string) || '';
    if (token) {
      res.cookie('admin_token', token, {
        path: `/admin-pov/`,
        maxAge: 86400000,
        sameSite: 'lax',
      });
    }

    const botName = botInstance.config.name || botInstance.config.username;
    const botUser = botInstance.config.username;
    const serverHost = `${botInstance.config.host}:${botInstance.config.port}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CAM • ${escapeHtml(botName)} [${escapeHtml(botUser)}]</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
      color: #e4e4e7;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    
    /* 3D Canvas element created by prismarine-viewer */
    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      z-index: 1;
      outline: none;
    }

    /* Surveillance Camera HUD Overlay Layer */
    .hud-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16px;
    }

    .interactive {
      pointer-events: auto;
    }

    /* Scanline & CRT Vignette FX */
    .crt-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
      background-size: 100% 3px, 6px 100%;
      opacity: 0.6;
    }

    .night-vision {
      filter: contrast(140%) brightness(120%) sepia(100%) hue-rotate(85deg) saturate(280%);
    }

    /* Top HUD Bar */
    .top-bar {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
    }

    .cam-tag {
      background: rgba(10, 10, 12, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .rec-dot {
      width: 10px;
      height: 10px;
      background: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 8px #ef4444;
      animation: blink 1.2s infinite ease-in-out;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.2; transform: scale(0.85); }
    }

    .cam-title {
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.5px;
      color: #fff;
    }

    .cam-sub {
      font-size: 11px;
      color: #a1a1aa;
    }

    .top-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }

    .time-badge {
      background: rgba(10, 10, 12, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      color: #34d399;
    }

    /* Center Crosshair / Targeting Reticle */
    .crosshair-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 6;
      opacity: 0.75;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
    }

    .reticle-center {
      width: 6px;
      height: 6px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
    }

    .reticle-bracket {
      position: absolute;
      border: 2px solid rgba(52, 211, 153, 0.8);
      width: 14px;
      height: 14px;
    }
    .reticle-bracket.tl { top: 0; left: 0; border-right: 0; border-bottom: 0; }
    .reticle-bracket.tr { top: 0; right: 0; border-left: 0; border-bottom: 0; }
    .reticle-bracket.bl { bottom: 0; left: 0; border-right: 0; border-top: 0; }
    .reticle-bracket.br { bottom: 0; right: 0; border-left: 0; border-top: 0; }

    /* Bottom HUD Bar */
    .bottom-bar {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .telemetry-strip {
      background: rgba(10, 10, 12, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 10px 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 11px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
    }

    .tele-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tele-label {
      color: #71717a;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
    }

    .tele-val {
      font-weight: 700;
      color: #f4f4f5;
    }

    .tele-val.accent {
      color: #38bdf8;
    }
    .tele-val.green {
      color: #4ade80;
    }

    /* Controls Bar */
    .controls-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .hud-btn {
      background: rgba(24, 24, 27, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 6px 12px;
      color: #e4e4e7;
      font-size: 11px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .hud-btn:hover {
      background: rgba(39, 39, 42, 0.95);
      border-color: rgba(255, 255, 255, 0.3);
      color: #fff;
    }

    .hud-btn.active {
      background: #059669;
      border-color: #10b981;
      color: #fff;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
    }

    /* Connecting / Offline Radar Splash */
    .connecting-card {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(18, 18, 22, 0.9);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 24px 32px;
      text-align: center;
      z-index: 20;
      display: none;
      box-shadow: 0 20px 30px rgba(0, 0, 0, 0.8);
      max-width: 360px;
      pointer-events: auto;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(52, 211, 153, 0.2);
      border-top-color: #34d399;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body id="camera-body">
  <div class="crt-overlay" id="crt-overlay"></div>

  <!-- Central Camera Reticle -->
  <div class="crosshair-container" id="crosshair-el">
    <div class="reticle-bracket tl"></div>
    <div class="reticle-bracket tr"></div>
    <div class="reticle-bracket bl"></div>
    <div class="reticle-bracket br"></div>
    <div class="reticle-center"></div>
  </div>

  <!-- Top and Bottom HUD Elements -->
  <div class="hud-layer" id="hud-layer">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="cam-tag">
        <div class="rec-dot"></div>
        <div>
          <div class="cam-title">BOT POV • ${escapeHtml(botName)}</div>
          <div class="cam-sub">PRISMARINE 3D FEED // ${escapeHtml(serverHost)}</div>
        </div>
      </div>

      <div class="top-right">
        <div class="time-badge" id="utc-clock">00:00:00 UTC</div>
        <div class="interactive" style="display:flex; gap:6px;">
          <button class="hud-btn" id="btn-night-vision" title="Toggle Night Vision / CCTV filter">
            <span>NVG</span>
          </button>
          <button class="hud-btn" id="btn-fullscreen" title="Toggle Fullscreen">
            <span>⛶ FULLSCREEN</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Center Connecting Overlay if not in world yet -->
    <div class="connecting-card" id="connecting-card">
      <div class="spinner"></div>
      <h3 style="font-size:14px; font-weight:800; color:#fff; margin-bottom:6px;">ACQUIRING SATELLITE CHUNKS</h3>
      <p style="font-size:11px; color:#a1a1aa; line-height:1.5;">
        Awaiting bot spawn in <span style="color:#38bdf8;">${escapeHtml(serverHost)}</span>.<br>
        Rendering live chunks once world packets stream.
      </p>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <!-- Live Bot Telemetry -->
      <div class="telemetry-strip">
        <div class="tele-item">
          <span class="tele-label">POS</span>
          <span class="tele-val accent" id="val-pos">X: 0.0  Y: 0.0  Z: 0.0</span>
        </div>
        <div class="tele-item">
          <span class="tele-label">FACING</span>
          <span class="tele-val" id="val-facing">0.0° / 0.0°</span>
        </div>
        <div class="tele-item">
          <span class="tele-label">DIM</span>
          <span class="tele-val" id="val-dim">OVERWORLD</span>
        </div>
        <div class="tele-item">
          <span class="tele-label">HEALTH</span>
          <span class="tele-val green" id="val-hp">20 / 20 ❤</span>
        </div>
        <div class="tele-item">
          <span class="tele-label">FOOD</span>
          <span class="tele-val" id="val-food" style="color:#f59e0b;">20 / 20 🍖</span>
        </div>
        <div class="tele-item">
          <span class="tele-label">STATUS</span>
          <span class="tele-val green" id="val-status">ONLINE</span>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="controls-strip interactive">
        <div style="display:flex; gap:6px;">
          <button class="hud-btn active" id="btn-first-person">
            <span>🎥 1ST PERSON (EYES)</span>
          </button>
          <button class="hud-btn" id="btn-toggle-hud">
            <span>HUD: ON</span>
          </button>
        </div>
        <div style="font-size:10px; color:#71717a; text-transform:uppercase; letter-spacing:0.5px;">
          PrismarineJS WebGL Engine • Ninimo 24/7
        </div>
      </div>
    </div>
  </div>

  <!-- Prismarine Viewer Client Bundle (Served from node_modules/prismarine-viewer/public/index.js) -->
  <script type="text/javascript" src="index.js"></script>

  <script>
    (function() {
      // Clock updater
      const clockEl = document.getElementById('utc-clock');
      function updateClock() {
        const now = new Date();
        clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
      }
      setInterval(updateClock, 1000);
      updateClock();

      // UI Toggles
      const body = document.getElementById('camera-body');
      const nvBtn = document.getElementById('btn-night-vision');
      let isNv = false;
      nvBtn.addEventListener('click', () => {
        isNv = !isNv;
        body.classList.toggle('night-vision', isNv);
        nvBtn.classList.toggle('active', isNv);
      });

      const fsBtn = document.getElementById('btn-fullscreen');
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });

      const hudToggleBtn = document.getElementById('btn-toggle-hud');
      const hudLayer = document.getElementById('hud-layer');
      const crosshairEl = document.getElementById('crosshair-el');
      let hudVisible = true;
      hudToggleBtn.addEventListener('click', () => {
        hudVisible = !hudVisible;
        crosshairEl.style.display = hudVisible ? 'flex' : 'none';
        hudToggleBtn.textContent = hudVisible ? 'HUD: ON' : 'HUD: OFF';
      });

      // Poll telemetry via API for smooth HUD numbers
      const posEl = document.getElementById('val-pos');
      const facingEl = document.getElementById('val-facing');
      const dimEl = document.getElementById('val-dim');
      const hpEl = document.getElementById('val-hp');
      const foodEl = document.getElementById('val-food');
      const statusEl = document.getElementById('val-status');
      const connectingCard = document.getElementById('connecting-card');

      async function refreshTelemetry() {
        try {
          const res = await fetch('/api/admin/bots/${encodeURIComponent(botId)}/telemetry');
          if (!res.ok) return;
          const data = await res.json();
          if (data && data.bot) {
            const b = data.bot;
            const p = b.position || { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 };
            posEl.textContent = 'X: ' + (p.x || 0).toFixed(1) + '  Y: ' + (p.y || 0).toFixed(1) + '  Z: ' + (p.z || 0).toFixed(1);
            
            const yawDeg = ((p.yaw || 0) * (180 / Math.PI)).toFixed(0);
            const pitchDeg = ((p.pitch || 0) * (180 / Math.PI)).toFixed(0);
            facingEl.textContent = yawDeg + '° / ' + pitchDeg + '°';
            
            dimEl.textContent = (b.dimension || 'OVERWORLD').toUpperCase();
            hpEl.textContent = (b.health ?? 20) + ' / 20 ❤';
            foodEl.textContent = (b.food ?? 20) + ' / 20 🍖';
            statusEl.textContent = (b.status || 'UNKNOWN').toUpperCase();

            // Show connecting splash if not in world
            if (b.status !== 'online') {
              connectingCard.style.display = 'block';
            } else {
              connectingCard.style.display = 'none';
            }
          }
        } catch (e) {}
      }

      setInterval(refreshTelemetry, 1000);
      refreshTelemetry();
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  // Telemetry endpoint for the HUD
  app.get('/api/admin/bots/:botId/telemetry', (req, res) => {
    if (!verifyAdminRequest(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const bot = botManager.getBot(req.params.botId);
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    res.json({
      bot: bot.getState(),
    });
  });

  // Serve static assets for the viewer from prismarine-viewer's public folder
  app.use('/admin-pov/:botId/', express.static(pvPublicDir));

  // Socket.IO bot stream connection
  io.on('connection', (socket) => {
    const query = socket.handshake.query;
    const botId = query.botId as string;
    const token = (query.token as string) || (socket.handshake.auth?.token as string);

    // Auth verification
    const user = token ? authManager.getUserFromToken(token) : null;
    const isAllowed = user && user.isAdmin;

    // Also check cookies if token not explicitly in query
    const cookieToken = socket.handshake.headers.cookie?.match(/admin_token=([^;]+)/)?.[1];
    const cookieUser = cookieToken ? authManager.getUserFromToken(cookieToken) : null;
    const isCookieAllowed = cookieUser && cookieUser.isAdmin;

    if (!isAllowed && !isCookieAllowed) {
      console.warn(`[PRISMARINE VIEWER] Unauthorized connection attempt to bot POV: ${botId}`);
      socket.disconnect(true);
      return;
    }

    const botInstance = botManager.getBot(botId);
    if (!botInstance) {
      console.warn(`[PRISMARINE VIEWER] Bot ${botId} not found for live stream`);
      socket.disconnect(true);
      return;
    }

    const rawBot = botInstance.getMineflayerBot();
    const version = (rawBot && rawBot.version) ? rawBot.version : '1.16.4';

    socket.emit('version', version);

    // If Mineflayer bot is running in-world, attach Prismarine WorldView
    if (rawBot && rawBot.world && rawBot.entity) {
      attachWorldView(rawBot, socket);
    } else if (rawBot) {
      // Bot is currently connecting or queueing, wait for spawn event
      const onSpawn = () => {
        if (rawBot.world && rawBot.entity) {
          attachWorldView(rawBot, socket);
        }
      };
      rawBot.once('spawn', onSpawn);

      socket.on('disconnect', () => {
        rawBot.removeListener('spawn', onSpawn);
      });
    } else {
      // Simulation mode or stopped: stream position updates from BotInstance state
      const sendSimPosition = () => {
        const p = botInstance.position;
        socket.emit('position', {
          pos: { x: p.x, y: p.y, z: p.z },
          yaw: p.yaw,
          pitch: p.pitch,
          addMesh: false,
        });
      };
      sendSimPosition();
      const simTimer = setInterval(sendSimPosition, 200);

      socket.on('disconnect', () => {
        clearInterval(simTimer);
      });
    }
  });

  function attachWorldView(rawBot: any, socket: any) {
    try {
      const { WorldView } = require('prismarine-viewer/viewer');
      const viewDistance = 4; // Low memory footprint view distance for container stability

      const worldView = new WorldView(rawBot.world, viewDistance, rawBot.entity.position, socket);
      worldView.init(rawBot.entity.position);
      worldView.listenToBot(rawBot);

      function botPosition() {
        if (!rawBot.entity) return;
        const packet = {
          pos: rawBot.entity.position,
          yaw: rawBot.entity.yaw,
          pitch: rawBot.entity.pitch,
          addMesh: false, // 1st person POV camera
        };
        socket.emit('position', packet);
        worldView.updatePosition(rawBot.entity.position);
      }

      rawBot.on('move', botPosition);
      botPosition();

      socket.on('disconnect', () => {
        try {
          rawBot.removeListener('move', botPosition);
          worldView.removeListenersFromBot(rawBot);
        } catch {}
      });
    } catch (err) {
      console.error('[PRISMARINE VIEWER ATTACH ERROR]:', err);
    }
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

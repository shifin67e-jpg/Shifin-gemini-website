import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { Sparkles, MessageSquare } from 'lucide-react';

interface GeminiBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

interface DragPhysics {
  isDragging: boolean;
  distance: number;
  angleDeg: number;
  stretchRatio: number;
  tetherActive: boolean;
  anchor: { x: number; y: number } | null;
  current: { x: number; y: number } | null;
}

interface SnapParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const SNAP_DISTANCE = 145; // Pixels until the slime tether snaps

export const GeminiBubble: React.FC<GeminiBubbleProps> = ({ onClick, isOpen }) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  const [dockedSide, setDockedSide] = useState<'right' | 'left'>('right');
  const [isHovered, setIsHovered] = useState(false);
  const [isSquishing, setIsSquishing] = useState(false);
  const [snapParticles, setSnapParticles] = useState<SnapParticle[]>([]);

  // Real-time drag & slime physics state
  const [physics, setPhysics] = useState<DragPhysics>({
    isDragging: false,
    distance: 0,
    angleDeg: 0,
    stretchRatio: 0,
    tetherActive: false,
    anchor: null,
    current: null,
  });

  const hasSnappedRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Snap/dock the bubble to an edge with bouncy viscous spring
  const snapToDock = useCallback(
    (side: 'left' | 'right', triggerSquish: boolean = false) => {
      if (!constraintsRef.current || !bubbleRef.current) return;
      const containerRect = constraintsRef.current.getBoundingClientRect();
      const bubbleRect = bubbleRef.current.getBoundingClientRect();

      // targetX relative to the initial position (right: 0)
      const targetX = side === 'right' ? 0 : -(containerRect.width - bubbleRect.width);

      controls.start({
        x: targetX,
        transition: {
          type: 'spring',
          damping: 14,
          stiffness: 220,
          mass: 0.85,
        },
      });

      setDockedSide(side);

      if (triggerSquish) {
        setIsSquishing(true);
        setTimeout(() => setIsSquishing(false), 700);
      }
    },
    [controls]
  );

  useEffect(() => {
    const handleResize = () => {
      snapToDock(dockedSide, false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dockedSide, snapToDock]);

  const handlePointerDown = (e: React.PointerEvent) => {
    hasDraggedRef.current = false;
    hasSnappedRef.current = false;
    dragStartCoordRef.current = { x: e.clientX, y: e.clientY };

    if (!constraintsRef.current || !bubbleRef.current) return;
    const containerRect = constraintsRef.current.getBoundingClientRect();
    const bubbleRect = bubbleRef.current.getBoundingClientRect();

    const currentCenterX = bubbleRect.left + bubbleRect.width / 2 - containerRect.left;
    const currentCenterY = bubbleRect.top + bubbleRect.height / 2 - containerRect.top;

    // The anchor where the slime was glued to the wall
    const anchorX = dockedSide === 'right' ? containerRect.width : 0;
    const anchorY = currentCenterY;

    setPhysics({
      isDragging: false,
      distance: 0,
      angleDeg: 0,
      stretchRatio: 0,
      tetherActive: true,
      anchor: { x: anchorX, y: anchorY },
      current: { x: currentCenterX, y: currentCenterY },
    });
  };

  const handleDragStart = () => {
    hasDraggedRef.current = true;
    setPhysics((prev) => ({ ...prev, isDragging: true }));
  };

  const handleDrag = () => {
    if (!constraintsRef.current || !bubbleRef.current) return;
    const containerRect = constraintsRef.current.getBoundingClientRect();
    const bubbleRect = bubbleRef.current.getBoundingClientRect();

    const currentCenterX = bubbleRect.left + bubbleRect.width / 2 - containerRect.left;
    const currentCenterY = bubbleRect.top + bubbleRect.height / 2 - containerRect.top;

    setPhysics((prev) => {
      if (!prev.anchor) return prev;

      const dx = currentCenterX - prev.anchor.x;
      const dy = currentCenterY - prev.anchor.y;
      const dist = Math.hypot(dx, dy);
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = (angleRad * 180) / Math.PI;

      // Check if tether snaps
      if (dist >= SNAP_DISTANCE && !hasSnappedRef.current) {
        hasSnappedRef.current = true;

        // Spawn snap droplet splatter
        const particles: SnapParticle[] = Array.from({ length: 7 }).map((_, i) => ({
          id: Date.now() + i,
          x: prev.anchor!.x + dx * 0.6 + (Math.random() - 0.5) * 15,
          y: prev.anchor!.y + dy * 0.6 + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          size: Math.random() * 3 + 2,
        }));
        setSnapParticles(particles);
        setTimeout(() => setSnapParticles([]), 550);

        return {
          ...prev,
          isDragging: true,
          distance: dist,
          angleDeg,
          stretchRatio: 0,
          tetherActive: false,
          current: { x: currentCenterX, y: currentCenterY },
        };
      }

      if (hasSnappedRef.current) {
        return {
          ...prev,
          isDragging: true,
          distance: dist,
          angleDeg,
          stretchRatio: 0,
          tetherActive: false,
          current: { x: currentCenterX, y: currentCenterY },
        };
      }

      return {
        ...prev,
        isDragging: true,
        distance: dist,
        angleDeg,
        stretchRatio: Math.min(1, dist / SNAP_DISTANCE),
        tetherActive: true,
        current: { x: currentCenterX, y: currentCenterY },
      };
    });
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number }; offset: { x: number; y: number } }
  ) => {
    const wasTethered = physics.tetherActive && !hasSnappedRef.current;

    // Reset physics state
    setPhysics({
      isDragging: false,
      distance: 0,
      angleDeg: 0,
      stretchRatio: 0,
      tetherActive: false,
      anchor: null,
      current: null,
    });

    if (!constraintsRef.current) return;

    if (wasTethered) {
      // Elastic recoil: if tether did not break, pull right back to where it was glued!
      snapToDock(dockedSide, true);
    } else {
      // If tether broke, find nearest wall
      const containerRect = constraintsRef.current.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const releaseX = info.point.x;
      const newDockSide: 'left' | 'right' = releaseX < containerCenterX ? 'left' : 'right';
      snapToDock(newDockSide, true);
    }
  };

  const handleTap = () => {
    const dx = Math.abs(window.event && 'clientX' in window.event ? (window.event as any).clientX - dragStartCoordRef.current.x : 0);
    const dy = Math.abs(window.event && 'clientY' in window.event ? (window.event as any).clientY - dragStartCoordRef.current.y : 0);

    if (!hasDraggedRef.current || (dx < 6 && dy < 6)) {
      onClick();
    }
  };

  // Helper to construct organic SVG slime bridge path
  const renderSlimeTether = () => {
    if (!physics.tetherActive || !physics.anchor || !physics.current || physics.distance < 8) {
      return null;
    }

    const { anchor, current, distance, stretchRatio } = physics;
    const dx = current.x - anchor.x;
    const dy = current.y - anchor.y;
    const angle = Math.atan2(dy, dx);

    // Normal vector perpendicular to the pull line
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);

    // Slime thickness scales down as you stretch it
    const baseWallR = Math.max(5, 30 * (1 - stretchRatio * 0.65));
    const baseBubbleR = Math.max(7, 26 * (1 - stretchRatio * 0.65));
    const waistR = Math.max(2, 16 * Math.pow(1 - stretchRatio, 1.8));

    // Points at the wall anchor
    const p0a = { x: anchor.x + nx * baseWallR, y: anchor.y + ny * baseWallR };
    const p0b = { x: anchor.x - nx * baseWallR, y: anchor.y - ny * baseWallR };

    // Points at the bubble perimeter
    const p1a = { x: current.x + nx * baseBubbleR, y: current.y + ny * baseBubbleR };
    const p1b = { x: current.x - nx * baseBubbleR, y: current.y - ny * baseBubbleR };

    // Middle control points pinched inward
    const midX = (anchor.x + current.x) / 2;
    const midY = (anchor.y + current.y) / 2;
    const ctlA = { x: midX + nx * waistR, y: midY + ny * waistR };
    const ctlB = { x: midX - nx * waistR, y: midY - ny * waistR };

    // SVG path string
    const d = `M ${p0a.x} ${p0a.y} Q ${ctlA.x} ${ctlA.y} ${p1a.x} ${p1a.y} L ${p1b.x} ${p1b.y} Q ${ctlB.x} ${ctlB.y} ${p0b.x} ${p0b.y} Z`;

    // Slime droplets along the tether
    const drop1X = anchor.x + dx * 0.35;
    const drop1Y = anchor.y + dy * 0.35;
    const drop1R = Math.max(1.5, 3.5 * (1 - stretchRatio * 0.5));

    const drop2X = anchor.x + dx * 0.68;
    const drop2Y = anchor.y + dy * 0.68;
    const drop2R = Math.max(1, 2.5 * (1 - stretchRatio * 0.6));

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
        <defs>
          <linearGradient id="slimeTetherGrad" x1={anchor.x} y1={anchor.y} x2={current.x} y2={current.y} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
          </linearGradient>
          <filter id="slimeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Viscous gooey tendon path */}
        <path d={d} fill="url(#slimeTetherGrad)" filter="url(#slimeGlow)" />

        {/* Slime Droplet Beads on the string */}
        <circle cx={drop1X} cy={drop1Y} r={drop1R} fill="#6ee7b7" opacity={0.9} />
        <circle cx={drop2X} cy={drop2Y} r={drop2R} fill="#a7f3d0" opacity={0.8} />
      </svg>
    );
  };

  // Compute directional squash & stretch while pulling
  const getDeformationStyle = () => {
    if (isSquishing) {
      return {
        scaleX: [1, 0.65, 1.3, 0.9, 1.06, 1],
        scaleY: [1, 1.4, 0.78, 1.14, 0.95, 1],
        rotate: dockedSide === 'right' ? [0, -12, 10, -5, 0] : [0, 12, -10, 5, 0],
      };
    }

    if (physics.isDragging && physics.tetherActive && physics.stretchRatio > 0) {
      // Elongate along pull vector, squash perpendicularly
      const stretch = 1 + physics.stretchRatio * 0.45;
      const squash = 1 / Math.sqrt(stretch);
      return {
        rotate: physics.angleDeg,
        scaleX: stretch,
        scaleY: squash,
      };
    }

    if (physics.isDragging) {
      // Free drag squish
      return {
        scaleX: 1.15,
        scaleY: 0.88,
        rotate: 0,
      };
    }

    // Default resting blob: flattened on the wall side (the "stuck" feel!)
    return {
      borderRadius:
        dockedSide === 'right'
          ? [
              '48% 20% 20% 50% / 50% 25% 25% 50%',
              '52% 16% 16% 54% / 48% 20% 20% 52%',
              '48% 20% 20% 50% / 50% 25% 25% 50%',
            ]
          : [
              '20% 48% 50% 20% / 25% 50% 50% 25%',
              '16% 52% 54% 16% / 20% 48% 52% 20%',
              '20% 48% 50% 20% / 25% 50% 50% 25%',
            ],
      y: [0, -4, 0],
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
    };
  };

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-3 sm:inset-5 top-16 sm:top-18 pointer-events-none z-40 overflow-hidden"
    >
      {/* Real-Time Slime Tether SVG (Pulls from the wall!) */}
      {renderSlimeTether()}

      {/* Slime Snap Droplet Particles */}
      {snapParticles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
          animate={{
            x: p.x + p.vx,
            y: p.y + p.vy + 20,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] pointer-events-none z-30"
          style={{ width: p.size * 2, height: p.size * 2 }}
        />
      ))}

      {/* Wall Contact Slime Smear / Glue Pad */}
      {!physics.isDragging && (
        <div
          className={`absolute pointer-events-none transition-all duration-300 ${
            dockedSide === 'right'
              ? 'right-0 top-[calc(100%-80px)] w-4 h-16 rounded-l-2xl bg-gradient-to-l from-emerald-500/50 via-emerald-400/30 to-transparent blur-[1.5px]'
              : 'left-0 top-[calc(100%-80px)] w-4 h-16 rounded-r-2xl bg-gradient-to-r from-emerald-500/50 via-emerald-400/30 to-transparent blur-[1.5px]'
          }`}
        />
      )}

      {/* Main Draggable Slime Bubble */}
      <motion.div
        ref={bubbleRef}
        animate={controls}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.16}
        dragMomentum={false}
        whileHover={{ scale: 1.08 }}
        onPointerDown={handlePointerDown}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute bottom-4 right-2 pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none group z-40"
        style={{
          bottom: '16px',
          right: '6px',
        }}
        title="Ninimo Gemini AI • Pull to stretch slime or click to chat!"
      >
        {/* Wall Suction Adhesion Glow */}
        {!physics.isDragging && (
          <motion.div
            animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute -inset-2 bg-gradient-to-r ${
              dockedSide === 'right'
                ? 'from-transparent via-purple-600/30 to-emerald-400/60'
                : 'from-emerald-400/60 via-purple-600/30 to-transparent'
            } rounded-full blur-md pointer-events-none`}
          />
        )}

        {/* Ambient Viscous Slime Aura */}
        <motion.div
          animate={{
            scale: physics.isDragging ? [1.1, 1.25, 1.1] : [1, 1.12, 1],
            opacity: physics.isDragging ? 0.9 : [0.5, 0.8, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: physics.isDragging ? 2 : 6,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-emerald-500/40 via-purple-600/40 to-cyan-400/40 blur-md pointer-events-none"
        />

        {/* Viscous Deforming Slime Body */}
        <motion.div
          animate={getDeformationStyle()}
          transition={
            isSquishing
              ? { duration: 0.7, ease: 'easeOut' }
              : physics.isDragging
              ? { duration: 0.05 }
              : {
                  borderRadius: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                }
          }
          className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500/90 via-indigo-900/95 to-purple-950 p-[2px] shadow-2xl shadow-emerald-950/90 border-2 border-emerald-400/80 overflow-hidden flex items-center justify-center backdrop-blur-md"
        >
          {/* Top Liquid Specular Reflection */}
          <div className="absolute top-1 left-2 w-7 h-3.5 bg-gradient-to-b from-white/70 to-transparent rounded-full blur-[0.6px] -rotate-12 pointer-events-none" />

          {/* Bottom Refraction Sheen */}
          <div className="absolute bottom-1 right-2 w-5 h-2.5 bg-emerald-300/40 rounded-full blur-[1px] pointer-events-none" />

          {/* Internal Glowing Slime Nucleus */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(52,211,153,0.4),transparent_60%)] pointer-events-none" />

          {/* Slime Droplet floating inside */}
          <motion.div
            animate={{
              y: [-2, 3, -2],
              x: [1, -2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_5px_#34d399] pointer-events-none"
          />

          {/* Central AI Icon (Counter-rotated when stretching so it stays upright) */}
          <motion.div
            animate={{
              rotate: physics.isDragging && physics.tetherActive ? -physics.angleDeg : 0,
              scale: physics.isDragging ? [1, 1.1, 1] : [1, 1.05, 1],
            }}
            transition={{ duration: 0.1 }}
            className="relative z-10 flex flex-col items-center justify-center text-white drop-shadow-[0_0_8px_rgba(52,211,153,0.95)] pointer-events-none"
          >
            {isOpen ? (
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            ) : (
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-200" />
            )}
          </motion.div>

          {/* Sticky Pulse Indicator Dot */}
          <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950 shadow-[0_0_8px_#34d399] animate-pulse" />
        </motion.div>

        {/* Smart Tooltip */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isHovered && !physics.isDragging ? 1 : 0,
              scale: isHovered && !physics.isDragging ? 1 : 0.9,
              x: dockedSide === 'right' ? -10 : 10,
            }}
            transition={{ duration: 0.2 }}
            className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none hidden sm:flex items-center gap-1.5 bg-zinc-950/95 border border-emerald-500/40 text-emerald-200 text-[11px] font-semibold px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-md ${
              dockedSide === 'right' ? 'right-full mr-3' : 'left-full ml-3'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Slimy AI • Pull to stretch or click to chat!</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

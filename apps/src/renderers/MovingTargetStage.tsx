import { useState, useRef, useEffect, useCallback } from "react";
import type React from "react";

export interface MovingTargetParams {
  path: "bounce" | "randomWalk" | "none";
  spawnAfterMs?: number;
  reactionDelayMs: number;
  punishTapSpam?: boolean;
  targetLabel?: string;
  visualSizePx?: number;
  hitSizePx?: number;
  speedPxPerSec?: number;
  jitterPx?: number;
  playAreaPaddingPx?: number;
  decoyCount?: number;
  colorCycle?: boolean;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface StageRendererProps {
  params: MovingTargetParams;
  onComplete: () => void;
  onFail: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  dx: number;
  dy: number;
}

interface Decoy {
  id: number;
  pos: Position;
  vel: Velocity;
  color: string;
  size: number;
}

const CONTAINER_W = 320;
const CONTAINER_H = 480;

// Colors that cycle - correct target must match header instruction
const COLOR_CYCLE = ["#1b64da", "#e53935", "#f59e0b", "#7c3aed", "#059669"];
const CORRECT_COLOR = "#1b64da";
const DECOY_COLORS = ["#e53935", "#f59e0b", "#7c3aed", "#059669"];

export default function MovingTargetStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const targetSize = params.hitSizePx ?? 48;
  const speed = (params.speedPxPerSec ?? 180) / 60;
  const decoyCount = params.decoyCount ?? 0;
  const colorCycle = params.colorCycle ?? false;

  const [spawned, setSpawned] = useState(false);
  const [graceActive, setGraceActive] = useState(false);
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const [targetColor, setTargetColor] = useState(CORRECT_COLOR);
  const [decoys, setDecoys] = useState<Decoy[]>([]);

  const velRef = useRef<Velocity>({ dx: speed, dy: speed });
  const posRef = useRef<Position>({ x: 0, y: 0 });
  const decoyRefsPos = useRef<Position[]>([]);
  const decoyRefsVel = useRef<Velocity[]>([]);
  const rafRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);
  const colorIndexRef = useRef(0);
  const dynamicDecoyCountRef = useRef(decoyCount);
  const nextDecoyIdRef = useRef(decoyCount);
  const currentSpeedRef = useRef(speed);

  // Spawn target after delay, with grace period
  useEffect(() => {
    const timer = setTimeout(() => {
      const startX = Math.random() * (CONTAINER_W - targetSize);
      const startY = Math.random() * (CONTAINER_H - targetSize);
      posRef.current = { x: startX, y: startY };
      setPos({ x: startX, y: startY });

      // Initialize decoys
      const initDecoys: Decoy[] = [];
      for (let i = 0; i < decoyCount; i++) {
        const dx = (Math.random() * (CONTAINER_W - targetSize));
        const dy = (Math.random() * (CONTAINER_H - targetSize));
        decoyRefsPos.current[i] = { x: dx, y: dy };
        decoyRefsVel.current[i] = {
          dx: (Math.random() > 0.5 ? 1 : -1) * speed * (0.7 + Math.random() * 0.6),
          dy: (Math.random() > 0.5 ? 1 : -1) * speed * (0.7 + Math.random() * 0.6),
        };
        initDecoys.push({
          id: i,
          pos: { x: dx, y: dy },
          vel: decoyRefsVel.current[i]!,
          color: DECOY_COLORS[i % DECOY_COLORS.length]!,
          size: targetSize * (0.85 + Math.random() * 0.2),
        });
      }
      setDecoys(initDecoys);

      // Grace period - tapping now = fail
      setGraceActive(true);
      setSpawned(true);
      setTimeout(() => setGraceActive(false), params.reactionDelayMs > 0 ? params.reactionDelayMs : 800);
    }, params.spawnAfterMs ?? 0);

    return () => clearTimeout(timer);
  }, [params.spawnAfterMs, params.reactionDelayMs, targetSize, decoyCount, speed]);

  // Color cycling for real target
  useEffect(() => {
    if (!colorCycle || !spawned) return;
    const interval = setInterval(() => {
      colorIndexRef.current = (colorIndexRef.current + 1) % COLOR_CYCLE.length;
      setTargetColor(COLOR_CYCLE[colorIndexRef.current]!);
    }, 2500);
    return () => clearInterval(interval);
  }, [colorCycle, spawned]);

  // Animation loop for target and decoys
  useEffect(() => {
    if (!spawned || params.path === "none") return;

    const animate = () => {
      // Move real target
      const p = posRef.current;
      const v = velRef.current;

      let nx = p.x + v.dx;
      let ny = p.y + v.dy;

      if (params.path === "bounce") {
        if (nx <= 0 || nx >= CONTAINER_W - targetSize) {
          v.dx = -v.dx;
          nx = Math.max(0, Math.min(nx, CONTAINER_W - targetSize));
        }
        if (ny <= 0 || ny >= CONTAINER_H - targetSize) {
          v.dy = -v.dy;
          ny = Math.max(0, Math.min(ny, CONTAINER_H - targetSize));
        }
      } else if (params.path === "randomWalk") {
        v.dx += (Math.random() - 0.5) * 2;
        v.dy += (Math.random() - 0.5) * 2;
        const maxSpeed = currentSpeedRef.current * 2;
        v.dx = Math.max(-maxSpeed, Math.min(maxSpeed, v.dx));
        v.dy = Math.max(-maxSpeed, Math.min(maxSpeed, v.dy));
        nx = Math.max(0, Math.min(CONTAINER_W - targetSize, nx));
        ny = Math.max(0, Math.min(CONTAINER_H - targetSize, ny));
        if (nx <= 0 || nx >= CONTAINER_W - targetSize) v.dx = -v.dx;
        if (ny <= 0 || ny >= CONTAINER_H - targetSize) v.dy = -v.dy;
      }

      posRef.current = { x: nx, y: ny };
      velRef.current = v;
      setPos({ x: nx, y: ny });

      // Move decoys
      if (dynamicDecoyCountRef.current > 0) {
        const newDecoyPositions: Position[] = [];
        for (let i = 0; i < dynamicDecoyCountRef.current; i++) {
          const dp = decoyRefsPos.current[i];
          const dv = decoyRefsVel.current[i];
          if (!dp || !dv) continue;

          let dnx = dp.x + dv.dx;
          let dny = dp.y + dv.dy;
          if (dnx <= 0 || dnx >= CONTAINER_W - targetSize) {
            dv.dx = -dv.dx;
            dnx = Math.max(0, Math.min(dnx, CONTAINER_W - targetSize));
          }
          if (dny <= 0 || dny >= CONTAINER_H - targetSize) {
            dv.dy = -dv.dy;
            dny = Math.max(0, Math.min(dny, CONTAINER_H - targetSize));
          }
          decoyRefsPos.current[i] = { x: dnx, y: dny };
          newDecoyPositions.push({ x: dnx, y: dny });
        }
        setDecoys((prev) =>
          prev.map((d, i) => ({
            ...d,
            pos: newDecoyPositions[i] ?? d.pos,
          })),
        );
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawned, params.path, targetSize, speed, decoyCount]);

  const handleBackgroundTap = useCallback(() => {
    if (graceActive) {
      onFail();
      return;
    }
    if (!params.punishTapSpam) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onFail();
    }
    lastTapRef.current = now;
  }, [graceActive, params.punishTapSpam, onFail]);

  const handleTargetTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      if (graceActive) {
        onFail();
        return;
      }
      // Only correct if target is the correct color (파란색)
      if (colorCycle && targetColor !== CORRECT_COLOR) {
        onFail();
        return;
      }
      onComplete();
    },
    [graceActive, colorCycle, targetColor, onComplete, onFail],
  );

  const handleDecoyTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();

      const hasMechanics = params.wrongCloseAddsLayer || params.shuffleOnMiss;

      if (params.wrongCloseAddsLayer) {
        // Increase speed by 10% and scale all velocities
        const scale = 1.1;
        currentSpeedRef.current *= scale;
        velRef.current.dx *= scale;
        velRef.current.dy *= scale;
        for (let i = 0; i < dynamicDecoyCountRef.current; i++) {
          if (decoyRefsVel.current[i]) {
            decoyRefsVel.current[i]!.dx *= scale;
            decoyRefsVel.current[i]!.dy *= scale;
          }
        }
        // Add a new decoy circle
        const newIdx = dynamicDecoyCountRef.current;
        dynamicDecoyCountRef.current++;
        const spd = currentSpeedRef.current;
        const dx = Math.random() * (CONTAINER_W - targetSize);
        const dy = Math.random() * (CONTAINER_H - targetSize);
        decoyRefsPos.current[newIdx] = { x: dx, y: dy };
        decoyRefsVel.current[newIdx] = {
          dx: (Math.random() > 0.5 ? 1 : -1) * spd * (0.7 + Math.random() * 0.6),
          dy: (Math.random() > 0.5 ? 1 : -1) * spd * (0.7 + Math.random() * 0.6),
        };
        const newId = nextDecoyIdRef.current++;
        setDecoys((prev) => [
          ...prev,
          {
            id: newId,
            pos: { x: dx, y: dy },
            vel: decoyRefsVel.current[newIdx]!,
            color: DECOY_COLORS[newIdx % DECOY_COLORS.length]!,
            size: targetSize * (0.85 + Math.random() * 0.2),
          },
        ]);
      }

      if (params.shuffleOnMiss) {
        // Randomize target position
        const nx = Math.random() * (CONTAINER_W - targetSize);
        const ny = Math.random() * (CONTAINER_H - targetSize);
        posRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });
        // Randomize all decoy positions and shuffle colors
        const shuffledColors = [...DECOY_COLORS].sort(() => Math.random() - 0.5);
        for (let i = 0; i < dynamicDecoyCountRef.current; i++) {
          decoyRefsPos.current[i] = {
            x: Math.random() * (CONTAINER_W - targetSize),
            y: Math.random() * (CONTAINER_H - targetSize),
          };
        }
        setDecoys((prev) =>
          prev.map((d, i) => ({
            ...d,
            pos: decoyRefsPos.current[i] ?? d.pos,
            color: shuffledColors[i % shuffledColors.length]!,
          })),
        );
      }

      if (!hasMechanics) {
        onFail();
      }
    },
    [params.wrongCloseAddsLayer, params.shuffleOnMiss, targetSize, onFail],
  );

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: CONTAINER_W,
    height: CONTAINER_H,
    margin: "0 auto",
    overflow: "hidden",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    touchAction: "manipulation",
    userSelect: "none",
    // Background noise: subtle grid
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
  };

  const targetStyle: React.CSSProperties = {
    position: "absolute",
    left: pos.x,
    top: pos.y,
    width: targetSize,
    height: targetSize,
    borderRadius: "50%",
    backgroundColor: targetColor,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    padding: 0,
    WebkitTapHighlightColor: "transparent",
    zIndex: 10,
  };

  const waitingStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    fontSize: 16,
    color: "#999",
    flexDirection: "column",
    gap: 8,
  };

  const headerStyle: React.CSSProperties = {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 600,
    color: "#1b64da",
    zIndex: 20,
    pointerEvents: "none",
    background: "rgba(255,255,255,0.85)",
    padding: "4px 0",
  };

  return (
    <div
      style={containerStyle}
      onClick={handleBackgroundTap}
      role="presentation"
    >
      {spawned && (
        <div style={headerStyle}>
          파란색 원을 탭하세요
        </div>
      )}

      {!spawned ? (
        <div style={waitingStyle}>
          <span>기다리세요...</span>
        </div>
      ) : (
        <>
          {graceActive && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 30,
                pointerEvents: "none",
              }}
            >
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#e53935",
                background: "rgba(255,255,255,0.9)",
                borderRadius: 8,
                padding: "8px 20px",
              }}>
                기다리세요...
              </div>
            </div>
          )}

          {/* Decoy targets */}
          {decoys.map((decoy) => (
            <button
              key={decoy.id}
              type="button"
              style={{
                position: "absolute",
                left: decoy.pos.x,
                top: decoy.pos.y,
                width: decoy.size,
                height: decoy.size,
                borderRadius: "50%",
                backgroundColor: decoy.color,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                padding: 0,
                WebkitTapHighlightColor: "transparent",
                zIndex: 9,
              }}
              onClick={handleDecoyTap}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleDecoyTap(e);
              }}
            >
              탭!
            </button>
          ))}

          {/* Real target */}
          <button
            type="button"
            style={targetStyle}
            onClick={handleTargetTap}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTargetTap(e);
            }}
          >
            탭!
          </button>
        </>
      )}
    </div>
  );
}

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

const CONTAINER_W = 320;
const CONTAINER_H = 480;

export default function MovingTargetStage({
  params,
  onComplete,
  onFail,
}: StageRendererProps) {
  const targetSize = params.hitSizePx ?? 48;
  const speed = (params.speedPxPerSec ?? 180) / 60;

  const [spawned, setSpawned] = useState(false);
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const [spamCount, setSpamCount] = useState(0);

  const velRef = useRef<Velocity>({ dx: speed, dy: speed });
  const posRef = useRef<Position>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);

  // Spawn target after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const startX = Math.random() * (CONTAINER_W - targetSize);
      const startY = Math.random() * (CONTAINER_H - targetSize);
      posRef.current = { x: startX, y: startY };
      setPos({ x: startX, y: startY });
      setSpawned(true);
    }, params.spawnAfterMs ?? 0);

    return () => clearTimeout(timer);
  }, [params.spawnAfterMs, targetSize]);

  // Animation loop
  useEffect(() => {
    if (!spawned || params.path === "none") return;

    const animate = () => {
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
        // Randomly adjust direction
        v.dx += (Math.random() - 0.5) * 2;
        v.dy += (Math.random() - 0.5) * 2;
        // Clamp velocity
        const maxSpeed = speed * 2;
        v.dx = Math.max(-maxSpeed, Math.min(maxSpeed, v.dx));
        v.dy = Math.max(-maxSpeed, Math.min(maxSpeed, v.dy));
        // Bounce off edges
        nx = Math.max(0, Math.min(CONTAINER_W - targetSize, nx));
        ny = Math.max(0, Math.min(CONTAINER_H - targetSize, ny));
        if (nx <= 0 || nx >= CONTAINER_W - targetSize) v.dx = -v.dx;
        if (ny <= 0 || ny >= CONTAINER_H - targetSize) v.dy = -v.dy;
      }

      posRef.current = { x: nx, y: ny };
      velRef.current = v;
      setPos({ x: nx, y: ny });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawned, params.path, targetSize, speed]);

  const handleBackgroundTap = useCallback(() => {
    if (!params.punishTapSpam) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      const next = spamCount + 1;
      setSpamCount(next);
      if (next >= 5) {
        onFail();
      }
    }
    lastTapRef.current = now;
  }, [params.punishTapSpam, spamCount, onFail]);

  const handleTargetTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      onComplete();
    },
    [onComplete],
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
  };

  const targetStyle: React.CSSProperties = {
    position: "absolute",
    left: pos.x,
    top: pos.y,
    width: targetSize,
    height: targetSize,
    borderRadius: "50%",
    backgroundColor: "#1b64da",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    padding: 0,
    transition: params.path === "none" ? "none" : undefined,
    WebkitTapHighlightColor: "transparent",
  };

  const waitingStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    fontSize: 16,
    color: "#999",
  };

  return (
    <div
      style={containerStyle}
      onClick={handleBackgroundTap}
      role="presentation"
    >
      {!spawned ? (
        <div style={waitingStyle}>기다리세요...</div>
      ) : (
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
      )}
    </div>
  );
}

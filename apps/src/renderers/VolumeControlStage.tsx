import { useState, useCallback, useRef, useEffect } from 'react';

export interface VolumeControlParams {
  mode: "hover_slider" | "hyper_sensitive" | "tiny_hitbox" | "hidden_icon" | "reverse_mapping" | "random_jump" | "circular_gesture" | "puzzle_lock" | "physics_launcher" | "voice_shout";
  targetVolume: number; // 0-100, what user must set
  tolerance: number; // acceptable range (e.g., ±5)
  trackWidthPx?: number;
  sensitivity?: number;
  jitterPx?: number;
  showDelayMs?: number;
  hideOnOutMs?: number;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

export default function VolumeControlStage({
  params,
  onComplete,
  onFail
}: {
  params: VolumeControlParams;
  onComplete: () => void;
  onFail: () => void;
}) {
  const [volume, setVolume] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [puzzleSequence, setPuzzleSequence] = useState<number[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [launchPower, setLaunchPower] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [knobPosition, setKnobPosition] = useState({ x: 50, y: 0 });
  const [dynamicTolerance, setDynamicTolerance] = useState(params.tolerance);
  const [dynamicSensitivity, setDynamicSensitivity] = useState(params.sensitivity ?? 2.5);
  const [dynamicJitter, setDynamicJitter] = useState(params.jitterPx ?? 40);
  const [iconOffset, setIconOffset] = useState({ x: 0, y: 0 });
  const [hitboxScale, setHitboxScale] = useState(1.0);

  const trackRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showHint, setShowHint] = useState(false);

  const targetPuzzle = [1, 3, 2, 4]; // solution for puzzle_lock

  // Check win condition (only after first user interaction)
  useEffect(() => {
    if (!hasInteracted) return;
    const diff = Math.abs(volume - params.targetVolume);
    if (diff <= dynamicTolerance) {
      onComplete();
    }
  }, [volume, params.targetVolume, dynamicTolerance, onComplete, hasInteracted]);

  // Track overshoots
  const checkOvershoot = useCallback((newVolume: number) => {
    const tol = dynamicTolerance;
    const overshot = Math.abs(newVolume - params.targetVolume) > tol &&
                     ((volume < params.targetVolume && newVolume > params.targetVolume + tol) ||
                      (volume > params.targetVolume && newVolume < params.targetVolume - tol));

    if (overshot) {
      if (params.wrongCloseAddsLayer) {
        setDynamicTolerance((prev) => Math.max(1, prev - 1));
      } else {
        onFail();
      }

      if (params.shuffleOnMiss) {
        switch (params.mode) {
          case 'hyper_sensitive':
            setDynamicSensitivity((prev) => Math.min(5.0, prev * 1.2));
            break;
          case 'hidden_icon':
            setIconOffset({ x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 50 });
            break;
          case 'random_jump':
            setDynamicJitter((prev) => Math.min(100, prev * 1.2));
            break;
          case 'tiny_hitbox':
            setHitboxScale((prev) => Math.max(0.3, prev * 0.9));
            break;
          default:
            setDynamicJitter((prev) => Math.min(100, prev * 1.2));
        }
      }
    }
  }, [volume, params.targetVolume, dynamicTolerance, params.wrongCloseAddsLayer, params.shuffleOnMiss, params.mode, onFail]);

  // Mode-specific handlers
  const handleHoverSlider = useCallback((clientX: number) => {
    if (!trackRef.current || !isHovering) return;
    setHasInteracted(true);
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newVolume = Math.round(percent);
    checkOvershoot(newVolume);
    setVolume(newVolume);
  }, [isHovering, checkOvershoot]);

  const handleHyperSensitive = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    setHasInteracted(true);
    const rect = trackRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    const sensitivity = dynamicSensitivity;
    const centered = percent - 50;
    const amplified = 50 + (centered * sensitivity);
    const newVolume = Math.round(Math.max(0, Math.min(100, amplified)));
    checkOvershoot(newVolume);
    setVolume(newVolume);
  }, [dynamicSensitivity, checkOvershoot]);

  const handleTinyHitbox = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    setHasInteracted(true);
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newVolume = Math.round(percent);
    checkOvershoot(newVolume);
    setVolume(newVolume);
  }, [checkOvershoot]);

  const handleReverseMapping = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    setHasInteracted(true);
    const rect = trackRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    const newVolume = Math.round(100 - Math.max(0, Math.min(100, percent)));
    checkOvershoot(newVolume);
    setVolume(newVolume);
  }, [checkOvershoot]);

  const handleRandomJump = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    setHasInteracted(true);
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newVolume = Math.round(percent);
    checkOvershoot(newVolume);
    setVolume(newVolume);

    // Random jump knob position
    if (Math.random() > 0.7) {
      const jitter = dynamicJitter;
      setKnobPosition({
        x: Math.random() * jitter - jitter / 2,
        y: Math.random() * jitter - jitter / 2
      });
    }
  }, [dynamicJitter, checkOvershoot]);

  const handleCircularGestureXY = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current || !isDragging) return;
    setHasInteracted(true);
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Require many rotations: 1 full rotation = ~10 volume units
    const angleDelta = newAngle - angle;
    const volumeChange = angleDelta / 36;
    const newVolume = Math.round(Math.max(0, Math.min(100, volume + volumeChange)));
    checkOvershoot(newVolume);
    setVolume(newVolume);
    setAngle(newAngle);
  }, [isDragging, angle, volume, checkOvershoot]);

  const handlePuzzleTap = useCallback((num: number) => {
    const newSeq = [...puzzleSequence, num];
    setPuzzleSequence(newSeq);

    if (newSeq.length === targetPuzzle.length) {
      const correct = newSeq.every((n, i) => n === targetPuzzle[i]);
      if (correct) {
        setIsUnlocked(true);
      } else {
        setPuzzleSequence([]);
        onFail();
      }
    }
  }, [puzzleSequence, onFail]);

  const handlePhysicsLaunch = useCallback(() => {
    setHasInteracted(true);
    const newVolume = Math.round(launchPower);
    checkOvershoot(newVolume);
    setVolume(newVolume);
    setLaunchPower(0);
  }, [launchPower, checkOvershoot]);

  const handleVoiceShout = useCallback(() => {
    setHasInteracted(true);
    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Volume based on tap speed (reset after 1s)
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }
    tapTimer.current = setTimeout(() => setTapCount(0), 1000);

    const newVolume = Math.min(100, newCount * 8);
    checkOvershoot(newVolume);
    setVolume(newVolume);
  }, [tapCount, checkOvershoot]);

  // Render mode-specific UI
  const renderControl = () => {
    switch (params.mode) {
      case 'hover_slider':
        return (
          <div style={{ position: 'relative', width: '100%', padding: '20px' }}>
            <div
              ref={trackRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => {
                hideTimer.current = setTimeout(() => setIsHovering(false), params.hideOnOutMs ?? 100);
              }}
              onMouseMove={(e) => {
                if (hideTimer.current) clearTimeout(hideTimer.current);
                handleHoverSlider(e.clientX);
              }}
              onTouchStart={() => {
                if (hideTimer.current) clearTimeout(hideTimer.current);
                setIsHovering(true);
              }}
              onTouchEnd={() => {
                hideTimer.current = setTimeout(() => setIsHovering(false), params.hideOnOutMs ?? 100);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                if (hideTimer.current) clearTimeout(hideTimer.current);
                const touch = e.touches[0];
                if (touch) handleHoverSlider(touch.clientX);
              }}
              style={{
                height: '40px',
                touchAction: 'none',
                background: isHovering ? '#E8EBED' : 'transparent',
                borderRadius: '4px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {isHovering && (
                <>
                  <div style={{
                    width: `${volume}%`,
                    height: '100%',
                    background: '#3182F6',
                    borderRadius: '4px',
                    transition: 'width 0.1s'
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: `${volume}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#191F28',
                    border: '2px solid white'
                  }} />
                </>
              )}
            </div>
          </div>
        );

      case 'hyper_sensitive':
        return (
          <div style={{ width: '100%', padding: '20px' }}>
            <div
              ref={trackRef}
              onMouseMove={(e) => handleHyperSensitive(e.clientX)}
              onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleHyperSensitive(t.clientX); }}
              style={{
                height: '40px',
                touchAction: 'none',
                background: '#E8EBED',
                borderRadius: '4px',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: `${volume}%`,
                height: '100%',
                background: '#3182F6',
                borderRadius: '4px',
                transition: 'width 0.05s'
              }} />
              <div style={{
                position: 'absolute',
                left: `${volume}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#191F28'
              }} />
            </div>
          </div>
        );

      case 'tiny_hitbox':
        return (
          <div style={{ width: '100%', padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <div
              ref={trackRef}
              onMouseMove={(e) => handleTinyHitbox(e.clientX)}
              onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleTinyHitbox(t.clientX); }}
              style={{
                width: '300px',
                touchAction: 'none',
                height: `${(params.trackWidthPx ?? 3) * hitboxScale}px`,
                background: '#8B95A1',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute',
                left: `${volume}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#191F28'
              }} />
            </div>
          </div>
        );

      case 'hidden_icon':
        return (
          <div style={{ width: '100%', padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <div
              onMouseDown={() => {
                longPressTimer.current = setTimeout(() => setIsRevealed(true), params.showDelayMs ?? 800);
              }}
              onMouseUp={() => {
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
              }}
              onMouseLeave={() => {
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
              }}
              onTouchStart={() => {
                longPressTimer.current = setTimeout(() => setIsRevealed(true), params.showDelayMs ?? 800);
              }}
              onTouchEnd={() => {
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
              }}
              style={{
                fontSize: '48px',
                cursor: 'pointer',
                position: 'relative',
                transform: `translate(${iconOffset.x}px, ${iconOffset.y}px)`,
                transition: 'transform 0.3s',
              }}
            >
              🔊
              {isRevealed && (
                <div
                  ref={trackRef}
                  onMouseMove={(e) => handleTinyHitbox(e.clientX)}
                  onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleTinyHitbox(t.clientX); }}
                  style={{
                    position: 'absolute',
                    touchAction: 'none',
                    top: '60px',
                    left: '-100px',
                    width: '200px',
                    height: '40px',
                    background: '#E8EBED',
                    borderRadius: '4px',
                    padding: '10px'
                  }}
                >
                  <div style={{
                    width: `${volume}%`,
                    height: '100%',
                    background: '#3182F6',
                    borderRadius: '4px'
                  }} />
                </div>
              )}
            </div>
          </div>
        );

      case 'reverse_mapping':
        return (
          <div style={{ width: '100%', padding: '20px' }}>
            <div
              ref={trackRef}
              onMouseMove={(e) => handleReverseMapping(e.clientX)}
              onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleReverseMapping(t.clientX); }}
              style={{
                height: '40px',
                touchAction: 'none',
                background: '#E8EBED',
                borderRadius: '4px',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: `${volume}%`,
                height: '100%',
                background: '#3182F6',
                borderRadius: '4px'
              }} />
              <div style={{
                position: 'absolute',
                left: `${100 - volume}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#191F28'
              }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#8B95A1' }}>
              ← 크게 | 작게 →
            </div>
          </div>
        );

      case 'random_jump':
        return (
          <div style={{ width: '100%', padding: '20px' }}>
            <div
              ref={trackRef}
              onMouseMove={(e) => handleRandomJump(e.clientX)}
              onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleRandomJump(t.clientX); }}
              style={{
                height: '40px',
                touchAction: 'none',
                background: '#E8EBED',
                borderRadius: '4px',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: `${volume}%`,
                height: '100%',
                background: '#3182F6',
                borderRadius: '4px'
              }} />
              <div style={{
                position: 'absolute',
                left: `calc(${volume}% + ${knobPosition.x}px)`,
                top: `calc(50% + ${knobPosition.y}px)`,
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#191F28',
                transition: 'all 0.2s'
              }} />
            </div>
          </div>
        );

      case 'circular_gesture':
        return (
          <div style={{ width: '100%', padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <div
              ref={dialRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={(e) => handleCircularGestureXY(e.clientX, e.clientY)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleCircularGestureXY(t.clientX, t.clientY); }}
              style={{
                width: '150px',
                height: '150px',
                touchAction: 'none',
                borderRadius: '50%',
                border: '4px solid #4E5968',
                position: 'relative',
                cursor: 'pointer',
                background: '#E8EBED'
              }}
            >
              <div style={{
                position: 'absolute',
                width: '6px',
                height: '60px',
                background: '#191F28',
                top: '15px',
                left: '50%',
                transformOrigin: 'center 60px',
                transform: `translateX(-50%) rotate(${(volume / 100) * 360 * 2}deg)`,
                borderRadius: '3px'
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#191F28'
              }}>
                {volume}
              </div>
            </div>
          </div>
        );

      case 'puzzle_lock':
        return (
          <div style={{ width: '100%', padding: '20px' }}>
            {!isUnlocked ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '20px', color: '#4E5968' }}>
                  퍼즐을 풀어 잠금 해제: {puzzleSequence.join(' → ')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxWidth: '200px', margin: '0 auto' }}>
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePuzzleTap(num)}
                      style={{
                        padding: '20px',
                        fontSize: '24px',
                        background: '#E8EBED',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (hintTimer.current) clearTimeout(hintTimer.current);
                      setShowHint(true);
                      hintTimer.current = setTimeout(() => setShowHint(false), 3000);
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: '#F2F4F6',
                      border: '1px solid #E5E8EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#4E5968'
                    }}
                  >
                    힌트 보기
                  </button>
                  {showHint && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#8B95A1' }}>
                      힌트: 1 → 3 → 2 → 4
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                ref={trackRef}
                onMouseMove={(e) => handleTinyHitbox(e.clientX)}
                onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) handleTinyHitbox(t.clientX); }}
                style={{
                  height: '40px',
                  touchAction: 'none',
                  background: '#E8EBED',
                  borderRadius: '4px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: `${volume}%`,
                  height: '100%',
                  background: '#3182F6',
                  borderRadius: '4px'
                }} />
              </div>
            )}
          </div>
        );

      case 'physics_launcher':
        return (
          <div style={{ width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px', height: '200px', background: '#E8EBED', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '32px'
              }}>
                🎯
              </div>
              <div style={{
                position: 'absolute',
                top: `${100 - launchPower}%`,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '24px',
                transition: 'top 0.3s'
              }}>
                🔊
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={launchPower}
              onChange={(e) => setLaunchPower(Number(e.target.value))}
              style={{ width: '300px', marginBottom: '10px' }}
            />
            <button
              type="button"
              onClick={handlePhysicsLaunch}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                background: '#3182F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              발사! (파워: {launchPower})
            </button>
          </div>
        );

      case 'voice_shout':
        return (
          <div style={{ width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎤</div>
            <div style={{ width: '300px', height: '40px', background: '#E8EBED', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{
                width: `${volume}%`,
                height: '100%',
                background: volume > 70 ? '#E53935' : '#3182F6',
                transition: 'width 0.2s, background 0.2s'
              }} />
            </div>
            <button
              type="button"
              onClick={handleVoiceShout}
              style={{
                padding: '20px 40px',
                fontSize: '20px',
                background: '#3182F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              탭하여 소리지르기!
            </button>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#8B95A1' }}>
              1초 내 탭 횟수 = 음량 (최대 100)
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: '#F2F4F6',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#4E5968', marginBottom: '8px' }}>
          목표 볼륨
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#191F28', marginBottom: '8px' }}>
          {params.targetVolume}
        </div>
        <div style={{ fontSize: '14px', color: '#8B95A1' }}>
          (±{dynamicTolerance} 허용)
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #E5E8EB',
        marginBottom: '20px'
      }}>
        {renderControl()}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: '#F2F4F6',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '14px', color: '#4E5968' }}>
          현재 볼륨
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#191F28' }}>
          {volume}
        </div>
      </div>

    </div>
  );
}

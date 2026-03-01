import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
import type { GameState, GameAction } from './types';
import { gameReducer, initialGameState } from './reducer';
import { save, load, getUserHash } from '../toss-adapter/TossAdapter';

const STORAGE_KEY = 'uxtrap_game_state';

interface GameStateContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  initialized: boolean;
}

export const GameStateContext = createContext<GameStateContextValue>({
  state: initialGameState,
  dispatch: () => {},
  initialized: false,
});

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [initialized, setInitialized] = useState(false);

  // Load state from Storage on mount
  useEffect(() => {
    (async () => {
      try {
        const hash = await getUserHash();
        const saved = await load(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          // Migration: 기존 유저(hasSeenOnboarding 필드 없음)는 클리어 이력이 있으면 온보딩 스킵
          const hasSeenOnboarding =
            parsed.hasSeenOnboarding ??
            (parsed.collection?.clearedStageIds?.length > 0);
          dispatch({
            type: 'INIT',
            state: { ...parsed, userHash: hash, hasSeenOnboarding },
          });
        } else {
          dispatch({ type: 'SET_USER_HASH', hash });
        }
      } catch (e) {
        console.warn('[GameState] Failed to load:', e);
      }
      setInitialized(true);
    })();
  }, []);

  // Persist state to Storage on every change (debounced)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!initialized) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      save(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
        console.warn('[GameState] Failed to save:', e)
      );
    }, 300);
  }, [state, initialized]);

  return (
    <GameStateContext.Provider value={{ state, dispatch, initialized }}>
      {children}
    </GameStateContext.Provider>
  );
}

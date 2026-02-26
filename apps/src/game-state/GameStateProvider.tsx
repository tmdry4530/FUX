import React, { createContext, useReducer, useEffect, useRef } from 'react';
import type { GameState, GameAction } from './types';
import { gameReducer, initialGameState } from './reducer';
import { save, load, getUserHash } from '../toss-adapter/TossAdapter';

const STORAGE_KEY = 'fux_game_state';

interface GameStateContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameStateContext = createContext<GameStateContextValue>({
  state: initialGameState,
  dispatch: () => {},
});

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const initialized = useRef(false);

  // Load state from Storage on mount
  useEffect(() => {
    (async () => {
      try {
        const hash = await getUserHash();
        const saved = await load(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          dispatch({ type: 'INIT', state: { ...parsed, userHash: hash } });
        } else {
          dispatch({ type: 'SET_USER_HASH', hash });
        }
      } catch (e) {
        console.warn('[GameState] Failed to load:', e);
      }
      initialized.current = true;
    })();
  }, []);

  // Persist state to Storage on every change (debounced)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!initialized.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      save(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
        console.warn('[GameState] Failed to save:', e)
      );
    }, 300);
  }, [state]);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

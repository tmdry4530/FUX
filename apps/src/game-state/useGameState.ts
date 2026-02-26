import { useContext } from 'react';
import { GameStateContext } from './GameStateProvider';

export function useGameState() {
  return useContext(GameStateContext);
}

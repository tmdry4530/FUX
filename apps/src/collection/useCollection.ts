import { useCallback, useMemo } from 'react';
import { useGameState } from '../game-state/useGameState';
import stagesV3 from '../stages/stages.v3.json';
import stagesV2 from '../stages/stages.v2.json';
import stagesLegacy from '../stages/stages.mvp.json';
import stagesUxhell from '../stages/stages.uxhell.json';
import type { StageSpec } from '../stages/stage-spec';

const allStages: StageSpec[] = [...(stagesV3 as StageSpec[]), ...(stagesV2 as StageSpec[]), ...(stagesLegacy as StageSpec[]), ...(stagesUxhell as StageSpec[])];

export interface EducationCard {
  stageId: string;
  title: string;
  explainWhyBad: string;
  difficulty: number;
  cleared: boolean;
  viewed: boolean;
}

export function useCollection() {
  const { state, dispatch } = useGameState();
  const { collection } = state;

  const cards: EducationCard[] = useMemo(() =>
    allStages.map((s) => ({
      stageId: s.id,
      title: s.title,
      explainWhyBad: s.explainWhyBad,
      difficulty: s.difficulty,
      cleared: collection.clearedStageIds.includes(s.id),
      viewed: collection.viewedCardIds.includes(s.id),
    })),
    [collection]
  );

  const totalCount = allStages.length;
  const clearedCount = collection.clearedStageIds.length;
  const viewedCount = collection.viewedCardIds.length;

  const markViewed = useCallback((stageId: string) => {
    dispatch({ type: 'ADD_VIEWED_CARD', stageId });
  }, [dispatch]);

  return { cards, totalCount, clearedCount, viewedCount, markViewed };
}

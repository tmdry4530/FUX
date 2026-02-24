export type StageType = "tiny_button" | "moving_target" | "modal_stack";

export interface StageSpec<TParams = Record<string, any>> {
  id: string;
  type: StageType;

  // UX
  title: string;
  objective: string;

  // Share/Result copy (brand-safe, no profanity)
  memeCaption: string;
  explainWhyBad: string;

  // Difficulty & rules
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeLimitMs: number;
  allowHint: boolean;
  allowSkip: boolean;
  hintText?: string;

  // Stage-type-specific parameters
  params: TParams;
}

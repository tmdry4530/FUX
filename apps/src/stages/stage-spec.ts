export type StageType =
  // v1 (legacy)
  | "tiny_button"
  | "moving_target"
  | "modal_stack"
  // v2
  | "roach_motel_flow"
  | "consent_toggle_labour"
  | "hidden_reject_link"
  | "disguised_cta_grid"
  | "picker_no_search"
  | "state_feedback_broken"
  | "label_ambiguity";

export interface StageSpec<TParams = Record<string, unknown>> {
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

  // v2 metadata (optional)
  sourceTag?: string;
  patternTag?: string;
  safety?: string;
  mechanicNotes?: string;

  // Stage-type-specific parameters
  params: TParams;
}

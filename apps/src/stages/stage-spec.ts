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
  | "label_ambiguity"
  // v3 - volume hell (all rendered by VolumeControlStage)
  | "volume_hover_slider"
  | "volume_hyper_sensitive"
  | "volume_tiny_hitbox"
  | "volume_hidden_icon"
  | "volume_reverse_mapping"
  | "volume_random_jump"
  | "volume_circular_gesture"
  | "volume_puzzle_lock"
  | "volume_physics_launcher"
  | "volume_voice_shout"
  // v3 - web hell (archetype renderers)
  | "endless_wizard_flow"
  | "nav_ambiguity_map"
  | "clutter_find_cta"
  | "enterprise_filter_overload"
  | "government_portal_popups"
  | "chaotic_layout_scavenger";

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

  // v2/v3 metadata (optional)
  packTag?: string;
  sourceTag?: string;
  patternTag?: string;
  safety?: string;
  mechanicNotes?: string;

  // Stage-type-specific parameters
  params: TParams;
}

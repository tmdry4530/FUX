/** archetype -> 매핑 가능한 기존 stageType 풀 */
export const ARCHETYPE_TO_STAGE_TYPES: Record<string, string[]> = {
  volume_hell: [
    'volume_hover_slider', 'volume_hyper_sensitive', 'volume_tiny_hitbox',
    'volume_hidden_icon', 'volume_reverse_mapping', 'volume_random_jump',
    'volume_circular_gesture', 'volume_puzzle_lock', 'volume_physics_launcher',
    'volume_voice_shout',
  ],
  slider_hell: [
    'volume_hover_slider', 'volume_hyper_sensitive', 'volume_tiny_hitbox',
    'volume_reverse_mapping', 'volume_random_jump',
  ],
  scroll_hell: [
    'endless_wizard_flow', 'nav_ambiguity_map', 'chaotic_layout_scavenger',
    'enterprise_filter_overload', 'government_portal_popups', 'clutter_find_cta',
  ],
  form_input_hell: [
    'consent_toggle_labour', 'label_ambiguity', 'state_feedback_broken',
  ],
  dropdown_hell: [
    'picker_no_search', 'label_ambiguity', 'enterprise_filter_overload',
    'state_feedback_broken', 'consent_toggle_labour', 'nav_ambiguity_map',
  ],
  auth_hell: [
    'roach_motel_flow', 'hidden_reject_link', 'consent_toggle_labour',
    'modal_stack', 'endless_wizard_flow', 'disguised_cta_grid',
    'government_portal_popups', 'label_ambiguity', 'state_feedback_broken',
    'clutter_find_cta', 'picker_no_search',
  ],
  captcha_hell: [
    'disguised_cta_grid', 'clutter_find_cta', 'tiny_button',
    'moving_target', 'hidden_reject_link', 'label_ambiguity',
    'modal_stack', 'chaotic_layout_scavenger', 'state_feedback_broken',
    'picker_no_search', 'nav_ambiguity_map',
  ],
  color_theme_hell: [
    'state_feedback_broken', 'label_ambiguity',
  ],
  cursor_hell: [
    'moving_target', 'tiny_button', 'volume_tiny_hitbox',
    'hidden_reject_link', 'clutter_find_cta', 'disguised_cta_grid',
    'volume_hidden_icon',
  ],
  date_time_hell: [
    'picker_no_search', 'label_ambiguity', 'endless_wizard_flow',
    'consent_toggle_labour', 'state_feedback_broken', 'nav_ambiguity_map',
    'volume_hover_slider', 'volume_hyper_sensitive', 'enterprise_filter_overload',
    'government_portal_popups', 'modal_stack', 'clutter_find_cta',
    'chaotic_layout_scavenger', 'disguised_cta_grid', 'hidden_reject_link',
    'roach_motel_flow',
  ],
  keyboard_hell: [
    'label_ambiguity', 'consent_toggle_labour', 'state_feedback_broken',
    'picker_no_search', 'hidden_reject_link', 'modal_stack', 'endless_wizard_flow',
  ],
  physics_target_hell: [
    'volume_physics_launcher',
  ],
  misc_hell: [
    'modal_stack', 'clutter_find_cta', 'chaotic_layout_scavenger',
    'disguised_cta_grid', 'nav_ambiguity_map', 'enterprise_filter_overload',
    'endless_wizard_flow', 'hidden_reject_link', 'roach_motel_flow', 'picker_no_search',
  ],
};

/** archetype에서 deterministic하게 stageType 선택 (referenceId 기반 해싱) */
export function pickStageType(archetype: string, referenceId: string): string {
  const pool = ARCHETYPE_TO_STAGE_TYPES[archetype];
  if (!pool || pool.length === 0) return 'modal_stack'; // fallback
  let hash = 0;
  for (let i = 0; i < referenceId.length; i++) {
    hash = ((hash << 5) - hash + referenceId.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length]!;
}

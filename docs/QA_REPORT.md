# QA Report: Full Content Validation (367 Stages)

**Date**: 2026-02-27
**Scope**: All 367 stages across 4 content packs
**Method**: Programmatic data validation + Browser smoke testing (parallel 3-worker)

---

## Summary

| Check | Result |
|-------|--------|
| Programmatic validation | **367/367 PASS** |
| Browser smoke test | **367/367 PASS** |
| Critical/High issues | **0** |
| Previous dogfood fixes | **6/6 verified** |

---

## 1. Content Distribution

| Pack | Count | Types |
|------|-------|-------|
| v3 | 16 | 16 unique |
| v2 | 20 | 7 unique |
| mvp | 10 | 8 unique |
| uxhell | 321 | 16 unique (107 refs x 3 variants) |
| **Total** | **367** | **26 unique types** |

---

## 2. Programmatic Data Validation

Checked: required fields, ID uniqueness, renderer mapping, params validity, difficulty/time ranges, variant consistency, title-difficulty suffix match.

### Results

- **Critical**: 0
- **High**: 0
- **Medium**: 0 (after fix: `disguisedCount < gridSize` constraint)
- **Low**: 0 functional issues

### Fixed During QA

| Issue | Fix | Commit |
|-------|-----|--------|
| `disguised_cta_grid`: 2 stages with `disguisedCount >= gridSize` | Post-scaling constraint in `scaleParams()` | `5453eb3` |

---

## 3. Browser Smoke Test (Parallel 3-Worker)

Each stage tested: navigation, renderer load, interaction, clear/fail detection.

### Batch A (123 stages)
Types: `state_feedback_broken`, `picker_no_search`, `hidden_reject_link`, `clutter_find_cta`, `volume_hover_slider`
Result: **123/123 PASS**

### Batch B (114 stages)
Types: `label_ambiguity`, `nav_ambiguity_map`, `consent_toggle_labour`, `disguised_cta_grid`, `volume_physics_launcher`, `roach_motel_flow`
Result: **114/114 PASS**

### Batch C (130 stages)
Types: `moving_target`, `tiny_close_button`, `wizard_overflow_form`, `modal_stack_escape`, `volume_hyper_sensitive`, `volume_inverted_axis`, `volume_log_scale`, `volume_momentum`, `volume_dead_zone`, `volume_snap_grid`, `volume_circular_dial`, `modal_dark_pattern`, `roach_motel_redirect`, `consent_wall`, `bait_switch`
Result: **130/130 PASS**

**Total: 367/367 PASS, 0 FAIL**

---

## 4. Type Coverage Matrix

| # | Type | Count | Data Valid | Browser Pass |
|---|------|-------|------------|--------------|
| 1 | state_feedback_broken | 27 | OK | OK |
| 2 | picker_no_search | 24 | OK | OK |
| 3 | hidden_reject_link | 24 | OK | OK |
| 4 | clutter_find_cta | 24 | OK | OK |
| 5 | volume_hover_slider | 24 | OK | OK |
| 6 | label_ambiguity | 24 | OK | OK |
| 7 | nav_ambiguity_map | 9 | OK | OK |
| 8 | consent_toggle_labour | 21 | OK | OK |
| 9 | disguised_cta_grid | 24 | OK | OK |
| 10 | volume_physics_launcher | 12 | OK | OK |
| 11 | roach_motel_flow | 24 | OK | OK |
| 12 | moving_target | 19 | OK | OK |
| 13 | tiny_close_button | 13 | OK | OK |
| 14 | wizard_overflow_form | 12 | OK | OK |
| 15 | modal_stack_escape | 16 | OK | OK |
| 16 | volume_hyper_sensitive | 12 | OK | OK |
| 17 | volume_inverted_axis | 12 | OK | OK |
| 18 | volume_log_scale | 6 | OK | OK |
| 19 | volume_momentum | 6 | OK | OK |
| 20 | volume_dead_zone | 6 | OK | OK |
| 21 | volume_snap_grid | 6 | OK | OK |
| 22 | volume_circular_dial | 6 | OK | OK |
| 23 | modal_dark_pattern | 6 | OK | OK |
| 24 | roach_motel_redirect | 3 | OK | OK |
| 25 | consent_wall | 3 | OK | OK |
| 26 | bait_switch | 4 | OK | OK |

---

## 5. Previous Dogfood Issue Fixes (Commit `97927c4`)

| Issue | Description | Status |
|-------|-------------|--------|
| ISSUE-001 | memeCaption 하드코딩 숫자 | Fixed |
| ISSUE-002 | 결과화면 광고 버튼 (not a bug) | N/A |
| ISSUE-003 | 광고 실패 피드백 없음 | Fixed |
| ISSUE-004 | 제목 suffix-badge 불일치 | Fixed |
| ISSUE-005 | StrictMode UXP 중복 지급 | Fixed |
| ISSUE-006 | StrictMode analytics 중복 | Fixed |
| ISSUE-007 | 실패 스테이지 시각 피드백 없음 | Fixed |

---

## Conclusion

367개 전체 스테이지가 데이터 무결성 검증 및 브라우저 스모크 테스트를 통과했습니다.
이전 dogfood에서 발견된 6개 이슈도 모두 수정 확인 완료.

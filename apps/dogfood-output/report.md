# Dogfood Report: Fuck UX - 전체 컨텐츠 QA

| Field | Value |
|-------|-------|
| **Date** | 2026-02-28 |
| **App URL** | http://localhost:3000 |
| **Session** | fux-content-qa |
| **Scope** | 26가지 스테이지 타입 전체 콘텐츠 QA (STAGE_CLEAR_GUIDE.md 기반) |

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| **Total** | **0** |

## Issues

(이슈 없음)

## Test Results - 26개 스테이지 타입 전체 검증

모든 타입의 READY → PLAYING 화면 전환이 정상 동작하며, 각 렌더러의 게임 메커니즘이 올바르게 표시됨.

| # | Type | Stage ID | Title | Status |
|---|------|----------|-------|--------|
| 1 | tiny_button | mvp_001_tiny_x | 초소형 X 버튼 | PASS |
| 2 | moving_target | mvp_002_moving_continue | 도망가는 계속 버튼 | PASS |
| 3 | modal_stack | mvp_003_modal_stack_3 | 팝업 3단 | PASS |
| 4 | roach_motel_flow | roach_motel_01 | 구독 해지의 미로 | PASS |
| 5 | consent_toggle_labour | consent_toggle_01 | 쿠키 동의 노동 | PASS |
| 6 | hidden_reject_link | hidden_reject_01 | 숨겨진 거절 버튼 | PASS |
| 7 | disguised_cta_grid | disguised_cta_01 | 진짜 콘텐츠 찾기 | PASS |
| 8 | picker_no_search | picker_no_search_01 | 검색 없는 국가 선택 | PASS |
| 9 | state_feedback_broken | state_feedback_01 | 응답 없는 제출 버튼 | PASS |
| 10 | label_ambiguity | label_ambiguity_01 | 헷갈리는 버튼 이름 | PASS |
| 11 | volume_hover_slider | v3_hover_slider | 유령 슬라이더 | PASS |
| 12 | volume_hyper_sensitive | v3_hyper_sensitive | 과민 슬라이더 | PASS |
| 13 | volume_tiny_hitbox | v3_tiny_hitbox | 바늘구멍 슬라이더 | PASS |
| 14 | volume_hidden_icon | v3_hidden_icon | 숨겨진 볼륨 | PASS |
| 15 | volume_reverse_mapping | v3_reverse_mapping | 역방향 슬라이더 | PASS |
| 16 | volume_random_jump | v3_random_jump | 점프하는 노브 | PASS |
| 17 | volume_circular_gesture | v3_circular_gesture | 원형 다이얼 | PASS |
| 18 | volume_puzzle_lock | v3_puzzle_lock | 퍼즐 잠금 볼륨 | PASS |
| 19 | volume_physics_launcher | v3_physics_launcher | 볼륨 대포 | PASS |
| 20 | volume_voice_shout | v3_voice_shout | 소리 질러 볼륨 | PASS |
| 21 | endless_wizard_flow | v3_endless_wizard | 끝없는 가입 양식 | PASS |
| 22 | nav_ambiguity_map | v3_nav_ambiguity | 미로 네비게이션 | PASS |
| 23 | clutter_find_cta | v3_clutter_cta | 정보 과부하 속 버튼 찾기 | PASS |
| 24 | enterprise_filter_overload | v3_filter_overload | 필터 지옥 | PASS |
| 25 | government_portal_popups | v3_gov_portal | 관공서 포털 | PASS |
| 26 | chaotic_layout_scavenger | v3_chaotic_layout | 혼돈의 레이아웃 | PASS |

### 검증 항목
- READY 화면: 타이틀, 설명 텍스트, "시작하기" 버튼 렌더링
- PLAYING 화면: 게임 메커니즘 정상 작동 (타이머, 점수, 인터랙티브 요소)
- 각 렌더러의 고유 UI 요소 정상 표시

### 스크린샷
- `dogfood-output/screenshots/` 디렉토리에 26개 타입별 PLAYING 스크린샷 저장

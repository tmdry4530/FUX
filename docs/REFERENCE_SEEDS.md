# V3 Reference Seeds

20개 UX 지옥 레퍼런스를 FUX 앱 스테이지로 변환한 매핑 문서.

## 원칙

- **브랜드명 제거**: 실서비스명(Workday, Teams 등)은 사용하지 않고 아키타입 이름으로 치환
- **시뮬레이션 전용**: 모든 지옥 UX는 스테이지 내부 시뮬레이션에서만 동작
- **안전 레일**: 앱 쉘(Home/List/Result)은 정상 UX, Toss back/close 방해 금지

## Volume Hell Seeds (10개)

| # | Seed 설명 | StageType | 렌더러 |
|---|----------|-----------|--------|
| 1 | 호버해야 보이고 1px 벗어나면 사라지는 슬라이더 | `volume_hover_slider` | VolumeControlStage |
| 2 | 20→90 점프, 과민 감도/보간 문제 | `volume_hyper_sensitive` | VolumeControlStage |
| 3 | 3px 트랙, 터치 타겟 지옥 | `volume_tiny_hitbox` | VolumeControlStage |
| 4 | 아이콘 속 숨은 슬라이더, 모바일 제스처 애매 | `volume_hidden_icon` | VolumeControlStage |
| 5 | 오른쪽 드래그=감소, 정신모델 파괴 | `volume_reverse_mapping` | VolumeControlStage |
| 6 | 노브/슬라이더가 랜덤 점프 | `volume_random_jump` | VolumeControlStage |
| 7 | 원형으로 계속 돌려야 조금 바뀜 | `volume_circular_gesture` | VolumeControlStage |
| 8 | 퍼즐/미로를 풀어야 볼륨 조절 | `volume_puzzle_lock` | VolumeControlStage |
| 9 | 대포/컬링/새총 물리 메커닉 | `volume_physics_launcher` | VolumeControlStage |
| 10 | 소리 질러야 변화 (시뮬레이션) | `volume_voice_shout` | VolumeControlStage |

## Web Hell Seeds (10개 → 6 StageType)

| # | Seed 설명 | StageType | 렌더러 |
|---|----------|-----------|--------|
| 11 | 끝없는 지원/가입/설정 단계 | `endless_wizard_flow` | WizardFlowStage |
| 12 | 어디에 있는지 모르는 메뉴/채팅/팀/채널 혼란 | `nav_ambiguity_map` | NavMazeStage |
| 13 | 정보 과부하 페이지에서 핵심 CTA 찾기 | `clutter_find_cta` | ClutterFinderStage |
| 14 | 필터 12개+적용 버튼 숨김 | `enterprise_filter_overload` | NavMazeStage |
| 15 | 경고 팝업/약관 스크롤/3D 버튼 | `government_portal_popups` | WizardFlowStage |
| 16 | 요소가 겹치고 스크롤 지옥 | `chaotic_layout_scavenger` | ClutterFinderStage |

## Variant 생성 규칙

- 각 seed를 4~6개 variant로 증식 (난이도/파라미터 변형)
- ID: `v3_{pack}_{seedIndex}_{variantIndex}_{slug}`
- 난이도 1~5 분산
- 카피: seed 설명 기반, 욕설/브랜드명 금지

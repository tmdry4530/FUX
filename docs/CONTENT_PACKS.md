# V3 Content Packs

## 개요

V3는 20개 UX 지옥 레퍼런스를 기반으로 16개 스테이지(StageType당 1개)를 제공합니다.
**매 도전마다 목표치가 랜덤으로 바뀌어** 무한 리플레이가 가능합니다.

## Pack 구성

### Volume Hell (10 levels)

볼륨 조절 UI의 다양한 나쁜 UX 패턴을 시뮬레이션합니다.

| StageType | 패턴 | 랜덤화 요소 |
|-----------|------|------------|
| `volume_hover_slider` | 호버 시에만 보이는 슬라이더 | 목표 볼륨 (15-85) |
| `volume_hyper_sensitive` | 과민 감도 슬라이더 | 목표 볼륨 |
| `volume_tiny_hitbox` | 극소 터치 영역 | 목표 볼륨 |
| `volume_hidden_icon` | 아이콘 안에 숨겨진 컨트롤 | 목표 볼륨 |
| `volume_reverse_mapping` | 역방향 매핑 | 목표 볼륨 |
| `volume_random_jump` | 랜덤 점프 노브 | 목표 볼륨 |
| `volume_circular_gesture` | 원형 다이얼 | 목표 볼륨 |
| `volume_puzzle_lock` | 퍼즐 잠금 해제 필요 | 목표 볼륨 |
| `volume_physics_launcher` | 물리 발사 메커닉 | 목표 볼륨 |
| `volume_voice_shout` | 소리 지르기 시뮬레이션 | 목표 볼륨 |

**렌더러**: `VolumeControlStage` 1개로 10개 타입 통합 처리 (mode 파라미터)

### Web Hell (6 levels)

실서비스/웹의 나쁜 UX 패턴을 브랜드명 없이 아키타입으로 재현합니다.

| StageType | 패턴 | 랜덤화 요소 |
|-----------|------|------------|
| `endless_wizard_flow` | 끝없는 마법사 폼 | 단계 수 (6-11) |
| `government_portal_popups` | 관공서 포털 팝업 지옥 | 단계 수 (4-9) |
| `nav_ambiguity_map` | 네비게이션 혼란 | 목표 액션 (7종) |
| `enterprise_filter_overload` | 필터 과부하 | 목표 액션 |
| `clutter_find_cta` | 정보 과부하 CTA 찾기 | 목표 CTA 라벨 (8종) |
| `chaotic_layout_scavenger` | 혼란한 레이아웃 | 목표 CTA 라벨 |

**렌더러**: 3개 (`WizardFlowStage`, `NavMazeStage`, `ClutterFinderStage`)

## 데이터 파일

- `apps/src/stages/stages.v3.json` — 16개 스테이지 데이터
- `scripts/generate-v3-pack.js` — 생성 스크립트 (레거시)

## 안전 레일

- SIMULATION 배지: 광고처럼 보이는 요소에는 시뮬레이션 표시
- 외부 이동 없음: 모든 상호작용은 스테이지 내부에서만
- 브랜드명 없음: 아키타입 이름만 사용
- 즉시 종료 가능: 앱 쉘에서 언제든 quit/home/back

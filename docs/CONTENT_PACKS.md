# V3 Content Packs

## 개요

V3는 20개 UX 지옥 레퍼런스를 기반으로 90개 스테이지를 생성한 대량 콘텐츠 팩입니다.

## Pack 구성

### Volume Hell (50 levels)

볼륨 조절 UI의 다양한 나쁜 UX 패턴을 시뮬레이션합니다.

| StageType | Levels | 패턴 |
|-----------|--------|------|
| `volume_hover_slider` | 5 | 호버 시에만 보이는 슬라이더 |
| `volume_hyper_sensitive` | 5 | 과민 감도 슬라이더 |
| `volume_tiny_hitbox` | 5 | 극소 터치 영역 |
| `volume_hidden_icon` | 5 | 아이콘 안에 숨겨진 컨트롤 |
| `volume_reverse_mapping` | 5 | 역방향 매핑 |
| `volume_random_jump` | 5 | 랜덤 점프 노브 |
| `volume_circular_gesture` | 5 | 원형 다이얼 |
| `volume_puzzle_lock` | 5 | 퍼즐 잠금 해제 필요 |
| `volume_physics_launcher` | 5 | 물리 발사 메커닉 |
| `volume_voice_shout` | 5 | 소리 지르기 시뮬레이션 |

**렌더러**: `VolumeControlStage` 1개로 10개 타입 통합 처리 (mode 파라미터)

### Web Hell (40 levels)

실서비스/웹의 나쁜 UX 패턴을 브랜드명 없이 아키타입으로 재현합니다.

| StageType | Levels | 패턴 |
|-----------|--------|------|
| `endless_wizard_flow` | 7 | 끝없는 마법사 폼 |
| `government_portal_popups` | 4 | 관공서 포털 팝업 지옥 |
| `nav_ambiguity_map` | 8 | 네비게이션 혼란 |
| `enterprise_filter_overload` | 4 | 필터 과부하 |
| `clutter_find_cta` | 9 | 정보 과부하 CTA 찾기 |
| `chaotic_layout_scavenger` | 8 | 혼란한 레이아웃 |

**렌더러**: 3개 (`WizardFlowStage`, `NavMazeStage`, `ClutterFinderStage`)

## 난이도 분포

| Difficulty | Label | Count |
|-----------|-------|-------|
| 1 | Very Easy | 13 |
| 2 | Easy | 20 |
| 3 | Normal | 20 |
| 4 | Hard | 20 |
| 5 | Very Hard | 17 |

## 데이터 파일

- `apps/src/stages/stages.v3.json` — 90개 스테이지 데이터
- `scripts/generate-v3-pack.js` — 생성 스크립트

## 안전 레일

- SIMULATION 배지: 광고처럼 보이는 요소에는 시뮬레이션 표시
- 외부 이동 없음: 모든 상호작용은 스테이지 내부에서만
- 브랜드명 없음: 아키타입 이름만 사용
- 즉시 종료 가능: 앱 쉘에서 언제든 quit/home/back

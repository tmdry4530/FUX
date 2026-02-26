# UX Hell Pack Ruleset (101 refs x 3 variants = 303 stages)
> 목적: `uxhell.references.json`(레퍼런스 원장)을 **결정적(deterministic)** 으로 `StageSpec` 스테이지 팩으로 변환해서, 앱에 대량 콘텐츠(300+ 레벨)를 안정적으로 공급한다.
> 타겟: Claude Code / 코딩 에이전트(자동 생성 + 검증 + 등록)

---

## 0) 핵심 원칙

### 0.1 "레퍼런스는 많은데 렌더러는 적게"
- 레퍼런스 101개 x 3 variants = **303개 스테이지**를 **14개 렌더러(26개 타입명)**로 처리.
- *레벨은 데이터*, *코드는 템플릿*.

### 0.2 3-Variant 시스템
- 각 레퍼런스에서 **easy/normal/hard** 3개 variant 생성.
- variant마다 **다른 렌더러 타입**, **다른 난이도**, **다른 시간 제한**, **스케일된 params** 적용.
- 동일 레퍼런스라도 3개 스테이지가 완전히 다른 경험을 제공.

### 0.3 결정적 생성
- `hashStr(refId)` 기반 결정적 PRNG: 같은 입력이면 항상 같은 출력.
- `Math.random()` 사용 금지.

### 0.4 앱 쉘은 정상, 지옥은 스테이지 내부 시뮬레이션
- Home/StageList/Result/Settings는 정상 UX.
- Quit/Home은 항상 보이게.

---

## 1) 입력 데이터: uxhell.references.json

경로: `apps/src/content/uxhell/uxhell.references.json`

```ts
type UxHellReference = {
  id: string;              // "uxref_001_volume_hover_slider" 등
  title: string;
  url: string;
  sourceTag: string;       // "reddit/r/badUIbattles" 등
  archetype: string;       // 분류 키 (13종)
  patternTags: string[];
  kind: "community" | "internal" | "external_bonus";
}
```

`kind === "external_bonus"`인 항목은 생성에서 제외됨.

---

## 2) Archetype -> Stage Type 매핑 (13 archetype -> 26 types)

각 archetype에 **여러 개의 stage type pool**이 매핑됨. variant별로 pool에서 다른 타입을 선택하여 같은 레퍼런스라도 다른 렌더러를 사용.

| Archetype | Type Pool (일부) | Pool 크기 |
|-----------|-----------------|-----------|
| volume_hell | volume_hover_slider, volume_hyper_sensitive, volume_tiny_hitbox, ... | 10 |
| slider_hell | volume_hover_slider, volume_hyper_sensitive, volume_tiny_hitbox, ... | 5 |
| scroll_hell | endless_wizard_flow, nav_ambiguity_map, chaotic_layout_scavenger, ... | 6 |
| form_input_hell | consent_toggle_labour, label_ambiguity, state_feedback_broken | 3 |
| dropdown_hell | picker_no_search, label_ambiguity, enterprise_filter_overload, ... | 6 |
| auth_hell | roach_motel_flow, hidden_reject_link, consent_toggle_labour, ... | 11 |
| captcha_hell | disguised_cta_grid, clutter_find_cta, tiny_button, ... | 11 |
| color_theme_hell | state_feedback_broken, label_ambiguity | 2 |
| cursor_hell | moving_target, tiny_button, volume_tiny_hitbox, ... | 7 |
| date_time_hell | picker_no_search, label_ambiguity, endless_wizard_flow, ... | 16 |
| keyboard_hell | label_ambiguity, consent_toggle_labour, state_feedback_broken, ... | 7 |
| physics_target_hell | volume_physics_launcher | 1 |
| misc_hell | modal_stack, clutter_find_cta, chaotic_layout_scavenger, ... | 10 |

### 26개 타입 -> 14개 렌더러 매핑 (register.tsx)

| 렌더러 | 처리하는 타입 |
|--------|-------------|
| VolumeControlStage | volume_hover_slider, volume_hyper_sensitive, volume_tiny_hitbox, volume_hidden_icon, volume_reverse_mapping, volume_random_jump, volume_circular_gesture, volume_puzzle_lock, volume_physics_launcher, volume_voice_shout |
| WizardFlowStage | endless_wizard_flow, roach_motel_flow, government_portal_popups |
| ClutterFinderStage | clutter_find_cta, chaotic_layout_scavenger, disguised_cta_grid |
| NavMazeStage | nav_ambiguity_map, enterprise_filter_overload |
| PickerNoSearch | picker_no_search |
| LabelAmbiguity | label_ambiguity |
| ConsentToggleLabour | consent_toggle_labour |
| ModalStack | modal_stack |
| HiddenRejectLink | hidden_reject_link |
| StateFeedbackBroken | state_feedback_broken |
| MovingTarget | moving_target |
| TinyButton | tiny_button |
| CurlingStone | curling_stone |

---

## 3) 3-Variant 생성 규칙

### 3.1 ID 규칙
```
{ref.id}_{variant}
```
예: `uxref_001_volume_hover_slider_easy`, `uxref_001_volume_hover_slider_normal`, `uxref_001_volume_hover_slider_hard`

### 3.2 타입 선택 (variant별 다른 렌더러)
```ts
function pickStageTypeForVariant(archetype, refId, variant) {
  const pool = ARCHETYPE_TO_STAGE_TYPES[archetype];
  const hash = hashStr(refId);
  const variantOffset = { easy: 0, normal: 1, hard: 2 }[variant];
  return pool[(hash + variantOffset) % pool.length];
}
```

### 3.3 난이도 산정
```
base = ARCHETYPE_DIFFICULTY[archetype]  // 2~4
variant offset: easy=-1, normal=0, hard=+1
final = clamp(base + offset, 1, 5)
```

Archetype별 base difficulty:
| Archetype | Base |
|-----------|------|
| scroll_hell, form_input_hell, dropdown_hell, date_time_hell | 2 |
| volume_hell, slider_hell, captcha_hell, color_theme_hell, keyboard_hell, misc_hell | 3 |
| auth_hell, cursor_hell, physics_target_hell | 4 |

### 3.4 시간 제한
```
base time: d1=35s, d2=30s, d3=25s, d4=20s, d5=15s
variant bonus: easy=+10s, normal=0, hard=-5s
min = 10s
```

### 3.5 Params 스케일링 (scaleParams)

| Param | Easy | Hard |
|-------|------|------|
| clutterItems | x0.6 (min 10) | x1.5 |
| stepCount | -2 (min 3) | +3 |
| layers | -2 (min 2) | +3 (max 12) |
| toggleCount | x0.5 (min 3) | x1.8 |
| dialogCount | -1 (min 2) | +2 (max 10) |
| tolerance | +3 (max 15) | -2 (min 1) |
| linkOpacity | +0.1 (max 0.4) | -0.05 (min 0.03) |
| visualSizePx | +6 (max 30) | -4 (min 5) |
| hitSizePx | +4 (max 25) | -3 (min 2) |
| speedPxPerSec | x0.6 (min 30) | x1.6 |

Hard variant 추가:
- `wrongCloseAddsLayer = true`
- `shuffleOnMiss = true`

### 3.6 Objective 선택
- archetype당 7개 objective 템플릿 pool
- `hashStr(refId + '_' + variant)` 기반 선택으로 variant마다 다른 objective

### 3.7 ExplainWhyBad 선택
- archetype당 5개 설명 pool
- `hashStr(refId)` 기반 (variant 간 동일)

---

## 4) 생성 파이프라인

### 4.1 파일 구조
```
apps/
  src/content/uxhell/
    uxhell.references.json    # 원장 (101개)
    archetype-map.ts          # ARCHETYPE_TO_STAGE_TYPE 매핑
  stages/
    stages.uxhell.json        # 생성물 (303개)
  scripts/
    gen-uxhell-stages.ts      # 생성기
    validate-stages.ts        # 검증기
```

### 4.2 실행
```bash
npx tsx apps/scripts/gen-uxhell-stages.ts      # 생성
npx tsx apps/scripts/validate-stages.ts        # 검증
```

### 4.3 검증 항목
- id 중복 검사
- type이 register.tsx에 등록되어 있는지 확인
- 필수 params 누락 여부
- JSON parse 정상 여부

---

## 5) 앱 등록

### 5.1 StageList (StageListScreen.tsx)
- `stages.uxhell.json`을 import하여 allStages에 포함
- v3 -> v2 -> uxhell -> legacy 순으로 통합

### 5.2 StagePlay lookup (findStage.ts)
- v3 -> v2 -> uxhell -> legacy 순으로 스테이지 검색
- `decodeURIComponent` + `trim` + `normalize` 처리

### 5.3 Collection (useCollection.ts)
- uxhell 스테이지를 총 스테이지 수에 포함 (349 = 46 + 303)

---

## 6) 현재 통계 (303 stages)

| 항목 | 값 |
|------|-----|
| 총 레퍼런스 | 101 |
| 생성 스테이지 | 303 (101 x 3) |
| 고유 타입 | 26 |
| 고유 objective | 80 |
| 렌더러 | 14 |
| 난이도 분포 | d1:32, d2:82, d3:101, d4:69, d5:19 |
| 빈 params | 0 |

---

## 7) 운영 팁 (난이도 튜닝)

- VolumeControl hard: sensitivity 2.0+, tolerance 2-3, jitterPx 15+
- PickerNoSearch hard: 국가 목록(170+개), 시간대(40개) 등 대형 pool
- ClutterFinder hard: clutterItems 60+, scrollHeight 4000+
- NavMaze hard: menuDepth 7+, misleadingMenus 5+, hiddenApplyButton true
- ModalStack hard: layers 10+, wrongCloseAddsLayer true
- HiddenRejectLink hard: linkOpacity 0.03-0.05
- TinyButton hard: visualSizePx 5-8, hitSizePx 2-4, shuffleOnMiss true
- MovingTarget hard: speedPxPerSec 250+, jitterPx 25+

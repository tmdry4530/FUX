# UX_HELL_REFERENCES 등록/생성 가이드 (FUX용)

이 문서는 `uxhell.references.json`(레퍼런스 라이브러리)을 **스테이지 팩(Stage Pack)** 으로 변환/등록하기 위한 “코딩 에이전트용” 작업 지침서입니다.

> 목표: 레딧/커뮤니티에서 검증(?)된 “UX 지옥 패턴” 레퍼런스들을 **데이터 기반**으로 관리하고, 스테이지 JSON을 자동 생성해 `StageList`에 노출한다.

---

## 0) 파일 배치 (권장)

- `apps/src/content/uxhell/uxhell.references.json`  
  - 레퍼런스 원장(100 + bonus)
- `apps/src/content/uxhell/archetype-map.ts`  
  - archetype → stageType 매핑 + 기본 파라미터 템플릿
- `apps/src/stages/stages.uxhell.json`  
  - **생성물**(커밋 대상): 실제 플레이 가능한 StageSpec 배열
- `scripts/gen-uxhell-stages.ts`  
  - 레퍼런스 → StageSpec 변환기(단방향)
- `docs/UX_HELL_REFERENCES.md`  
  - 이 문서

---

## 1) 레퍼런스 스키마

```ts
export type UxHellReference = {
  id: string;                 // 안정적인 키 (URL/제목 슬러그 기반)
  title: string;              // 화면/문서에 표시할 타이틀
  url?: string | null;        // 원문 링크 (외부 열기/개발 참고용)
  sourceTag: string;          // analytics/분석용 (ex: "reddit/r/badUIbattles")
  archetype: string;          // 변환기의 핵심 분류 키
  patternTags: string[];      // 변환 보조 태그(0~6개 권장)
  kind: "community" | "internal" | "external_bonus";
}
```

**주의**
- `id`는 한번 배포되면 웬만하면 바꾸지 않는다(분석/딥링크/결과 공유 카드 안정성).
- `url`은 “개발 참고” 목적. 실제 앱 UX에서 외부 링크를 노출할지 여부는 정책에 맞춰 결정.

---

## 2) archetype → stageType 매핑

`apps/src/content/uxhell/archetype-map.ts`에 실제 등록된 stageType 풀로 매핑합니다.

```ts
export const ARCHETYPE_TO_STAGE_TYPES: Record<string, string[]> = {
  volume_hell: [
    'volume_hover_slider', 'volume_hyper_sensitive', 'volume_tiny_hitbox',
    'volume_hidden_icon', 'volume_reverse_mapping', 'volume_random_jump',
    'volume_circular_gesture', 'volume_puzzle_lock', 'volume_physics_launcher',
    'volume_voice_shout',
  ],
  slider_hell: ['volume_hover_slider', 'volume_hyper_sensitive', 'volume_tiny_hitbox'],
  scroll_hell: ['nav_ambiguity_map', 'endless_wizard_flow'],
  form_input_hell: ['consent_toggle_labour', 'label_ambiguity'],
  dropdown_hell: ['picker_no_search'],
  auth_hell: ['roach_motel_flow', 'hidden_reject_link'],
  captcha_hell: ['disguised_cta_grid', 'clutter_find_cta'],
  color_theme_hell: ['state_feedback_broken'],
  cursor_hell: ['moving_target', 'tiny_button'],
  date_time_hell: ['picker_no_search', 'label_ambiguity'],
  keyboard_hell: ['label_ambiguity', 'consent_toggle_labour'],
  physics_target_hell: ['volume_physics_launcher', 'moving_target'],
  misc_hell: ['modal_stack', 'clutter_find_cta', 'chaotic_layout_scavenger', 'disguised_cta_grid'],
};
```

각 archetype은 **풀(pool)**을 가지며, `pickStageType(archetype, referenceId)`로 deterministic하게 하나를 선택합니다.

### archetype별 매핑 테이블

| archetype | 레퍼런스 수 | 매핑 stageType 풀 |
|---|---|---|
| `date_time_hell` | 17 | `picker_no_search`, `label_ambiguity` |
| `volume_hell` | 15 | v3 volume 10종 전체 |
| `misc_hell` | 11 | `modal_stack`, `clutter_find_cta`, `chaotic_layout_scavenger`, `disguised_cta_grid` |
| `captcha_hell` | 11 | `disguised_cta_grid`, `clutter_find_cta` |
| `auth_hell` | 11 | `roach_motel_flow`, `hidden_reject_link` |
| `keyboard_hell` | 7 | `label_ambiguity`, `consent_toggle_labour` |
| `cursor_hell` | 7 | `moving_target`, `tiny_button` |
| `scroll_hell` | 6 | `nav_ambiguity_map`, `endless_wizard_flow` |
| `dropdown_hell` | 6 | `picker_no_search` |
| `slider_hell` | 5 | `volume_hover_slider`, `volume_hyper_sensitive`, `volume_tiny_hitbox` |
| `form_input_hell` | 3 | `consent_toggle_labour`, `label_ambiguity` |
| `color_theme_hell` | 2 | `state_feedback_broken` |
| `physics_target_hell` | 1 | `volume_physics_launcher`, `moving_target` |

> archetype이 없거나 풀이 비어있으면 `modal_stack`으로 fallback.

---

## 3) 변환기(gen-uxhell-stages) 설계

### 3.1 기본 규칙

- 입력: `UxHellReference[]`
- 출력: `StageSpec[]` (기존 스키마 그대로)
- 보장:
  - `StageSpec.id` 유니크
  - `StageSpec.type`는 레지스트리에 존재(없으면 실패)
  - 생성 결과는 **결정적(deterministic)** (같은 입력 → 같은 출력)

### 3.2 StageSpec에 반드시 심을 메타데이터

- `sourceTag`: reference.sourceTag
- `patternTag`: (가능하면) reference.archetype 또는 `patternTags[0]`
- `referenceId`: reference.id (분석/디버깅용)

> 이미 analytics 이벤트에 `sourceTag/patternTag`가 있다면 그대로 재사용.

### 3.3 난이도(difficulty) 산정(간단 버전)

- 기본: archetype별 base difficulty
- 가중: `patternTags`에 따라 +1/-1  
  - 예: `atomic`, `binary-search`, `infinite`, `logarithmic`, `fleeing` 포함 시 +1

### 3.4 예시 변환(의사코드)

```ts
import refs from "../apps/src/content/uxhell/uxhell.references.json";
import { pickStageType } from "../apps/src/content/uxhell/archetype-map";

function toStageSpec(ref: UxHellReference, idx: number): StageSpec {
  const type = pickStageType(ref.archetype, ref.id);

  return {
    id: `uxhell_${String(idx + 1).padStart(3, "0")}_${ref.id}`,
    type,
    title: ref.title,
    description: `Inspired by ${ref.sourceTag}`,
    sourceTag: ref.sourceTag,
    patternTag: ref.patternTags?.[0] ?? ref.archetype,
    meta: { referenceId: ref.id, url: ref.url, archetype: ref.archetype, kind: ref.kind },
    config: makeConfig(type, ref), // DEFAULT_CONFIG + tag-based knobs
  };
}

const stages = refs
  .filter(r => r.kind !== "external_bonus") // X 링크 등은 제외하거나 별도 처리
  .map(toStageSpec);

validate(stages); // id/type 중복/미등록 renderer 체크
writeJson("apps/src/stages/stages.uxhell.json", stages);
```

---

## 4) “Stage를 찾을 수 없음” 재발 방지 체크

생성/런타임에서 둘 다 막는다.

### 4.1 빌드 타임 체크 (권장)

- `scripts/validate-stages.ts` 추가
- 검증 항목:
  1) `id` 중복
  2) `type`이 `renderers/register.ts`에 등록되어 있는지
  3) 필요한 `config` 필드 존재 여부(최소 스키마)

### 4.2 런타임 fail-safe

- `StageRenderer`에서:
  - renderer가 없으면 **FallbackStage**로 라우팅(“Stage missing” + refId 표시)
  - analytics에 `stage_missing` 이벤트 전송(원인 추적)

---

## 5) Curling Stone Lock (보너스 스테이지) 등록 예시

`curlingStone` 렌더러가 없다면 새로 추가하고, 이미 있는 “physics/launch” 계열 렌더러가 있다면 그걸 재사용.

```json
{
  "id": "uxhell_bonus_curling_stone_lock_001",
  "type": "curlingStone",
  "title": "Curling Lock Screen",
  "description": "스톤을 밀어서 중앙 원에 정착시키면 잠금 해제 (3회 안에)",
  "sourceTag": "internal/idea",
  "patternTag": "curling",
  "meta": { "referenceId": "uxref_bonus_curling_stone_lock" },
  "config": {
    "attempts": 3,
    "stoneRadius": 14,
    "targetRadius": 18,
    "successRadius": 8,
    "friction": 0.985,
    "maxPower": 1.2,
    "wind": 0.03,
    "fakeAssist": false
  }
}
```

---

## 6) 정책/안전 가드레일 (게임이라도 최소)

- 광고(IAA)와 상호작용 UI를 “헷갈리게” 붙여서 **오클릭 유도**하는 패턴은 금지(심사 리스크 큼).
- 항상 **즉시 종료/뒤로가기**가 가능해야 함(“진짜 잠금”처럼 시스템 UI를 막지 않기).
- 레퍼런스는 “영감”만: 원문 이미지/영상/아트 에셋을 그대로 복제하지 않는다.

---

## 7) 운영 플로우 (추천)

1) `uxhell.references.json`에 레퍼런스 추가/수정  
2) `npm run gen:uxhell` (stages.uxhell.json 재생성)  
3) `npm run build` + 스테이지 목록/플레이 전수 스모크 테스트  
4) “stage missing” 0건 확인  
5) 커밋

끝.

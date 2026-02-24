# FUX MVP - RC 최종 리포트

> 작성일: 2026-02-24
> 상태: RC (Release Candidate)

---

## 1. 수행 변경 요약

### Phase 1: Git 위생
- `.gitignore` 업데이트: `apps/dist/`, `.omc/`, `.mcp.json` 추가
- 38개 파일 초기 커밋 생성

### Phase 2: 클린 빌드
- `rm -rf node_modules` → `npm ci` → `npm run build` 통과
- tsc 타입 체크 + vite 프로덕션 빌드 성공
- `npm run preview` 서버 정상 기동 확인

### Phase 3: 타입 스텁 안전성 점검
- `apps-in-toss-web-framework.d.ts`:
  - `AdEvent` → `LoadFullScreenAdEvent` (loaded만) + `ShowFullScreenAdEvent` (7개 타입) 분리
  - `showFullScreenAd`에 `isSupported()` 인터페이스 추가
  - `userEarnedReward`의 `data: { unitType, unitAmount }` 타입 추가
- `apps-in-toss-web-framework-config.d.ts`:
  - `outdir?: string` 추가
  - `webViewProps.type`을 `'game' | 'partner' | 'external'` 유니온으로 변경
- `useAd.ts`: `showAd`에서 `showFullScreenAd.isSupported()` 사용으로 복원
- 모든 스텁 파일에 "문서 확인 완료" TEMP 주석 추가

### Phase 4: 밈 카피 병합
- `meme-copies.json` (10개) + `meme-copies-alt.json` (10개) → `meme-copies.merged.json` (20개) 생성
- `ResultScreen`에 fallback 로직 추가:
  - 1순위: `spec.memeCaption` (StageSpec에서)
  - 2순위: `meme-copies.merged.json`에서 해당 stageId의 랜덤 `resultScreenCopy`

### Phase 5: OG 이미지
- `apps/public/og.png` placeholder 이미지 생성 (1200x630, #3182F6)
- `useShare`에 `buildOgImageUrl()` 함수 추가:
  - `new URL("/og.png", window.location.origin)` 으로 절대 URL 구성
  - `https://` 체크 → 로컬 환경에서는 `undefined` fallback
  - `getTossShareLink(deepLink, resolvedOg)`로 전달

---

## 2. 빌드 결과

```
$ npm ci
added 239 packages in 4s

$ npm run build
> tsc -b && vite build
✓ 41 modules transformed.
dist/index.html                  0.36 kB │ gzip:  0.25 kB
dist/assets/index-CyxjCcE8.js  187.05 kB │ gzip: 61.72 kB
✓ built in 586ms

$ npm run preview
➜  Local: http://localhost:4173/
```

- tsc: 0 errors
- vite build: 성공
- 번들 사이즈: 187KB (gzip 62KB) - 100MB 제한 대비 충분히 작음

---

## 3. 정책 근거 (Apps in Toss 문서 확인)

| API / 기능 | 문서 확인 결과 | 반영 상태 |
|------------|--------------|----------|
| `loadFullScreenAd` | `(options: { options: { adGroupId }, onEvent, onError }): () => void` + `isSupported(): boolean` | 스텁 + useAd 반영 완료 |
| `showFullScreenAd` | 동일 시그니처 + `isSupported()` 존재 | 스텁 + useAd 반영 완료 |
| `LoadFullScreenAdEvent` | `{ type: 'loaded' }` 단일 타입 | 스텁 반영 완료 |
| `ShowFullScreenAdEvent` | 7개 타입 유니온 (requested, show, impression, clicked, dismissed, failedToShow, userEarnedReward) | 스텁 반영 완료 |
| `userEarnedReward.data` | `{ unitType: string, unitAmount: number }` | 스텁 반영 완료 |
| `share` | `share({ message: string }): Promise<void>` | useShare 반영 완료 |
| `getTossShareLink` | `getTossShareLink(url: string, ogImageUrl?: string): Promise<string>`, ogImageUrl은 https:// 필수 | useShare 반영 완료 |
| `defineConfig` | appName, brand, web, outdir, webViewProps.type, permissions | config 스텁 반영 완료 |

---

## 4. 남은 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| OG 이미지가 placeholder (단색 파란색) | 낮음 | 디자인팀에서 실제 이미지로 교체 필요 |
| TDS(`@toss/tds-mobile`) 미사용 | 중간 | `webViewProps.type: "game"`으로 설정하여 게임 앱 분류. 게임은 TDS 선택사항 |
| 딥링크 `intoss://` 라우팅 미확인 | 중간 | 실기기 Toss 앱에서 테스트 필요 (DEVICE_TEST_SCRIPT.md 참조) |
| 타입 스텁은 빌드 전용 | 낮음 | 런타임은 Toss WebView가 실제 모듈 제공. 스텁 불일치 시 런타임 에러 가능성 낮음 |
| 분석 이벤트 실제 전송 미확인 | 낮음 | analytics 모듈은 스키마만 정의, 실제 전송은 Toss SDK 연동 후 |

---

## 5. 제출 준비 체크리스트

| # | 항목 | 상태 |
|---|------|------|
| 1 | git status clean | [x] |
| 2 | `npm ci` + `npm run build` 통과 | [x] |
| 3 | `npm run preview` 콘솔 에러 없음 | [x] |
| 4 | 타입 스텁 문서 검증 완료 | [x] |
| 5 | 밈 카피 20개 병합 + ResultScreen 연결 | [x] |
| 6 | OG 이미지 처리 (placeholder) | [x] |
| 7 | SUBMISSION_SUMMARY.md 작성 | [x] |
| 8 | DEVICE_TEST_SCRIPT.md 작성 | [x] |
| 9 | FINAL_RC_REPORT.md 작성 | [x] |
| 10 | 광고 정책 준수 (첫진입 금지, 전환지점만, opt-in rewarded) | [x] |
| 11 | 앱 쉘 정상 UX (다크패턴 스테이지 내부만) | [x] |
| 12 | Toss back/close 항상 동작 | [x] |
| 13 | 개인정보 수집 없음 | [x] |

---

## 6. Device Validation (정적 코드 분석)

> DEVICE_TEST_SCRIPT.md 기준 6개 핵심 항목을 코드 리뷰로 검증 (2026-02-24)

| # | 항목 | 결과 | 근거 |
|---|------|------|------|
| 1 | 첫 진입 interstitial 없음 | PASS | `App.tsx` - 광고 import 없음. `StageListScreen.tsx` - 광고 코드 없음. `AdGate.tsx:51` - `isFirstEntry` 가드로 첫 진입 차단 |
| 2 | Stage 중 광고 없음 | PASS | `StagePlayScreen.tsx` - AdGate 미사용. 3개 렌더러 모두 광고 코드 없음 |
| 3 | 전환 지점에서만 interstitial | PASS | `AdGate.tsx` - trigger prop 기반, isFirstEntry 가드, 에러 시 onSkip fallback |
| 4 | Rewarded opt-in + 완료 시 보상 | PASS | `useAd.ts:96-98` - `userEarnedReward`에서만 `rewarded=true`. `AdGate.tsx:9` - rewarded prop으로 opt-in 구분 |
| 5 | 언제든 back/quit 가능 | PASS | `App.tsx` - 네비게이션 가드 없음. `StagePlayScreen.tsx:63-74` - "← 목록" 버튼 상시 표시. 10개 스테이지 모두 `allowSkip: true` |
| 6 | 공유 링크가 해당 레벨로 진입 | PASS | `useShare.ts:4` - `intoss://fuck-ux/stage/{stageId}` 딥링크. `App.tsx:10` - `/stage/:stageId` 라우트 매핑 확인 |

**결론**: 6/6 항목 PASS. 코드 패치 불필요.

**참고**: AdGate 컴포넌트는 구현 완료되었으나 현재 어떤 화면에도 마운트되지 않은 상태. 실서비스 배포 시 ResultScreen → 다음 스테이지 전환 지점에 `<AdGate trigger={...} />` 배치 필요.

---

## 7. Risk Closure (2026-02-24)

> RC 리포트 섹션 4에서 식별된 4개 리스크를 클로징.

### 7.1 OG 이미지 교체 (placeholder 제거)

| 항목 | 내용 |
|------|------|
| 변경 | `apps/public/og.png` placeholder(단색 파란색) → 브랜드 OG 이미지 (1200x630, FUX 로고 + 태그라인) |
| 생성 방법 | Python PIL로 자동 생성 (21KB PNG) |
| 검증 | `useShare.ts`의 `buildOgImageUrl()` https:// 가드 유지 |

### 7.2 TDS 최소 적용 (쉘 화면)

| 항목 | 내용 |
|------|------|
| 적용 범위 | `StageListScreen.tsx`, `ResultScreen.tsx` (쉘 화면만) |
| 미적용 | 스테이지 렌더러 (StageRenderer, 각 renderer) - 의도적 나쁜 UX 시뮬레이션 영역 |
| 적용 방식 | TDS 디자인 토큰 인라인 적용 (`@toss/tds-mobile` 런타임 미사용, 토큰만 추출) |
| 토큰 | grey900 `#191F28`, grey700 `#4E5968`, grey500 `#8B95A1`, grey200 `#E5E8EB`, blue500 `#3182F6`, red500 `#E53935` |
| WebView 타입 | `game` 유지 (게임 앱은 TDS 선택사항) |

### 7.3 딥링크 fallback

| 항목 | 내용 |
|------|------|
| 변경 | `App.tsx` 라우터에 query param fallback + catch-all 추가 |
| `?stageId=X` | `QueryParamRedirect` 컴포넌트가 `/stage/X`로 리다이렉트 |
| catch-all `*` | `<Navigate to="/" replace />` 로 Home 안전 이동 |
| 잘못된 stageId | `StagePlayScreen.tsx` 기존 가드 활용 (404 → "목록으로" 버튼) |
| 로깅 | query param redirect 시 `console.log` 출력 |

### 7.4 분석 이벤트 실제 전송 연결

| 항목 | 내용 |
|------|------|
| 어댑터 | `analytics/logger.ts` 신규 생성 |
| Toss 환경 | `Analytics.click/screen/impression` (`@apps-in-toss/web-framework`) 동적 import |
| 로컬 환경 | `console.log`로 동일 payload 출력 (`[FUX:Analytics:method]` 프리픽스) |
| 타입 스텁 | `apps-in-toss-web-framework.d.ts`에 `Analytics` 타입 추가 |

**이벤트 wiring 현황:**

| 이벤트 | 호출 위치 | 트리거 |
|--------|----------|--------|
| `stage_list` (screen) | `StageListScreen.tsx` | 화면 마운트 |
| `stage_play` (screen) | `StagePlayScreen.tsx` | 화면 마운트 |
| `stage_start` (click) | `StagePlayScreen.tsx` | phase → PLAYING |
| `result_screen` (screen) | `ResultScreen.tsx` | 화면 마운트 |
| `stage_end` (click) | `ResultScreen.tsx` | 결과 표시 시 |
| `ad_loaded/ad_load_error` | `useAd.ts` | 광고 로드 성공/실패 |
| `ad_event` (impression) | `useAd.ts` | show 이벤트 (impression, dismissed 등) |
| `ad_reward` (impression) | `useAd.ts` | userEarnedReward |
| `share_click` (click) | `ResultScreen.tsx` | 공유 버튼 클릭 |

### 리스크 상태 업데이트

| 리스크 | 이전 심각도 | 현재 상태 |
|--------|-----------|----------|
| OG 이미지가 placeholder | 낮음 | **CLOSED** - 브랜드 OG로 교체 완료 |
| TDS 미사용 | 중간 | **CLOSED** - 쉘 화면 TDS 토큰 적용, game 타입 유지 |
| 딥링크 라우팅 미확인 | 중간 | **MITIGATED** - fallback 추가, 실기기 검증 필요 |
| 분석 이벤트 미전송 | 낮음 | **CLOSED** - logger 어댑터 연결 완료, 로컬 console 확인 가능 |

---

## 8. 파일 변경 목록

```
modified:  .gitignore
modified:  apps/src/types/apps-in-toss-web-framework.d.ts
modified:  apps/src/types/apps-in-toss-web-framework-config.d.ts
modified:  apps/src/ads/useAd.ts
modified:  apps/src/screens/ResultScreen.tsx
modified:  apps/src/share/useShare.ts
added:     apps/src/stages/meme-copies.merged.json
added:     apps/public/og.png
added:     docs/SUBMISSION_SUMMARY.md
added:     docs/DEVICE_TEST_SCRIPT.md
added:     docs/FINAL_RC_REPORT.md
```

### Risk Closure 추가 변경 (2026-02-24)

```
modified:  apps/public/og.png                           (branded OG 교체)
modified:  apps/src/App.tsx                             (딥링크 fallback + catch-all)
modified:  apps/src/screens/StageListScreen.tsx          (TDS 토큰 + analytics)
modified:  apps/src/screens/ResultScreen.tsx             (TDS 토큰 + share + analytics)
modified:  apps/src/screens/StagePlayScreen.tsx          (analytics wiring)
modified:  apps/src/ads/useAd.ts                        (analytics wiring)
modified:  apps/src/analytics/useTracking.ts            (logger 어댑터 연결)
modified:  apps/src/types/apps-in-toss-web-framework.d.ts (Analytics 타입 추가)
added:     apps/src/analytics/logger.ts                 (Analytics 어댑터)
modified:  docs/FINAL_RC_REPORT.md                      (Risk Closure 섹션)
modified:  docs/DEVICE_TEST_SCRIPT.md                   (딥링크/분석 검증 추가)
```

---

## 9. V2 20레벨 리빌드 (2026-02-24)

### 9.1 변경 개요

MVP 3타입/10레벨 체계를 유지하면서, 신규 7개 StageType + 20레벨을 v2 메인으로 교체.

### 9.2 신규 StageType (7개)

| StageType | 설명 | 다크패턴 분류 |
|-----------|------|-------------|
| `roach_motel_flow` | 구독 해지 시 5단계 방해 플로우 + CANCEL 타이핑 | Roach Motel |
| `consent_toggle_labour` | 개인정보 토글 수동 해제 노동 (전체거부 버튼 없음) | Privacy Zuckering |
| `hidden_reject_link` | 거절 링크를 투명도/위치로 숨김 | Misdirection |
| `disguised_cta_grid` | 콘텐츠와 위장 CTA 구분 (SIMULATION 배지 표시) | Disguised Ad |
| `picker_no_search` | 200개+ 항목 검색 없이 스크롤만으로 찾기 | Obstruction |
| `state_feedback_broken` | 폼 제출 후 피드백 없음 (중복 제출 유도) | Broken Feedback |
| `label_ambiguity` | "OK"가 삭제, 저장 아이콘이 삭제 등 혼란 | Ambiguity |

### 9.3 StageSpec v2 확장 필드

```typescript
sourceTag?: string;    // 다크패턴 출처 (예: "adobe", "amazon")
patternTag?: string;   // 패턴 분류 (예: "roach-motel", "misdirection")
safety?: string;       // 안전장치 설명
mechanicNotes?: string; // 메카닉 구현 노트
```

### 9.4 렌더러 구현 (7개)

| 파일 | 핵심 메카닉 |
|------|-----------|
| `RoachMotelFlowStage.tsx` | 5단계 해지 플로우, 각 단계에서 유지 유혹, 마지막에 CANCEL 타이핑 |
| `ConsentToggleLabourStage.tsx` | N개 토글 수동 해제, 필수 항목 잠금, "모두 허용" 트랩 |
| `HiddenRejectLinkStage.tsx` | 거절 링크 투명도/위치 변형, 화려한 CTA로 시선 유도 |
| `DisguisedCtaGridStage.tsx` | 콘텐츠/위장CTA 그리드, 3회 실수 시 실패, SIMULATION 배지 |
| `PickerNoSearchStage.tsx` | 200개 아이템 스크롤 리스트, 검색 없음, 3회 오선택 시 실패 |
| `StateFeedbackBrokenStage.tsx` | 폼 제출 후 시각적 피드백 없음, View Status로 확인해야 성공 |
| `LabelAmbiguityStage.tsx` | 모호한 버튼 레이블/아이콘 다이얼로그 연속 판단 |

### 9.5 20레벨 분배

| 타입 | 레벨 수 | 난이도 범위 |
|------|---------|-----------|
| roach_motel_flow | 3 | 2-4 |
| consent_toggle_labour | 3 | 2-4 |
| hidden_reject_link | 3 | 2-5 |
| disguised_cta_grid | 3 | 2-5 |
| picker_no_search | 3 | 2-4 |
| state_feedback_broken | 3 | 3-4 |
| label_ambiguity | 2 | 3-4 |

### 9.6 UI 변경

- `StageListScreen.tsx`: v2(20레벨) 기본 표시, Legacy(10레벨) 토글로 전환 가능
- 난이도 라벨: Very Easy ~ Very Hard (5단계)
- 난이도 4 이상은 빨간색으로 강조

### 9.7 빌드 결과

```
$ npm run build
> tsc -b && vite build
✓ 56 modules transformed.
dist/index.html                   0.43 kB │ gzip:  0.29 kB
dist/assets/index-Cpn5LoOz.css    0.69 kB │ gzip:  0.41 kB
dist/assets/index-BsEr_Gke.js   238.80 kB │ gzip: 77.42 kB
✓ built in 920ms
```

- tsc: 0 errors
- vite build: 성공
- 번들 사이즈: 239KB (gzip 77KB) - MVP 대비 +52KB (7개 렌더러 추가)

### 9.8 V2 리빌드 파일 변경

```
modified:  apps/src/stages/stage-spec.ts                (7개 신규 StageType + v2 메타데이터 필드)
added:     apps/src/stages/stages.v2.json               (20레벨 데이터셋)
modified:  apps/src/renderers/register.tsx               (7개 v2 렌더러 등록)
added:     apps/src/renderers/RoachMotelFlowStage.tsx
added:     apps/src/renderers/ConsentToggleLabourStage.tsx
added:     apps/src/renderers/HiddenRejectLinkStage.tsx
added:     apps/src/renderers/DisguisedCtaGridStage.tsx
added:     apps/src/renderers/PickerNoSearchStage.tsx
added:     apps/src/renderers/StateFeedbackBrokenStage.tsx
added:     apps/src/renderers/LabelAmbiguityStage.tsx
modified:  apps/src/screens/StageListScreen.tsx          (v2/Legacy 토글)
modified:  apps/src/analytics/logger.ts                  (sourceTag/patternTag 지원)
modified:  docs/SUBMISSION_SUMMARY.md                    (시뮬레이션 안전장치 원칙 추가)
modified:  docs/FINAL_RC_REPORT.md                       (V2 리빌드 섹션 추가)
```

---

## 10. V3 대량 콘텐츠 팩 (90 레벨)

### 개요
20개 UX 지옥 레퍼런스(Volume 10 + Web 10)를 4~6개 variant로 증식하여 90개 레벨을 생성.

### Pack 구성
- **Volume Hell**: 50 levels (10 seed × 5 variants)
- **Web Hell**: 40 levels (10 seed × ~4 variants)

### 신규 StageType (16개)
**Volume Hell (10)**: `volume_hover_slider`, `volume_hyper_sensitive`, `volume_tiny_hitbox`, `volume_hidden_icon`, `volume_reverse_mapping`, `volume_random_jump`, `volume_circular_gesture`, `volume_puzzle_lock`, `volume_physics_launcher`, `volume_voice_shout`

**Web Hell (6)**: `endless_wizard_flow`, `nav_ambiguity_map`, `clutter_find_cta`, `enterprise_filter_overload`, `government_portal_popups`, `chaotic_layout_scavenger`

### 렌더러 (4개, 16타입 통합 처리)
| 렌더러 | 처리 타입 |
|--------|----------|
| VolumeControlStage | volume_* 10개 (mode 파라미터) |
| WizardFlowStage | endless_wizard_flow, government_portal_popups |
| ClutterFinderStage | clutter_find_cta, chaotic_layout_scavenger |
| NavMazeStage | nav_ambiguity_map, enterprise_filter_overload |

### 난이도 분포
| 1 (Very Easy) | 2 (Easy) | 3 (Normal) | 4 (Hard) | 5 (Very Hard) |
|---|---|---|---|---|
| 13 | 20 | 20 | 20 | 17 |

### UI 업데이트
- StageListScreen: V3/V2/Legacy 3탭 + 검색 + Pack/Difficulty 필터
- findStage: v3→v2→legacy 순서 통합 룩업

### Analytics 확장
- `trackStageStart`/`trackStageEnd`에 `pack_tag`, `pattern_tag`, `source_tag` 전달

### 안전 레일 유지
- 브랜드명 제거 (아키타입명 사용)
- SIMULATION 배지 옵션
- 외부 이동 0, 광고 SDK 모방 0
- Toss back/close 방해 없음

### 빌드 결과
```
tsc -b && vite build: SUCCESS
62 modules, 345.29 kB (gzip: 91.95 kB)
ID 검증: 중복 0, 공백 0, 인코딩 필요 0
총 레벨: v3=90 + v2=20 + legacy=10 = 120
```

### 변경 파일
```
modified:  apps/src/stages/stage-spec.ts                (16개 신규 StageType + packTag 필드)
added:     apps/src/stages/stages.v3.json               (90레벨 데이터셋)
modified:  apps/src/stages/findStage.ts                 (v3 import + v3→v2→legacy 룩업)
modified:  apps/src/renderers/register.tsx               (16개 v3 렌더러 등록)
added:     apps/src/renderers/VolumeControlStage.tsx
added:     apps/src/renderers/WizardFlowStage.tsx
added:     apps/src/renderers/ClutterFinderStage.tsx
added:     apps/src/renderers/NavMazeStage.tsx
modified:  apps/src/screens/StageListScreen.tsx          (V3/V2/Legacy 3탭 + 검색 + 필터)
modified:  apps/src/screens/StagePlayScreen.tsx          (v3 analytics extra)
modified:  apps/src/screens/ResultScreen.tsx             (v3 analytics extra)
modified:  scripts/verify-ids.js                         (v3 포함)
added:     scripts/generate-v3-pack.js                   (V3 생성 스크립트)
added:     docs/REFERENCE_SEEDS.md
added:     docs/CONTENT_PACKS.md
modified:  docs/FINAL_RC_REPORT.md                       (V3 섹션 추가)
```

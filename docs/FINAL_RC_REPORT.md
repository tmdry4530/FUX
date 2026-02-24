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

## 6. 파일 변경 목록

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

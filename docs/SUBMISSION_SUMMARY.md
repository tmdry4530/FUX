# FUX - Bad UX Simulator 제출 요약서

> Apps in Toss 심사 제출용 요약 문서

---

## 1. 앱 목적

FUX(Fuck UX)는 **의도적으로 나쁜 UX 패턴을 시뮬레이션**하여 사용자에게 재미와 교육적 가치를 동시에 제공하는 게임형 미니앱입니다.

- **20개의 스테이지**(v2)에서 7가지 다크패턴 유형을 체험:
  - Roach Motel Flow (해지 방해), Consent Toggle Labour (동의 토글 노동), Hidden Reject Link (숨겨진 거절), Disguised CTA Grid (위장된 CTA), Picker No Search (검색 없는 선택기), State Feedback Broken (피드백 없는 폼), Label Ambiguity (모호한 레이블)
- 각 스테이지 클리어 후 **"왜 나쁜 UX인지"** 교육 콘텐츠를 제공
- 밈 카피와 공유 기능으로 바이럴 확산 유도
- Legacy 10레벨(v1: tiny_button, moving_target, modal_stack)도 토글로 접근 가능

---

## 2. 안전장치

| 항목 | 구현 상태 |
|------|-----------|
| 즉시 종료 가능 | Toss 뒤로가기/닫기 버튼이 항상 동작하며, 앱 쉘(Home/Settings)은 정상 UX 유지 |
| 스테이지 탈출 | 모든 스테이지에서 Skip 버튼 제공, 시간 제한 초과 시 자동 종료 |
| 시뮬레이션 표시 | `simulationBadge` 파라미터로 시뮬레이션임을 명시 |
| 교육적 맥락 | 결과 화면에서 `explainWhyBad`로 나쁜 UX 이유 설명 |
| 나쁜 UX 범위 | 스테이지 내부 시뮬레이션으로만 제한, 앱 쉘/네비게이션은 정상 |

### 2.1 시뮬레이션 게임 안전장치 원칙

1. **격리 원칙**: 나쁜 UX는 스테이지 렌더러 내부에만 존재. 앱 쉘(Home, Result, Settings)은 TDS 토큰 기반 정상 UX 유지.
2. **즉시 탈출 보장**: `StagePlayScreen` 상단에 "← 목록" 버튼 항상 표시. Toss 뒤로가기/닫기 버튼 절대 방해 금지.
3. **Disguised CTA 분리**: 위장 CTA 스테이지에 `SIMULATION` 배지 필수 표시(`showSimBadge: true`). 외부 URL 이동 0건. 광고 SDK UI 흉내 금지.
4. **시간 제한 안전망**: 모든 스테이지에 `timeLimitMs` 설정. 시간 초과 시 자동 종료(실패 처리).
5. **교육적 피드백**: 결과 화면에서 `explainWhyBad`로 해당 다크패턴이 왜 나쁜지 설명.

### 2.2 광고 완전 분리

- 스테이지 렌더러 내부에 광고 코드 일절 없음 (7개 v2 렌더러 + 3개 v1 렌더러 모두 해당)
- Disguised CTA Grid 스테이지는 시뮬레이션된 "위장 광고" UI이며, 실제 광고 SDK와 무관
- 광고 노출은 오직 `AdGate` 컴포넌트를 통해 스테이지 전환 지점에서만 가능

---

## 3. 광고 배치 원칙

Apps in Toss IAA 2.0 ver2 정책을 준수합니다.

| 원칙 | 구현 |
|------|------|
| 첫 진입 interstitial 금지 | 앱 진입 시 광고 없음. `AdGate`는 스테이지 전환 지점에서만 동작 |
| 스테이지 중 자동 팝업 금지 | 스테이지 플레이 중에는 광고를 표시하지 않음 |
| 전환 지점에서만 노출 | 스테이지 결과 → 다음 스테이지 이동 시에만 interstitial 노출 |
| Rewarded 광고 opt-in | 사용자가 명시적으로 선택한 경우에만 rewarded 광고 재생 |
| 보상 지급 조건 | `userEarnedReward` 이벤트 수신 시에만 리워드 인정 |
| isSupported 확인 | `loadFullScreenAd.isSupported()` 확인 후 광고 로드 |
| load-show-load 사이클 | 공식 문서 권장 사이클 준수 |
| 광고 위장 금지 | 광고를 콘텐츠로 위장하지 않음 |

---

## 4. 개인정보 처리

| 항목 | 상태 |
|------|------|
| 개인정보 수집 | 없음 |
| 로그인/회원가입 | 불필요 |
| 외부 서버 통신 | 없음 (클라이언트 사이드 전용) |
| 분석 이벤트 | 스테이지 시작/완료/공유 등 익명 이벤트만 (PII 미포함) |

---

## 5. 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Granite (`@apps-in-toss/web-framework` >= 1.0.0) |
| 빌드 도구 | Vite 6 + TypeScript 5 |
| UI | React 18 + react-router-dom 6 |
| WebView 타입 | `game` |
| 번들 사이즈 | ~239KB (gzip ~77KB) |

---

## 6. 관련 문서

- [POLICY_CHECKLIST.md](./POLICY_CHECKLIST.md) - 정책 준수 체크리스트
- [MVP_CHECKLIST.md](./MVP_CHECKLIST.md) - MVP 구현 진행 상황
- [DEVICE_TEST_SCRIPT.md](./DEVICE_TEST_SCRIPT.md) - 실기기 테스트 스크립트

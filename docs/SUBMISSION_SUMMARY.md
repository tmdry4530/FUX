# FUX - Bad UX Simulator 제출 요약서

> Apps in Toss 심사 제출용 요약 문서

---

## 1. 앱 목적

FUX(Fuck UX)는 **의도적으로 나쁜 UX 패턴을 시뮬레이션**하여 사용자에게 재미와 교육적 가치를 동시에 제공하는 게임형 미니앱입니다.

- 10개의 스테이지에서 "작은 버튼", "도망가는 버튼", "중첩 모달" 등 실제로 존재하는 나쁜 UX 패턴을 체험
- 각 스테이지 클리어 후 **"왜 나쁜 UX인지"** 교육 콘텐츠를 제공
- 밈 카피와 공유 기능으로 바이럴 확산 유도

---

## 2. 안전장치

| 항목 | 구현 상태 |
|------|-----------|
| 즉시 종료 가능 | Toss 뒤로가기/닫기 버튼이 항상 동작하며, 앱 쉘(Home/Settings)은 정상 UX 유지 |
| 스테이지 탈출 | 모든 스테이지에서 Skip 버튼 제공, 시간 제한 초과 시 자동 종료 |
| 시뮬레이션 표시 | `simulationBadge` 파라미터로 시뮬레이션임을 명시 |
| 교육적 맥락 | 결과 화면에서 `explainWhyBad`로 나쁜 UX 이유 설명 |
| 나쁜 UX 범위 | 스테이지 내부 시뮬레이션으로만 제한, 앱 쉘/네비게이션은 정상 |

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
| 번들 사이즈 | ~188KB (gzip ~62KB) |

---

## 6. 관련 문서

- [POLICY_CHECKLIST.md](./POLICY_CHECKLIST.md) - 정책 준수 체크리스트
- [MVP_CHECKLIST.md](./MVP_CHECKLIST.md) - MVP 구현 진행 상황
- [DEVICE_TEST_SCRIPT.md](./DEVICE_TEST_SCRIPT.md) - 실기기 테스트 스크립트

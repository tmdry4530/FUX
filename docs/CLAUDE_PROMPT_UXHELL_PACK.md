/team autopilot:
목표: uxhell.references.json(약 100개)에서 playable stage pack(stages.uxhell.json)을 자동 생성해 앱에 등록한다.
레퍼런스는 많고 렌더러는 적게(6~8개) 유지한다. 생성은 결정적(deterministic)이어야 하며, stage missing(스테이지를 찾을 수 없음)은 0건이어야 한다.

작업 1) 콘텐츠 원장/룰셋 문서 추가
- apps/src/content/uxhell/uxhell.references.json 추가
- docs/UX_HELL_PACK_RULESET.md 추가 (이 문서)

작업 2) archetype-map + params 템플릿
- apps/src/content/uxhell/archetype-map.ts 생성
- ARCHETYPE_TO_STAGE_TYPE + 타입별 DEFAULT_PARAMS + tag 기반 knobs 규칙 포함

작업 3) 생성기 스크립트 구현
- scripts/gen-uxhell-stages.ts 생성
- 입력: uxhell.references.json
- 출력: apps/src/stages/stages.uxhell.json
- 각 ref → 3 variants(easy/normal/hard) 생성 (총 300 레벨 목표)
- id 규칙: uxhell_{pack}_{index3}_{ref.id}_{variant}
- meta: referenceId/url/archetype/tags/sourceTag 포함
- stageType은 레지스트리에 등록된 것만 사용 (미등록이면 생성 실패)

작업 4) 검증기 스크립트 구현
- scripts/validate-stages.ts 생성
- 검증: id 중복, type 미등록, 필수 params 누락, JSON parse 실패
- 실패 시 상세 에러 출력

작업 5) 렌더러/레지스트리 정합성
- register.ts에 sliderLab/pickerHell/captchaHell/keyboardHell/dropdownHell/scrollHell/cursorHell/trapHell/curlingStone 중 최소 6개가 등록되어 있어야 한다.
- 없다면:
  A) 기존 v2 렌더러 중 가장 가까운 걸 재사용하도록 매핑 조정
  B) 또는 최소 렌더러를 새로 추가(‘Lab’ 형태로 params 기반)

작업 6) 앱 등록
- StageList에 “UXHELL Pack” 탭/필터 추가
- StagePlay lookup에 uxhell pack 포함 (v3→v2→uxhell→legacy 순)
- decodeURIComponent+trim+normalize로 stageId 처리

작업 7) 스모크 테스트
- npm run content:check (gen+validate)
- npm run build + preview 통과
- StageList에서 UXHELL 50개 임의 플레이로 stage missing 0 확인

완료 산출물:
- stages.uxhell.json(300레벨) 생성됨
- gen/validate 스크립트 + archetype-map.ts 존재
- docs/UX_HELL_PACK_RULESET.md로 작업 방법 문서화
- 커밋 1개로 정리


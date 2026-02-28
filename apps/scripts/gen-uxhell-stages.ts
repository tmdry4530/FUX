#!/usr/bin/env tsx
/**
 * gen-uxhell-stages.ts
 * uxhell.references.json -> stages.uxhell.json 생성 스크립트
 * 실행: tsx scripts/gen-uxhell-stages.ts
 *
 * 모든 101개 스테이지가 고유한 params, objective, difficulty, timeLimitMs를 가지도록 생성
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Reference {
  id: string;
  title: string;
  url: string;
  sourceTag: string;
  archetype: string;
  patternTags: string[];
  kind: string;
}

interface StageSpec {
  id: string;
  type: string;
  title: string;
  objective: string;
  memeCaption: string;
  explainWhyBad: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeLimitMs: number;
  allowHint: boolean;
  allowSkip: boolean;
  packTag: string;
  sourceTag: string;
  patternTag: string;
  params: Record<string, unknown>;
  meta: {
    referenceId: string;
    url: string;
    archetype: string;
    kind: string;
    patternTags: string[];
  };
}

// ---------------------------------------------------------------------------
// Archetype -> Stage Type Pool (expanded)
// ---------------------------------------------------------------------------

const ARCHETYPE_TO_STAGE_TYPES: Record<string, string[]> = {
  volume_hell: [
    'volume_hover_slider', 'volume_hyper_sensitive', 'volume_tiny_hitbox',
    'volume_hidden_icon', 'volume_reverse_mapping', 'volume_random_jump',
    'volume_circular_gesture', 'volume_puzzle_lock', 'volume_physics_launcher',
    'volume_voice_shout',
  ],
  slider_hell: [
    'volume_hover_slider', 'volume_hyper_sensitive', 'volume_tiny_hitbox',
    'volume_reverse_mapping', 'volume_random_jump',
  ],
  scroll_hell: [
    'endless_wizard_flow', 'nav_ambiguity_map', 'chaotic_layout_scavenger',
    'enterprise_filter_overload', 'government_portal_popups', 'clutter_find_cta',
  ],
  form_input_hell: [
    'consent_toggle_labour', 'label_ambiguity', 'state_feedback_broken',
  ],
  dropdown_hell: [
    'picker_no_search', 'label_ambiguity', 'enterprise_filter_overload',
    'state_feedback_broken', 'consent_toggle_labour', 'nav_ambiguity_map',
  ],
  auth_hell: [
    'roach_motel_flow', 'hidden_reject_link', 'consent_toggle_labour',
    'modal_stack', 'endless_wizard_flow', 'disguised_cta_grid',
    'government_portal_popups', 'label_ambiguity', 'state_feedback_broken',
    'clutter_find_cta', 'picker_no_search',
  ],
  captcha_hell: [
    'disguised_cta_grid', 'clutter_find_cta', 'tiny_button',
    'moving_target', 'hidden_reject_link', 'label_ambiguity',
    'modal_stack', 'chaotic_layout_scavenger', 'state_feedback_broken',
    'picker_no_search', 'nav_ambiguity_map',
  ],
  color_theme_hell: [
    'state_feedback_broken', 'label_ambiguity',
  ],
  cursor_hell: [
    'moving_target', 'tiny_button', 'volume_tiny_hitbox',
    'hidden_reject_link', 'clutter_find_cta', 'disguised_cta_grid',
    'volume_hidden_icon',
  ],
  date_time_hell: [
    'picker_no_search', 'label_ambiguity', 'endless_wizard_flow',
    'consent_toggle_labour', 'state_feedback_broken', 'nav_ambiguity_map',
    'volume_hover_slider', 'volume_hyper_sensitive', 'enterprise_filter_overload',
    'government_portal_popups', 'modal_stack', 'clutter_find_cta',
    'chaotic_layout_scavenger', 'disguised_cta_grid', 'hidden_reject_link',
    'roach_motel_flow',
  ],
  keyboard_hell: [
    'label_ambiguity', 'consent_toggle_labour', 'state_feedback_broken',
    'picker_no_search', 'hidden_reject_link', 'modal_stack', 'endless_wizard_flow',
  ],
  physics_target_hell: [
    'volume_physics_launcher',
  ],
  misc_hell: [
    'modal_stack', 'clutter_find_cta', 'chaotic_layout_scavenger',
    'disguised_cta_grid', 'nav_ambiguity_map', 'enterprise_filter_overload',
    'endless_wizard_flow', 'hidden_reject_link', 'roach_motel_flow', 'picker_no_search',
  ],
};

// ---------------------------------------------------------------------------
// Difficulty base per archetype
// ---------------------------------------------------------------------------

const ARCHETYPE_DIFFICULTY: Record<string, number> = {
  volume_hell: 3,
  slider_hell: 3,
  scroll_hell: 2,
  form_input_hell: 2,
  dropdown_hell: 2,
  auth_hell: 4,
  captcha_hell: 3,
  color_theme_hell: 3,
  cursor_hell: 4,
  date_time_hell: 2,
  keyboard_hell: 3,
  physics_target_hell: 4,
  misc_hell: 3,
};

// ---------------------------------------------------------------------------
// Objective templates (5+ per archetype, hash-selected)
// ---------------------------------------------------------------------------

const ARCHETYPE_OBJECTIVES: Record<string, string[]> = {
  volume_hell: [
    '볼륨을 정확히 50%로 맞추세요',
    '소리 크기를 목표 수준으로 조절하세요',
    '볼륨 컨트롤을 찾아 원하는 값으로 설정하세요',
    '이 기상천외한 볼륨 UI를 정복하세요',
    '볼륨을 조절하세요... 할 수 있다면',
    '목표 볼륨에 정확히 도달하세요',
    '볼륨을 딱 맞게 맞춰보세요',
  ],
  slider_hell: [
    '슬라이더를 목표 값으로 조절하세요',
    '이 불안정한 슬라이더를 제어하세요',
    '정밀하게 슬라이더를 움직여 목표에 맞추세요',
    '슬라이더가 당신을 이길 겁니다',
    '손떨림 주의: 초정밀 슬라이더 도전',
    '슬라이더를 정확한 위치로 이동시키세요',
    '목표 값에 슬라이더를 안착시키세요',
  ],
  scroll_hell: [
    '스크롤하여 숨겨진 버튼을 찾으세요',
    '끝없는 스크롤 속에서 목적지를 찾으세요',
    '정확한 메뉴 항목으로 이동하세요',
    '미로 같은 인터페이스를 탈출하세요',
    '원하는 기능을 찾을 때까지 스크롤하세요',
    '스크롤 지옥에서 탈출하세요',
    '숨겨진 진짜 버튼을 찾으세요',
  ],
  form_input_hell: [
    '양식을 올바르게 작성하세요',
    '모든 필드를 정확히 채우세요',
    '복잡한 폼을 완성하세요',
    '양식 입력의 지옥을 통과하세요',
    '필수 항목을 빠짐없이 입력하세요',
    '숨겨진 요구사항을 찾아 제출하세요',
    '폼 제출을 성공시키세요',
  ],
  dropdown_hell: [
    '드롭다운에서 정확한 항목을 선택하세요',
    '긴 목록에서 원하는 항목을 찾으세요',
    '검색 없이 올바른 옵션을 선택하세요',
    '수백 개의 항목 중 정답을 고르세요',
    '드롭다운 지옥을 통과하세요',
    '목록 최하단의 항목을 선택하세요',
    '올바른 카테고리를 골라내세요',
  ],
  auth_hell: [
    '로그인/로그아웃을 완료하세요',
    '계정 탈퇴 버튼을 찾아 클릭하세요',
    '의도적으로 복잡한 인증을 통과하세요',
    '구독 취소 버튼을 찾으세요',
    '이 로그인 절차를 무사히 마치세요',
    '속이는 설계의 인증 흐름을 탈출하세요',
    '회원 탈퇴를 완료하세요',
  ],
  captcha_hell: [
    '보안 인증을 통과하세요',
    '진짜 버튼을 찾아 클릭하세요',
    '광고가 아닌 실제 링크를 클릭하세요',
    '봇이 아님을 증명하세요',
    '이 캡차를 통과하세요',
    '미로 같은 보안 절차를 완료하세요',
    '정확한 항목을 선택해 인증하세요',
  ],
  color_theme_hell: [
    '올바른 색상 테마를 적용하세요',
    '가독성 있는 테마를 선택하세요',
    '숨겨진 설정 옵션을 찾으세요',
    '색상 혼돈 속에서 목표를 완수하세요',
    '올바른 UI 상태를 설정하세요',
  ],
  cursor_hell: [
    '정확한 위치를 클릭하세요',
    '작디작은 버튼을 클릭하세요',
    '움직이는 목표를 맞추세요',
    '작은 버튼의 저주 - 클릭하세요',
    '보이지 않는 클릭 영역을 찾으세요',
    '초소형 타겟을 정확히 클릭하세요',
    '쉬지 않는 버튼을 잡아 클릭하세요',
  ],
  date_time_hell: [
    '올바른 날짜/시간을 입력하세요',
    '날짜 선택기에서 목표 날짜를 고르세요',
    '비직관적인 날짜 입력 UI를 완료하세요',
    '시간을 정확히 설정하세요',
    '날짜/시간 지옥을 통과하세요',
    '목표 날짜를 찾아 선택하세요',
    '혼란스러운 달력에서 날짜를 고르세요',
  ],
  keyboard_hell: [
    '키보드로 텍스트를 올바르게 입력하세요',
    '자동완성 방해를 극복하고 입력하세요',
    '키보드 오류를 무시하고 완성하세요',
    '예상치 못한 입력 방해를 이겨내세요',
    '키보드 지옥을 통과하세요',
    '올바른 텍스트를 입력하세요',
    '입력 필드를 성공적으로 채우세요',
  ],
  physics_target_hell: [
    '물리 법칙을 이용해 목표를 맞추세요',
    '볼륨을 물리 엔진으로 설정하세요',
    '탄성 있는 UI로 원하는 값을 맞추세요',
    '물리 기반 컨트롤을 마스터하세요',
    '튕기는 슬라이더로 목표를 달성하세요',
  ],
  misc_hell: [
    '주어진 미션을 완료하세요',
    '이 UX 지옥에서 탈출하세요',
    '속이는 설계를 뚫고 목표를 달성하세요',
    '숨겨진 기능을 찾아 실행하세요',
    '이 혼돈 속에서 올바른 버튼을 찾으세요',
    '복합 UX 장애물을 극복하세요',
    '미션을 성공적으로 마치세요',
  ],
};

// ---------------------------------------------------------------------------
// ExplainWhyBad templates (3-5 per archetype, hash-selected)
// ---------------------------------------------------------------------------

const ARCHETYPE_EXPLAIN_WHY_BAD: Record<string, string[]> = {
  volume_hell: [
    '직관적이지 않은 볼륨 컨트롤은 사용자에게 불필요한 생각의 부담을 줍니다.',
    '예측 불가능한 볼륨 인터페이스는 기본적인 사용성 원칙을 위반합니다.',
    '볼륨 조절 UI는 단순해야 하는데, 이렇게 복잡하면 사용자는 그냥 소리를 끕니다.',
    '볼륨 컨트롤의 반응이 불명확하면 사용자는 계속 시도하다 포기합니다.',
    '물리적 직관과 다른 볼륨 매핑은 혼란을 일으킵니다.',
  ],
  slider_hell: [
    '슬라이더의 민감도나 동작이 예상과 다르면 사용자 경험이 크게 저하됩니다.',
    '예측 불가능한 슬라이더는 정밀 조작을 불가능하게 만들어 좌절감을 줍니다.',
    '슬라이더 UX의 핵심은 일관성인데, 이를 무너뜨리면 신뢰를 잃습니다.',
    '반응 없는 슬라이더는 사용자가 현재 상태를 알 수 없게 합니다.',
    '비선형 슬라이더 응답은 사용자의 직관을 완전히 무너뜨립니다.',
  ],
  scroll_hell: [
    '과도한 스크롤은 사용자의 시간을 낭비하고 원하는 콘텐츠를 찾기 어렵게 만듭니다.',
    '끝없는 페이지는 사용자에게 진행 상황을 알 수 없게 해 불안감을 줍니다.',
    '중요한 기능을 스크롤 끝에 숨기는 것은 의도적인 접근성 방해입니다.',
    '스크롤 중 레이아웃 변경은 사용자의 위치 감각을 잃게 합니다.',
    '메뉴 미로는 사용자가 원하는 것을 찾는 데 과도한 시간을 소비하게 합니다.',
  ],
  form_input_hell: [
    '복잡한 양식은 사용자 이탈의 주요 원인입니다.',
    '불명확한 오류 메시지는 사용자가 무엇을 고쳐야 할지 모르게 합니다.',
    '너무 많은 필수 항목은 가입 완료율을 급격히 낮춥니다.',
    '폼 유효성 검사가 제출 후에만 일어나면 사용자 경험이 매우 나빠집니다.',
    '버튼 이름이 불명확한 폼은 사용자에게 추측을 강요합니다.',
  ],
  dropdown_hell: [
    '검색 없는 긴 드롭다운은 선택을 고통스럽게 만듭니다.',
    '수백 개의 옵션이 있는 드롭다운은 키보드 탐색 없이는 사용 불가능합니다.',
    '알파벳순 정렬도 없는 긴 목록은 사용자를 절망하게 합니다.',
    '드롭다운에 검색 기능이 없으면 50개 이상의 항목은 고문입니다.',
    '정렬 기준이 불명확한 드롭다운은 원하는 항목 찾기를 도박으로 만듭니다.',
  ],
  auth_hell: [
    '의도적으로 복잡한 인증 절차는 사용자를 가두는 속이는 설계입니다.',
    '탈퇴 버튼을 숨기거나 어렵게 만드는 것은 들어오긴 쉽고 나가긴 어려운 패턴의 전형입니다.',
    '과도한 확인 단계는 사용자가 포기하고 계정을 그냥 방치하게 만듭니다.',
    '구독 취소를 어렵게 만드는 것은 단기 수익에는 도움이 되지만 신뢰를 파괴합니다.',
    '로그인은 쉽고 로그아웃은 어렵게 만드는 비대칭 UX는 불신을 낳습니다.',
  ],
  captcha_hell: [
    '과도한 보안 인증은 실제 사용자마저 차단합니다.',
    '광고처럼 위장된 버튼은 사용자의 신뢰를 근본적으로 훼손합니다.',
    '진짜와 가짜를 구분하기 어렵게 만드는 UI는 사용자를 범죄 피해자로 만듭니다.',
    '캡차 남용은 사용 편의성을 심각하게 해치고 장애인 사용자를 배제합니다.',
    '보안을 핑계로 사용자를 괴롭히는 것은 UX와 보안 모두를 망칩니다.',
  ],
  color_theme_hell: [
    '일관성 없는 색상 체계는 인터페이스의 가독성을 떨어뜨립니다.',
    '색상 대비가 낮은 UI는 시각 장애인이나 노인에게 사용 불가능합니다.',
    '의미 없이 색상을 남용하면 사용자는 색상으로 정보를 읽는 능력을 잃습니다.',
    '색상 반응이 깨지면 사용자는 현재 상태를 파악할 수 없습니다.',
    '다크 모드와 라이트 모드 사이의 불일관성은 사용자 혼란을 야기합니다.',
  ],
  cursor_hell: [
    '작은 클릭 영역은 작은 버튼은 누르기 어렵다는 원칙을 위반하여 조작을 어렵게 합니다.',
    '시각적 크기와 실제 클릭 영역의 불일치는 사용자를 혼란스럽게 합니다.',
    '움직이는 버튼은 사용 편의 기준을 위반하며 운동 장애가 있는 사용자를 배제합니다.',
    '클릭 영역이 너무 작은 버튼은 모바일에서 사용을 불가능하게 만듭니다.',
    '클릭 후 즉각적인 반응이 없으면 사용자는 여러 번 클릭해 오류를 일으킵니다.',
  ],
  date_time_hell: [
    '비표준 날짜/시간 입력은 사용자 오류를 유발합니다.',
    '날짜 선택기가 직관적이지 않으면 예약/입력 오류율이 급증합니다.',
    '시간대를 고려하지 않은 날짜 UI는 국제 사용자를 소외시킵니다.',
    '날짜 형식이 지역별로 다른데 이를 무시하면 심각한 오류가 발생합니다.',
    '달력 UI에서 목표 날짜까지 많은 클릭이 필요하면 사용자는 포기합니다.',
  ],
  keyboard_hell: [
    '키보드 입력을 방해하는 인터페이스는 접근성을 심각하게 해칩니다.',
    '자동완성이 잘못 작동하면 사용자가 원하지 않는 내용이 입력됩니다.',
    '키보드 단축키가 없는 복잡한 폼은 파워 유저를 배제합니다.',
    '입력 중 포커스를 빼앗는 UI는 사용자를 극도로 좌절시킵니다.',
    '소프트 키보드가 입력 필드를 가리면 무엇을 입력하는지 볼 수 없습니다.',
  ],
  physics_target_hell: [
    '물리 기반 UI는 재미있지만, 정밀 조작이 필요할 때 좌절감을 줍니다.',
    '물리 엔진이 있는 컨트롤은 예측 가능성이 낮아 정확한 값 설정이 불가능합니다.',
    '게임스러운 물리 UX는 실제 작업 완료를 방해하는 오락 요소가 됩니다.',
    '탄성 있는 UI 요소는 사용자가 원하는 지점에서 멈추기 어렵게 합니다.',
    '관성이 있는 인터페이스는 고령자나 운동 장애가 있는 사용자에게 사용 불가능합니다.',
  ],
  misc_hell: [
    '이 인터페이스는 여러 나쁜 설계를 복합적으로 보여줍니다.',
    '복합적인 속이는 설계는 단일 패턴보다 훨씬 더 해롭습니다.',
    '나쁜 설계들이 조합되면 사용자는 완전히 길을 잃습니다.',
    '여러 나쁜 설계의 결합은 사용자를 의도적으로 혼란시키려는 설계입니다.',
    '이런 UI를 사용하면 사용자는 서비스 자체를 불신하게 됩니다.',
  ],
};

// ---------------------------------------------------------------------------
// Type-based explainWhyBad (실제 렌더러 컨셉에 맞는 설명)
// ---------------------------------------------------------------------------

const TYPE_EXPLAIN_WHY_BAD: Record<string, string[]> = {
  volume_hover_slider: [
    '마우스를 올려야만 작동하는 슬라이더는 터치 디바이스에서 완전히 무용지물이 됩니다.',
    '마우스를 올려야만 나타나는 컨트롤은 찾기 쉬움을 제로로 만듭니다.',
    '마우스를 올려야만 작동하는 UI는 사용 편의 기준을 위반하며, 운동 장애 사용자를 배제합니다.',
  ],
  volume_hyper_sensitive: [
    '극도로 민감한 슬라이더는 정밀 조작을 불가능하게 만들어 좌절감을 줍니다.',
    '입력 감도가 너무 높으면 사용자는 원하는 값에 도달할 수 없어 포기합니다.',
    '비선형 슬라이더 응답은 사용자의 멘탈 모델을 완전히 무너뜨립니다.',
  ],
  volume_tiny_hitbox: [
    '히트박스가 너무 작은 컨트롤은 모바일에서 사용이 사실상 불가능합니다.',
    '시각적 크기와 실제 클릭 영역의 불일치는 사용자를 혼란스럽게 합니다.',
    '피츠의 법칙(Fitts\' Law)에 따르면 작은 타겟은 클릭 시간을 기하급수적으로 늘립니다.',
  ],
  volume_hidden_icon: [
    '숨겨진 컨트롤은 발견 가능성이 없어 사용자가 기능의 존재 자체를 모릅니다.',
    '중요한 기능을 숨기면 사용자는 기본적인 작업도 수행할 수 없게 됩니다.',
    '아이콘의 가시성을 의도적으로 낮추는 것은 사용자를 기만하는 속이는 설계입니다.',
  ],
  volume_reverse_mapping: [
    '직관과 반대로 동작하는 UI는 사용자의 직관을 완전히 파괴합니다.',
    '역방향 매핑은 사용자가 이미 학습한 조작 패턴을 무력화시킵니다.',
    '예상과 다른 방향으로 동작하는 컨트롤은 오조작을 유발하고 신뢰를 잃게 합니다.',
  ],
  volume_random_jump: [
    '예측 불가능한 동작은 사용자에게 통제감을 빼앗아 심각한 좌절감을 줍니다.',
    '랜덤하게 움직이는 컨트롤은 정확한 값 설정을 불가능하게 만듭니다.',
    '볼륨 노브가 제멋대로 튀면 사용자는 어떤 조작도 의미 없다고 느끼게 됩니다.',
  ],
  volume_circular_gesture: [
    '회전 제스처는 직관적이지 않고, 정밀한 값 설정이 극도로 어렵습니다.',
    '원형 다이얼 UI는 손목에 부담을 주고, 접근성이 매우 낮은 인터랙션입니다.',
    '비표준 제스처를 요구하는 UI는 학습 비용이 높아 사용자 이탈을 유발합니다.',
  ],
  volume_puzzle_lock: [
    '기본 기능에 퍼즐을 추가하면 사용자의 시간을 불필요하게 낭비시킵니다.',
    '볼륨 같은 필수 기능에 잠금을 거는 것은 사용성을 의도적으로 방해하는 행위입니다.',
    '추가 인증 없이 접근해야 하는 기본 기능에 장벽을 만드는 것은 안티패턴입니다.',
  ],
  volume_physics_launcher: [
    '물리 엔진 기반 UI는 재미있지만, 정확한 값 설정이 사실상 불가능합니다.',
    '게임스러운 물리 인터랙션은 실제 작업 완료를 방해하는 불필요한 복잡성입니다.',
    '관성이 있는 인터페이스는 고령자나 운동 장애가 있는 사용자에게 사용 불가능합니다.',
  ],
  volume_voice_shout: [
    '음성 입력만 제공하면 공공장소에서 사용이 불가능하고 프라이버시를 침해합니다.',
    '비표준 입력 방식만 강요하면 대다수 사용자를 배제하게 됩니다.',
    '소리를 질러야 하는 UI는 언어 장애나 음성 장애가 있는 사용자를 배제합니다.',
  ],
  picker_no_search: [
    '검색 없는 긴 드롭다운은 선택을 고통스럽게 만들고 사용자를 이탈시킵니다.',
    '수백 개 항목이 있는 목록에 검색이 없으면 원하는 항목을 찾는 것이 운에 의존하게 됩니다.',
    '알파벳순 정렬과 검색 기능 없는 긴 목록은 UX의 고전적 안티패턴입니다.',
    '검색 없이 스크롤만으로 항목을 찾게 하면 사용자의 시간과 인내심을 고갈시킵니다.',
  ],
  clutter_find_cta: [
    '화면에 불필요한 요소가 넘치면 사용자는 진짜 기능을 찾을 수 없게 됩니다.',
    '광고와 진짜 버튼을 구분하기 어렵게 만드는 것은 사기성 속이는 설계입니다.',
    '정보 과부하는 혼란을 폭증시켜 의사결정을 마비시킵니다.',
    '어수선한 UI는 핵심 기능의 찾기 쉬움을 의도적으로 떨어뜨립니다.',
  ],
  chaotic_layout_scavenger: [
    '무질서한 레이아웃은 시각적 계층 구조를 파괴해 사용자가 어디를 봐야 할지 모르게 합니다.',
    '요소의 위치가 예측 불가능하면 사용자의 스캔 패턴이 무력화됩니다.',
    '뒤죽박죽 배치는 인지 부하를 극대화하고 과업 완료 시간을 급격히 늘립니다.',
  ],
  nav_ambiguity_map: [
    '중첩된 메뉴 구조는 사용자가 원하는 기능을 찾는 데 과도한 시간을 소비하게 합니다.',
    '모호한 메뉴 이름은 사용자에게 추측을 강요하며 오탐을 유발합니다.',
    '메뉴 깊이가 깊을수록 사용자의 위치 감각이 사라지고 길을 잃게 됩니다.',
    '복잡한 내비게이션은 이탈률의 가장 큰 원인 중 하나입니다.',
  ],
  enterprise_filter_overload: [
    '과도한 필터 옵션은 선택의 역설을 일으켜 오히려 결정을 어렵게 만듭니다.',
    '수십 개의 필터를 한 화면에 보여주면 사용자는 시작 전에 포기합니다.',
    '핵심 필터와 부수적 필터를 구분하지 않으면 모든 필터가 무의미해집니다.',
  ],
  label_ambiguity: [
    '모호한 버튼 이름은 사용자가 어떤 결과가 일어날지 예측할 수 없게 만듭니다.',
    '"확인"과 "취소"가 뒤바뀐 다이얼로그는 심각한 데이터 손실을 유발할 수 있습니다.',
    '버튼 이름이 동작을 정확히 반영하지 않으면 사용자는 클릭할 때마다 불안합니다.',
    '혼동스러운 이름은 사용자의 신뢰를 근본적으로 훼손합니다.',
  ],
  consent_toggle_labour: [
    '"모두 거부" 없이 수십 개 스위치를 개별 해제하게 하는 것은 의도적 동의 착취입니다.',
    '유럽 개인정보보호법은 동의 거부를 동의 수락만큼 쉽게 해야 한다고 명시합니다.',
    '쿠키 동의 UI에서 스위치 노동을 강요하면 대부분 사용자는 포기하고 "모두 허용"을 누릅니다.',
    '개별 스위치 해제를 요구하는 것은 사용자의 프라이버시 권리를 침해하는 속이는 설계입니다.',
  ],
  modal_stack: [
    '팝업 위에 팝업이 쌓이면 사용자는 원래 작업으로 돌아갈 수 없게 됩니다.',
    '겹쳐진 팝업은 화면을 가리고 사용자의 통제감을 완전히 빼앗습니다.',
    '팝업 스택은 사용자의 작업 흐름을 강제로 중단시키는 가장 공격적인 패턴입니다.',
    '닫기 어려운 팝업은 사용자를 가두어 원하지 않는 행동을 유도합니다.',
  ],
  roach_motel_flow: [
    '가입은 쉽고 탈퇴는 어렵게 만드는 비대칭 UX는 사용자 신뢰를 파괴합니다.',
    '탈퇴 버튼을 숨기거나 복잡한 절차를 요구하는 것은 함정 설계 패턴의 전형입니다.',
    '해지 과정에 불필요한 단계를 추가하는 것은 소비자보호 기관이 규제하는 속이는 설계입니다.',
    '구독 취소를 의도적으로 어렵게 만들면 사용자 이탈 대신 소송을 얻게 됩니다.',
  ],
  hidden_reject_link: [
    '거절 옵션을 숨기면 사용자는 원치 않는 서비스에 강제 동의하게 됩니다.',
    '화려한 버튼 옆에 투명한 거절 링크를 배치하는 것은 대표적 기만형 속이는 설계입니다.',
    '거절/닫기 버튼의 가시성을 의도적으로 낮추면 사용자 선택권을 침해합니다.',
    '동의 버튼은 크고 화려하게, 거절 버튼은 숨기는 것은 사용자를 기만하는 행위입니다.',
  ],
  disguised_cta_grid: [
    '광고를 실제 기능처럼 위장하면 사용자의 신뢰를 근본적으로 훼손합니다.',
    '진짜 버튼과 가짜 버튼을 구분 불가능하게 만드는 것은 사기적 UI 패턴입니다.',
    '위장된 버튼은 사용자를 원치 않는 페이지로 유도해 시간을 낭비시킵니다.',
  ],
  state_feedback_broken: [
    '오류 메시지 없이 유효성 검사를 하면 사용자는 뭘 고쳐야 할지 알 수 없습니다.',
    '상태 반응이 없는 폼은 사용자가 시행착오로만 올바른 입력값을 추측하게 합니다.',
    '진행 상태가 보이지 않는 양식은 사용자에게 극도의 불안감과 좌절감을 줍니다.',
    '반응 없는 인터페이스는 닐슨의 10가지 휴리스틱 중 "시스템 상태의 가시성"을 위반합니다.',
  ],
  moving_target: [
    '움직이는 버튼은 접근성 지침(WCAG 2.5.1)을 위반하며 운동 장애 사용자를 배제합니다.',
    '도망치는 버튼은 사용자에게 불필요한 운동 부담을 주고 좌절감을 극대화합니다.',
    '끊임없이 이동하는 타겟은 정확한 클릭을 불가능하게 만들어 조작 불가능 UI가 됩니다.',
  ],
  tiny_button: [
    '초소형 버튼은 작을수록 누르기 어렵다는 원칙에 따라 클릭 난이도를 기하급수적으로 높입니다.',
    '터치 영역이 48dp 미만이면 모바일에서 사실상 사용 불가능합니다.',
    '의도적으로 작은 버튼은 사용자가 원하는 선택을 방해하려는 속이는 설계입니다.',
    '중요한 기능의 버튼이 작고 비중요한 기능의 버튼이 큰 것은 우선순위 역전입니다.',
  ],
  endless_wizard_flow: [
    '끝이 안 보이는 절차는 사용자의 진행 감각을 빼앗아 이탈률을 급증시킵니다.',
    '불필요한 단계를 추가해 과정을 늘리는 것은 사용자의 시간을 존중하지 않는 설계입니다.',
    '진행률 표시 없는 긴 절차는 사용자에게 "끝이 있긴 한 건가?"라는 불안을 줍니다.',
  ],
  government_portal_popups: [
    '관공서 스타일 팝업 지옥은 사용자의 인내심과 시간을 한계까지 시험합니다.',
    '불필요한 팝업과 경고는 사용자의 작업 흐름을 끊임없이 방해합니다.',
    '복잡한 공공 UI는 디지털 리터러시가 낮은 사용자를 완전히 배제합니다.',
  ],
};

// ---------------------------------------------------------------------------
// Type-based objectives (실제 렌더러 체험에 맞는 objective)
// ---------------------------------------------------------------------------

const TYPE_OBJECTIVES: Record<string, string[]> = {
  volume_hover_slider: ['호버로 볼륨을 조절하세요', '마우스를 올려 볼륨을 맞추세요', '목표 볼륨에 정확히 도달하세요', '볼륨 슬라이더를 호버로 제어하세요', '떠다니는 슬라이더로 목표에 도달하세요'],
  volume_hyper_sensitive: ['극도로 민감한 볼륨을 조절하세요', '과민 반응 슬라이더로 볼륨을 맞추세요', '초고감도 볼륨 컨트롤을 제어하세요', '미세 조정이 필요한 볼륨을 맞추세요', '살짝만 건드려도 폭주하는 볼륨을 맞추세요'],
  volume_tiny_hitbox: ['초소형 볼륨 컨트롤을 조작하세요', '작디작은 히트박스로 볼륨을 맞추세요', '보이지 않는 볼륨 슬라이더를 찾아 조절하세요', '히트박스가 최소화된 볼륨을 맞추세요', '초소형 클릭 영역으로 볼륨을 조절하세요'],
  volume_hidden_icon: ['숨겨진 볼륨 아이콘을 찾아 조절하세요', '보이지 않는 볼륨 버튼을 찾으세요', '어디에 있는지 모를 볼륨을 찾으세요', '숨어있는 소리 설정을 찾아 조절하세요', '볼륨 컨트롤을 찾아 사용하세요'],
  volume_reverse_mapping: ['반대로 움직이는 볼륨을 맞추세요', '역방향 슬라이더로 볼륨을 조절하세요', '직감과 반대인 볼륨 컨트롤을 사용하세요', '뒤바뀐 볼륨 매핑을 극복하세요', '역전된 볼륨 조절기를 제어하세요'],
  volume_random_jump: ['랜덤 점프하는 볼륨을 맞추세요', '불규칙한 볼륨 슬라이더를 제어하세요', '튀어다니는 볼륨을 잡으세요', '점프하는 슬라이더로 목표에 도달하세요', '예측 불가 볼륨 컨트롤을 정복하세요'],
  volume_circular_gesture: ['원형 제스처로 볼륨을 맞추세요', '다이얼식 볼륨 컨트롤을 사용하세요', '회전 제스처로 목표 볼륨에 도달하세요', '돌려서 볼륨을 조절하세요', '볼륨 다이얼을 정확히 돌리세요'],
  volume_puzzle_lock: ['퍼즐을 풀어 볼륨을 조절하세요', '잠금 해제 후 볼륨을 맞추세요', '보안 퍼즐을 통과해 볼륨을 조절하세요', '잠겨있는 볼륨 컨트롤을 해제하세요', '볼륨 퍼즐 잠금을 풀고 설정하세요'],
  volume_physics_launcher: ['물리 발사체로 볼륨을 맞추세요', '던져서 볼륨을 설정하세요', '발사 각도를 맞춰 볼륨에 도달하세요', '탄성 있는 볼륨 컨트롤을 사용하세요', '물리 엔진으로 볼륨을 조절하세요'],
  volume_voice_shout: ['소리쳐서 볼륨을 맞추세요', '음성으로 볼륨을 조절하세요', '마이크에 대고 볼륨을 설정하세요', '목소리 크기로 볼륨을 제어하세요', '외쳐서 목표 볼륨에 도달하세요'],
  endless_wizard_flow: ['끝없는 단계를 통과하세요', '마법사 흐름을 완주하세요', '끝이 안 보이는 절차를 완료하세요', '숨겨진 마지막 단계에 도달하세요', '모든 단계를 빠짐없이 넘기세요'],
  government_portal_popups: ['관공서 스타일 포털을 통과하세요', '팝업 지옥을 뚫고 목표에 도달하세요', '공무원이 만든 웹사이트를 통과하세요', '팝업을 닫으며 절차를 완료하세요', '복잡한 공공기관 UI를 탐색하세요'],
  clutter_find_cta: ['광고 속 진짜 버튼을 찾으세요', '수많은 페이크 버튼 중 진짜를 찾으세요', '혼잡한 화면에서 실제 버튼을 클릭하세요', '어지러운 화면에서 목표를 찾으세요', '광고와 섞인 진짜 링크를 구별하세요'],
  chaotic_layout_scavenger: ['혼돈의 레이아웃에서 목표를 찾으세요', '엉망인 화면에서 올바른 버튼을 찾으세요', '무질서한 레이아웃을 탐색하세요', '뒤죽박죽 UI에서 목표를 달성하세요', '난잡한 UI 속 진짜 기능을 찾으세요'],
  nav_ambiguity_map: ['미로 같은 메뉴에서 목표를 찾으세요', '숨겨진 설정 메뉴를 찾으세요', '모호한 메뉴 속 올바른 경로를 찾으세요', '중첩된 메뉴를 탐험해 목표에 도달하세요', '혼란스러운 네비게이션을 탐색하세요'],
  enterprise_filter_overload: ['복잡한 필터를 사용해 목표를 찾으세요', '수십 개의 필터 옵션 중 올바른 조합을 찾으세요', '과도한 필터 UI를 통과하세요', '기업용 필터 과부하를 극복하세요', '복잡한 검색 필터를 설정하세요'],
  picker_no_search: ['검색 없는 긴 목록에서 항목을 찾으세요', '수백 개 목록에서 올바른 항목을 선택하세요', '끝없는 드롭다운에서 정답을 고르세요', '필터 없는 긴 목록을 탐색하세요', '검색 기능 없이 스크롤로 항목을 찾으세요'],
  label_ambiguity: ['모호한 버튼 이름을 정확히 고르세요', 'OK와 Cancel이 뒤바뀐 다이얼로그를 통과하세요', '헷갈리는 버튼 이름 중 올바른 것을 클릭하세요', '의미가 불명확한 버튼들 사이에서 선택하세요', '혼동스러운 이름 속에서 정답을 고르세요'],
  consent_toggle_labour: ['수많은 동의 스위치을 하나하나 꺼주세요', '쿠키 동의 스위치을 수동으로 설정하세요', '"모두 허용" 없이 스위치을 하나씩 처리하세요', '함정이 있는 동의 설정을 올바르게 완료하세요', '개별 동의 스위치을 모두 거부로 전환하세요'],
  modal_stack: ['쌓인 팝업을 모두 닫으세요', '겹쳐진 팝업창을 전부 닫으세요', '팝업 위의 팝업을 하나씩 해결하세요', '끝없이 쌓이는 팝업을 처리하세요', '팝업 스택을 순서대로 처리하세요'],
  roach_motel_flow: ['구독 취소/탈퇴를 완료하세요', '빠져나갈 수 없는 흐름에서 탈출하세요', '숨겨진 해지 절차를 끝까지 완료하세요', '가입은 쉽고 탈퇴는 어려운 UI를 뚫으세요', '함정 설계 패턴에서 빠져나오세요'],
  hidden_reject_link: ['숨겨진 거절 링크를 찾으세요', '"아니요" 버튼을 찾아 클릭하세요', '투명한 거절 링크를 발견하세요', '화려한 버튼 사이에 숨은 거절 버튼을 찾으세요', '유도 버튼 대신 진짜 거절 옵션을 찾으세요'],
  disguised_cta_grid: ['진짜 버튼을 광고 속에서 구별하세요', '가짜 버튼과 진짜 버튼을 구분하세요', '위장된 버튼 중 올바른 것을 클릭하세요', '광고처럼 생긴 진짜 기능을 찾으세요', '위장 버튼 그리드에서 정답을 고르세요'],
  state_feedback_broken: ['반응이 깨진 폼을 완성하세요', '오류 메시지 없이 올바른 값을 입력하세요', '상태 표시가 없는 양식을 제출하세요', '반응 없는 폼을 시행착오로 완성하세요', '진행 상태가 안 보이는 폼을 채우세요'],
  moving_target: ['움직이는 버튼을 클릭하세요', '도망치는 버튼을 잡아 클릭하세요', '끊임없이 움직이는 타겟을 맞추세요', '피하는 버튼을 잡으세요', '이리저리 움직이는 버튼을 정확히 클릭하세요'],
  tiny_button: ['작디작은 버튼을 클릭하세요', '초소형 버튼을 정확히 찾아 클릭하세요', '거의 보이지 않는 버튼을 터치하세요', '극미세 클릭 영역을 정확히 누르세요', '눈을 크게 뜨고 작은 버튼을 찾으세요'],
};

// ---------------------------------------------------------------------------
// Picker item pools (different per stage to avoid duplication)
// ---------------------------------------------------------------------------

const PICKER_POOLS: { category: string; items: string[] }[] = [
  {
    category: '국가',
    items: [
      '가나', '가봉', '가이아나', '감비아', '과테말라', '그레나다', '그루지야', '그리스',
      '기니', '기니비사우', '나미비아', '나우루', '나이지리아', '남아프리카공화국', '남수단',
      '네덜란드', '네팔', '노르웨이', '뉴질랜드', '니제르', '니카라과', '대한민국',
      '덴마크', '도미니카', '도미니카공화국', '독일', '동티모르', '라오스', '라이베리아',
      '라트비아', '러시아', '레바논', '레소토', '루마니아', '룩셈부르크', '르완다',
      '리비아', '리투아니아', '리히텐슈타인', '마다가스카르', '마셜제도', '말라위',
      '말레이시아', '말리', '멕시코', '모나코', '모로코', '모리셔스', '모리타니',
      '모잠비크', '몬테네그로', '몰도바', '몰디브', '몰타', '몽골', '미국', '미크로네시아',
      '미얀마', '바누아투', '바레인', '바베이도스', '바하마', '방글라데시', '베냉',
      '베네수엘라', '베트남', '벨기에', '벨라루스', '벨리즈', '보스니아헤르체고비나',
      '보츠와나', '볼리비아', '부룬디', '부르키나파소', '부탄', '북마케도니아', '불가리아',
      '브라질', '브루나이', '사모아', '사우디아라비아', '산마리노', '상투메프린시페',
      '세네갈', '세르비아', '세이셸', '세인트루시아', '세인트빈센트그레나딘', '소말리아',
      '솔로몬제도', '수단', '수리남', '스리랑카', '스웨덴', '스위스', '스페인', '슬로바키아',
      '슬로베니아', '시리아', '시에라리온', '싱가포르', '아랍에미리트', '아르메니아',
      '아르헨티나', '아이슬란드', '아이티', '아일랜드', '아제르바이잔', '아프가니스탄',
      '안도라', '알바니아', '알제리', '앙골라', '에리트레아', '에스와티니', '에콰도르',
      '에티오피아', '엘살바도르', '영국', '예멘', '오만', '오스트레일리아', '오스트리아',
      '온두라스', '요르단', '우간다', '우루과이', '우즈베키스탄', '우크라이나', '이라크',
      '이란', '이스라엘', '이집트', '이탈리아', '인도', '인도네시아', '일본',
      '자메이카', '잠비아', '적도기니', '중국', '중앙아프리카공화국', '지부티', '짐바브웨',
      '차드', '체코', '칠레', '카메룬', '카보베르데', '카자흐스탄', '카타르', '캄보디아',
      '캐나다', '케냐', '코모로', '코스타리카', '코트디부아르', '콜롬비아', '콩고공화국',
      '콩고민주공화국', '쿠바', '쿠웨이트', '크로아티아', '키리바시', '키르기스스탄',
      '타지키스탄', '탄자니아', '태국', '터키', '통가', '투르크메니스탄', '투발루',
      '튀니지', '트리니다드토바고', '파나마', '파라과이', '파키스탄', '파푸아뉴기니',
      '팔라우', '팔레스타인', '페루', '포르투갈', '폴란드', '프랑스', '피지', '핀란드',
      '필리핀', '헝가리',
    ],
  },
  {
    category: '도시',
    items: [
      '서울', '부산', '대구', '인천', '광주', '대전', '울산', '수원', '창원', '고양',
      '용인', '성남', '청주', '안산', '전주', '평택', '화성', '남양주', '안양', '포항',
      '도쿄', '오사카', '나고야', '삿포로', '후쿠오카', '교토', '고베', '요코하마',
      '베이징', '상하이', '광저우', '선전', '청두', '충칭', '톈진', '우한', '시안',
      '홍콩', '마카오', '타이베이', '타이중', '가오슝', '싱가포르', '쿠알라룸푸르',
      '방콕', '자카르타', '마닐라', '하노이', '호치민', '양곤', '다카', '뭄바이',
      '델리', '벵갈루루', '첸나이', '하이데라바드', '콜카타', '카라치', '라호르',
      '이스탄불', '앙카라', '두바이', '아부다비', '리야드', '도하', '쿠웨이트시티',
      '런던', '파리', '베를린', '마드리드', '로마', '바르셀로나', '암스테르담',
      '브뤼셀', '비엔나', '취리히', '제네바', '스톡홀름', '코펜하겐', '오슬로',
      '헬싱키', '바르샤바', '프라하', '부다페스트', '부쿠레슈티', '아테네', '리스본',
      '뉴욕', '로스앤젤레스', '시카고', '휴스턴', '피닉스', '필라델피아', '샌안토니오',
      '샌디에이고', '댈러스', '산호세', '오스틴', '잭슨빌', '포트워스', '콜럼버스',
      '샌프란시스코', '샬럿', '인디애나폴리스', '시애틀', '덴버', '워싱턴DC',
      '토론토', '몬트리올', '밴쿠버', '캘거리', '오타와', '에드먼턴', '시드니',
      '멜버른', '브리즈번', '퍼스', '애들레이드', '골드코스트', '상파울루', '리우데자네이루',
      '부에노스아이레스', '보고타', '리마', '산티아고', '카라카스', '멕시코시티',
      '카이로', '라고스', '요하네스버그', '케이프타운', '나이로비', '아디스아바바',
      '모스크바', '상트페테르부르크', '노보시비르스크', '예카테린부르크',
    ],
  },
  {
    category: '직업',
    items: [
      '개발자', '디자이너', '기획자', '마케터', '데이터 분석가', '프로젝트 매니저',
      '시스템 관리자', '보안 전문가', 'UX 연구원', '콘텐츠 크리에이터', '영업 담당자',
      '고객 서비스 담당자', '회계사', '재무 분석가', '인사 담당자', '법무 담당자',
      '의사', '간호사', '약사', '치과의사', '한의사', '물리치료사', '심리상담사',
      '교사', '교수', '연구원', '강사', '튜터', '학원 원장', '사서',
      '변호사', '검사', '판사', '공무원', '경찰관', '소방관', '군인', '외교관',
      '건축가', '인테리어 디자이너', '토목 엔지니어', '기계 엔지니어', '전기 엔지니어',
      '화학 엔지니어', '항공 엔지니어', '자동차 기술자', '선박 설계사',
      '요리사', '셰프', '바리스타', '소믈리에', '제빵사', '영양사', '푸드 스타일리스트',
      '사진작가', '영상 편집자', '애니메이터', '일러스트레이터', '그래픽 디자이너',
      '음악가', '작곡가', '작가', '번역가', '통역사', '기자', '편집자', '출판 기획자',
      '배우', '감독', '제작자', '성우', '모델', '인플루언서', '유튜버',
      '회계사', '세무사', '관세사', '공인중개사', '보험 설계사', '투자 상담사',
      '물류 담당자', '구매 담당자', '품질 관리자', '생산 관리자', '공장 기술자',
      '농업인', '어업인', '임업인', '원예사', '수의사', '동물 조련사',
    ],
  },
  {
    category: '시간대',
    items: [
      'UTC-12:00 베이커 섬', 'UTC-11:00 아메리칸사모아', 'UTC-10:00 하와이',
      'UTC-09:30 마르키즈 제도', 'UTC-09:00 알래스카', 'UTC-08:00 태평양(미국)',
      'UTC-07:00 산악(미국)', 'UTC-06:00 중부(미국)', 'UTC-05:00 동부(미국)',
      'UTC-04:30 베네수엘라', 'UTC-04:00 대서양', 'UTC-03:30 뉴펀들랜드',
      'UTC-03:00 브라질리아', 'UTC-02:00 남대서양', 'UTC-01:00 카보베르데',
      'UTC+00:00 런던', 'UTC+01:00 파리/베를린', 'UTC+02:00 카이로/아테네',
      'UTC+03:00 모스크바/이스탄불', 'UTC+03:30 이란', 'UTC+04:00 두바이/바쿠',
      'UTC+04:30 아프가니스탄', 'UTC+05:00 카라치/타슈켄트',
      'UTC+05:30 인도(뭄바이/델리)', 'UTC+05:45 네팔', 'UTC+06:00 다카',
      'UTC+06:30 양곤', 'UTC+07:00 방콕/하노이', 'UTC+08:00 서울/베이징/싱가포르',
      'UTC+08:30 북한', 'UTC+08:45 오스트레일리아(중서부)', 'UTC+09:00 도쿄/서울',
      'UTC+09:30 오스트레일리아(중부)', 'UTC+10:00 시드니/블라디보스토크',
      'UTC+10:30 로드하우 섬', 'UTC+11:00 솔로몬제도', 'UTC+12:00 오클랜드/피지',
      'UTC+12:45 챗햄 제도', 'UTC+13:00 통가', 'UTC+14:00 라인 제도',
    ],
  },
  {
    category: '전화번호 국가코드',
    items: [
      '+1 미국/캐나다', '+7 러시아', '+20 이집트', '+27 남아프리카공화국',
      '+30 그리스', '+31 네덜란드', '+32 벨기에', '+33 프랑스', '+34 스페인',
      '+36 헝가리', '+39 이탈리아', '+40 루마니아', '+41 스위스', '+43 오스트리아',
      '+44 영국', '+45 덴마크', '+46 스웨덴', '+47 노르웨이', '+48 폴란드',
      '+49 독일', '+51 페루', '+52 멕시코', '+53 쿠바', '+54 아르헨티나',
      '+55 브라질', '+56 칠레', '+57 콜롬비아', '+58 베네수엘라', '+60 말레이시아',
      '+61 오스트레일리아', '+62 인도네시아', '+63 필리핀', '+64 뉴질랜드',
      '+65 싱가포르', '+66 태국', '+81 일본', '+82 대한민국', '+84 베트남',
      '+86 중국', '+90 터키', '+91 인도', '+92 파키스탄', '+93 아프가니스탄',
      '+94 스리랑카', '+95 미얀마', '+98 이란', '+212 모로코', '+213 알제리',
      '+216 튀니지', '+218 리비아', '+220 감비아', '+221 세네갈', '+234 나이지리아',
      '+254 케냐', '+255 탄자니아', '+256 우간다', '+260 잠비아', '+263 짐바브웨',
      '+351 포르투갈', '+352 룩셈부르크', '+353 아일랜드', '+354 아이슬란드',
      '+355 알바니아', '+356 몰타', '+357 키프로스', '+358 핀란드', '+359 불가리아',
      '+370 리투아니아', '+371 라트비아', '+372 에스토니아', '+380 우크라이나',
      '+381 세르비아', '+385 크로아티아', '+386 슬로베니아', '+420 체코',
      '+421 슬로바키아', '+852 홍콩', '+853 마카오', '+855 캄보디아', '+856 라오스',
      '+880 방글라데시', '+886 대만', '+960 몰디브', '+966 사우디아라비아',
      '+971 아랍에미리트', '+972 이스라엘', '+974 카타르', '+992 타지키스탄',
      '+993 투르크메니스탄', '+994 아제르바이잔', '+995 그루지야', '+996 키르기스스탄',
      '+998 우즈베키스탄',
    ],
  },
  {
    category: '생년도',
    items: Array.from({ length: 100 }, (_, i) => `${1925 + i}년`),
  },
  {
    category: '음식',
    items: [
      '김치찌개', '된장찌개', '비빔밥', '불고기', '갈비탕', '삼겹살', '떡볶이', '잡채',
      '냉면', '칼국수', '수제비', '순두부찌개', '감자탕', '삼계탕', '해물파전', '김밥',
      '라면', '우동', '짜장면', '짬뽕', '탕수육', '마파두부', '볶음밥', '카레라이스',
      '돈까스', '오므라이스', '초밥', '사시미', '라멘', '규동', '타코야키', '교자',
      '팟타이', '쌀국수', '톰얌쿵', '그린커리', '나시고랭', '반미', '피자', '파스타',
      '햄버거', '스테이크', '리조또', '그라탱', '타코', '부리또', '퀘사디아', '팔라펠',
      '케밥', '훈제연어', '피쉬앤칩스', '미트파이', '크로크무슈', '갈레트', '뇨끼', '뫼슬리',
    ],
  },
  {
    category: '동물',
    items: [
      '강아지', '고양이', '토끼', '햄스터', '기니피그', '앵무새', '거북이', '금붕어',
      '이구아나', '카멜레온', '페럿', '친칠라', '고슴도치', '미어캣', '너구리', '수달',
      '알파카', '라마', '양', '염소', '돼지', '소', '말', '당나귀',
      '사슴', '기린', '코끼리', '하마', '코뿔소', '얼룩말', '사자', '호랑이',
      '표범', '치타', '늑대', '여우', '곰', '판다', '코알라', '캥거루',
      '펭귄', '플라밍고', '독수리', '올빼미', '부엉이', '학', '공작', '까마귀',
      '돌고래', '고래', '상어', '해파리', '문어', '오징어', '가재', '랍스터',
    ],
  },
  {
    category: '대학교',
    items: [
      '서울대학교', '연세대학교', '고려대학교', '성균관대학교', '한양대학교',
      '중앙대학교', '경희대학교', '서강대학교', '이화여자대학교', '홍익대학교',
      '건국대학교', '동국대학교', '숙명여자대학교', '국민대학교', '세종대학교',
      '단국대학교', '광운대학교', '명지대학교', '상명대학교', '가톨릭대학교',
      '아주대학교', '인하대학교', '숭실대학교', '한국외국어대학교', '서울시립대학교',
      '부산대학교', '경북대학교', '전남대학교', '충남대학교', '충북대학교',
      '강원대학교', '제주대학교', '한국과학기술원', '포항공과대학교', '울산과학기술원',
      '광주과학기술원', '한국예술종합학교', '서울과학기술대학교', '한국체육대학교',
      '한국항공대학교', '한국해양대학교', '서울교육대학교', '한국교원대학교',
    ],
  },
  {
    category: '은행',
    items: [
      'KB국민은행', '신한은행', '하나은행', '우리은행', 'NH농협은행', 'IBK기업은행',
      'SC제일은행', '한국씨티은행', 'DGB대구은행', 'BNK부산은행', 'BNK경남은행',
      '광주은행', '전북은행', '제주은행', 'SBI저축은행', 'OK저축은행',
      '웰컴저축은행', '페퍼저축은행', '한국투자저축은행', 'OSB저축은행',
      '카카오뱅크', '케이뱅크', '토스뱅크', '한국수출입은행', '한국산업은행',
      '수협은행', '새마을금고', '신협', '우체국', '한국증권금융',
      'KB증권', 'NH투자증권', '삼성증권', '미래에셋증권', '키움증권',
      '한국투자증권', '신한투자증권', '하나증권', '대신증권', 'DB금융투자',
      '유안타증권', '이베스트투자증권', '교보증권', 'SK증권', '현대차증권',
    ],
  },
  {
    category: '프로그래밍 언어',
    items: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go',
      'Rust', 'Swift', 'Kotlin', 'Ruby', 'PHP', 'Perl', 'Scala', 'Haskell',
      'Clojure', 'Elixir', 'Erlang', 'F#', 'OCaml', 'Lua', 'R', 'MATLAB',
      'Julia', 'Dart', 'Objective-C', 'Assembly', 'COBOL', 'Fortran',
      'Pascal', 'Delphi', 'Visual Basic', 'Groovy', 'Tcl', 'Scheme',
      'Prolog', 'Lisp', 'Ada', 'VHDL', 'Verilog', 'SQL', 'Shell',
      'PowerShell', 'Bash', 'Zig', 'Nim', 'Crystal', 'V', 'Solidity',
      'Move', 'Cairo', 'WebAssembly', 'CoffeeScript', 'ReScript', 'Elm',
    ],
  },
];

// ---------------------------------------------------------------------------
// Target labels for ClutterFinder
// ---------------------------------------------------------------------------

const TARGET_LABELS = [
  '진짜 다운로드', '실제 로그인', '건너뛰기', '닫기', '구독 취소',
  '계정 삭제', '무료 체험 시작', '다음 단계', '제출하기', '계속하기',
  '무시하기', '나중에 하기', '설정 변경', '동의', '확인',
  '삭제', '저장', '거부하기', '해지 신청', '탈퇴하기',
  '비밀번호 변경', '결제하기', '취소하기', '로그아웃',
];

// ---------------------------------------------------------------------------
// CTA texts for HiddenRejectLink
// ---------------------------------------------------------------------------

const CTA_TEXTS = [
  '이 혜택 포기하기',
  '계속 진행',
  '아니요, 할인받지 않겠습니다',
  '정가로 구매하겠습니다',
  '무료 체험 포기',
  '놓치겠습니다',
  '구독 안 하겠습니다',
  '감사하지만 괜찮습니다',
  '나중에 하겠습니다',
  '건너뛰기',
];

// ---------------------------------------------------------------------------
// NavMaze target actions
// ---------------------------------------------------------------------------

const NAV_TARGET_ACTIONS = [
  '계정 삭제', '알림 끄기', '데이터 내보내기', '구독 취소',
  '비밀번호 변경', '2단계 인증 설정', '개인정보 설정', '결제 수단 관리',
  '주소록 편집', '언어 설정 변경', '앱 연결 관리', '마케팅 수신 거부',
  '로그인 기록 확인', '세션 관리', '백업 설정', '자동결제 해지',
  '프로필 비공개 설정', '위치 추적 끄기', '광고 개인화 거부', '쿠키 설정 변경',
  '데이터 삭제 요청', '이메일 수신 거부', '계정 비활성화', '환불 요청',
];

// ---------------------------------------------------------------------------
// StateFeedbackBroken field sets
// ---------------------------------------------------------------------------

const STATE_FEEDBACK_FIELD_SETS = [
  ['이름', '이메일', '비밀번호', '전화번호'],
  ['카드번호', '유효기간', 'CVC', '청구지 주소'],
  ['생년월일', '성별', '국적', '직업'],
  ['배송지', '수령인', '연락처', '배송 메모'],
  ['아이디', '비밀번호', '비밀번호 확인', '이메일'],
  ['회사명', '사업자번호', '대표자명', '업종'],
  ['닉네임', '자기소개', '관심사', '공개 여부'],
];

// ---------------------------------------------------------------------------
// Modal titles sets
// ---------------------------------------------------------------------------

const MODAL_TITLE_SETS = [
  ['알림', '중요한 안내', '마케팅 동의', '개인정보 수집', '최종 확인'],
  ['회원가입 완료', '이메일 인증', '추가 정보 입력', '서비스 이용약관', '완료'],
  ['쿠키 설정', '광고 개인화', '위치 정보 동의', '카메라 접근', '마이크 접근'],
  ['특별 혜택', '프리미엄 업그레이드', '한정 offer', '오늘만 할인', '놓치지 마세요'],
  ['오류 발생', '재시도 필요', '네트워크 오류', '서버 오류', '다시 시도'],
];

// ---------------------------------------------------------------------------
// Deterministic hash helper
// ---------------------------------------------------------------------------

function hashStr(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickStageType(archetype: string, referenceId: string): string {
  const pool = ARCHETYPE_TO_STAGE_TYPES[archetype];
  if (!pool || pool.length === 0) return 'modal_stack';
  const hash = hashStr(referenceId);
  return pool[hash % pool.length]!;
}

function pickFrom<T>(arr: T[], hash: number, offset = 0): T {
  return arr[(hash + offset) % arr.length]!;
}

// ---------------------------------------------------------------------------
// Params generation
// ---------------------------------------------------------------------------

function generateParams(type: string, refId: string, hash: number): Record<string, unknown> {
  // VolumeControl types
  if (
    type === 'volume_hover_slider' || type === 'volume_hyper_sensitive' ||
    type === 'volume_tiny_hitbox' || type === 'volume_hidden_icon' ||
    type === 'volume_reverse_mapping' || type === 'volume_random_jump' ||
    type === 'volume_circular_gesture' || type === 'volume_puzzle_lock' ||
    type === 'volume_physics_launcher' || type === 'volume_voice_shout'
  ) {
    const modeMap: Record<string, string> = {
      volume_hover_slider: 'hover_slider',
      volume_hyper_sensitive: 'hyper_sensitive',
      volume_tiny_hitbox: 'tiny_hitbox',
      volume_hidden_icon: 'hidden_icon',
      volume_reverse_mapping: 'reverse_mapping',
      volume_random_jump: 'random_jump',
      volume_circular_gesture: 'circular_gesture',
      volume_puzzle_lock: 'puzzle_lock',
      volume_physics_launcher: 'physics_launcher',
      volume_voice_shout: 'voice_shout',
    };
    const targetVolumes = [20, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
    const tolerances = [2, 3, 4, 5, 6, 7, 8, 10];
    const sensitivities = [0.5, 0.8, 1.0, 1.5, 2.0, 2.5, 3.0];
    const jitters = [0, 2, 5, 8, 10, 15, 20];
    return {
      mode: modeMap[type] ?? 'hover_slider',
      targetVolume: pickFrom(targetVolumes, hash, 1),
      tolerance: pickFrom(tolerances, hash, 2),
      sensitivity: pickFrom(sensitivities, hash, 3),
      jitterPx: pickFrom(jitters, hash, 4),
    };
  }

  // WizardFlow types
  if (type === 'endless_wizard_flow' || type === 'government_portal_popups') {
    const stepCounts = [4, 5, 6, 7, 8, 9, 10, 12];
    const decoyCtas = [1, 2, 2, 3, 3, 4, 5];
    const requiredFieldCounts = [2, 3, 4, 5, 6];
    return {
      mode: type === 'government_portal_popups' ? 'government_portal' : 'endless_wizard',
      stepCount: pickFrom(stepCounts, hash, 1),
      backResets: (hash % 3) !== 0,
      misleadingLabels: (hash % 2) === 0,
      decoyCtas: pickFrom(decoyCtas, hash, 2),
      forcedScroll: (hash % 4) !== 1,
      requiredFields: pickFrom(requiredFieldCounts, hash, 3),
    };
  }

  // ClutterFinder types
  if (type === 'clutter_find_cta' || type === 'chaotic_layout_scavenger') {
    const clutterCounts = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const scrollHeights = [1500, 1800, 2000, 2500, 2800, 3000, 3500, 4000];
    return {
      mode: type === 'chaotic_layout_scavenger' ? 'chaotic_layout' : 'clutter_page',
      targetLabel: pickFrom(TARGET_LABELS, hash, 1),
      clutterItems: pickFrom(clutterCounts, hash, 2),
      scrollHeight: pickFrom(scrollHeights, hash, 3),
      hasSimBadge: (hash % 3) === 0,
    };
  }

  // NavMaze types
  if (type === 'nav_ambiguity_map' || type === 'enterprise_filter_overload') {
    const menuDepths = [2, 3, 3, 3, 4, 4, 4];
    const misleadingCounts = [2, 2, 3, 3, 4, 4];
    const filterCounts = [5, 7, 8, 10, 12, 15];
    return {
      mode: type === 'enterprise_filter_overload' ? 'filter_overload' : 'nav_maze',
      targetAction: pickFrom(NAV_TARGET_ACTIONS, hash, 1),
      menuDepth: pickFrom(menuDepths, hash, 2),
      misleadingMenus: pickFrom(misleadingCounts, hash, 3),
      filterCount: pickFrom(filterCounts, hash, 4),
      hiddenApplyButton: (hash % 2) === 0,
    };
  }

  // PickerNoSearch
  if (type === 'picker_no_search') {
    const poolIndex = hash % PICKER_POOLS.length;
    const pool = PICKER_POOLS[poolIndex]!;
    const targetIndex = (hash * 7 + 13) % pool.items.length;
    return {
      items: pool.items,
      targetIndex,
      category: pool.category,
    };
  }

  // LabelAmbiguity
  if (type === 'label_ambiguity') {
    const dialogCounts = [2, 3, 4, 5, 6, 7, 8];
    return {
      dialogCount: pickFrom(dialogCounts, hash, 1),
      includeIcons: (hash % 2) === 0,
    };
  }

  // ConsentToggleLabour
  if (type === 'consent_toggle_labour') {
    const toggleCounts = [5, 7, 8, 10, 12, 14, 15, 18, 20];
    return {
      toggleCount: pickFrom(toggleCounts, hash, 1),
      hasRejectAll: false,
    };
  }

  // ModalStack
  if (type === 'modal_stack') {
    const layerCounts = [3, 4, 5, 5, 6, 7, 8, 9, 10];
    const closeControls: ('x' | 'button')[] = ['x', 'button', 'x', 'button', 'x'];
    const closeOrders: ('topFirst' | 'any')[] = ['topFirst', 'any', 'topFirst', 'topFirst', 'any'];
    const titleSet = MODAL_TITLE_SETS[hash % MODAL_TITLE_SETS.length]!;
    return {
      layers: pickFrom(layerCounts, hash, 1),
      closeControl: pickFrom(closeControls, hash, 2),
      closeOrder: pickFrom(closeOrders, hash, 3),
      wrongCloseAddsLayer: (hash % 3) === 0,
      requiresScrollToEnableClose: (hash % 4) === 0,
      modalTitles: titleSet,
    };
  }

  // RoachMotelFlow
  if (type === 'roach_motel_flow') {
    const stepCounts = [3, 4, 5, 5, 6, 7, 8];
    return {
      steps: pickFrom(stepCounts, hash, 1),
      requireTyping: (hash % 2) === 0,
    };
  }

  // HiddenRejectLink
  if (type === 'hidden_reject_link') {
    const positions: ('bottom-left' | 'bottom-right' | 'inline-text' | 'after-tos')[] = [
      'bottom-left', 'bottom-right', 'inline-text', 'after-tos',
    ];
    const opacities = [0.05, 0.08, 0.10, 0.12, 0.15, 0.18, 0.20, 0.25, 0.30];
    return {
      linkPosition: pickFrom(positions, hash, 1),
      linkOpacity: pickFrom(opacities, hash, 2),
      ctaText: pickFrom(CTA_TEXTS, hash, 3),
    };
  }

  // DisguisedCtaGrid
  if (type === 'disguised_cta_grid') {
    const gridSizes = [3, 3, 4, 4, 5, 5, 6];
    const disguisedCounts = [1, 1, 2, 2, 3, 4];
    return {
      gridSize: pickFrom(gridSizes, hash, 1),
      disguisedCount: pickFrom(disguisedCounts, hash, 2),
      showSimBadge: (hash % 3) === 0,
    };
  }

  // StateFeedbackBroken
  if (type === 'state_feedback_broken') {
    const fieldSet = STATE_FEEDBACK_FIELD_SETS[hash % STATE_FEEDBACK_FIELD_SETS.length]!;
    return {
      fields: fieldSet,
      requireStatusCheck: (hash % 2) === 0,
    };
  }

  // MovingTarget
  if (type === 'moving_target') {
    const paths: ('bounce' | 'randomWalk')[] = ['bounce', 'randomWalk', 'bounce', 'randomWalk', 'bounce'];
    const reactionDelays = [100, 150, 200, 250, 300, 400, 500];
    const speeds = [50, 80, 100, 120, 150, 180, 200];
    const jitters = [5, 8, 10, 15, 20, 25, 30];
    return {
      path: pickFrom(paths, hash, 1),
      reactionDelayMs: pickFrom(reactionDelays, hash, 2),
      speedPxPerSec: pickFrom(speeds, hash, 3),
      jitterPx: pickFrom(jitters, hash, 4),
    };
  }

  // TinyButton
  if (type === 'tiny_button') {
    const layouts: ('topRight' | 'center' | 'list')[] = ['topRight', 'center', 'list', 'topRight', 'center'];
    const visualSizes = [8, 10, 12, 14, 16, 18, 20];
    const hitSizes = [4, 5, 6, 7, 8, 10, 12, 15];
    const decoyCounts = [3, 4, 5, 6, 8, 10, 12];
    return {
      layout: pickFrom(layouts, hash, 1),
      visualSizePx: pickFrom(visualSizes, hash, 2),
      hitSizePx: pickFrom(hitSizes, hash, 3),
      decoyCount: pickFrom(decoyCounts, hash, 4),
      shuffleOnMiss: (hash % 2) === 0,
    };
  }

  // fallback
  return {};
}

// ---------------------------------------------------------------------------
// Difficulty variation
// ---------------------------------------------------------------------------

function computeDifficulty(archetype: string, hash: number): 1 | 2 | 3 | 4 | 5 {
  const base = ARCHETYPE_DIFFICULTY[archetype] ?? 3;
  const offset = (hash % 3) - 1; // -1, 0, or +1
  const d = Math.max(1, Math.min(5, base + offset));
  return d as 1 | 2 | 3 | 4 | 5;
}

function getTimeLimitMs(difficulty: number): number {
  if (difficulty <= 1) return 35000;
  if (difficulty === 2) return 30000;
  if (difficulty === 3) return 25000;
  if (difficulty === 4) return 20000;
  return 15000;
}

const TYPE_MEME_CAPTIONS: Record<string, string[]> = {
  volume_hover_slider: [
    "마우스를 올리면 슬라이더가 나타나고, 떼면 사라집니다. 실화입니다.",
    "호버 슬라이더의 발명자는 트랙패드를 써본 적이 없나 봅니다.",
    "슬라이더가 부끄러움을 많이 타나 봐요. 마우스 올려야 나오다니.",
    "UX 디자이너가 '인터랙티브하게' 만들래서 이렇게 된 겁니다.",
    "이 슬라이더는 존재 자체가 미스터리입니다.",
  ],
  volume_hyper_sensitive: [
    "숨만 쉬어도 볼륨이 100%가 됩니다. 조심하세요.",
    "이 슬라이더의 감도는 지진계 수준입니다.",
    "0.1mm 움직이면 볼륨이 50 변합니다. 정상입니다.",
    "심장이 뛰는 것만으로도 볼륨이 변할 수 있습니다.",
    "외과의사의 손놀림이 필요한 볼륨 컨트롤입니다.",
  ],
  volume_tiny_hitbox: [
    "슬라이더는 있는데 크기가 개미만 합니다.",
    "이 슬라이더를 조작하려면 돋보기가 필요합니다.",
    "1픽셀 슬라이더를 만든 사람, 나와주세요.",
    "터치스크린에서는 절대 못 쓰는 슬라이더입니다.",
    "시력 검사가 아닌데 시력 검사 같은 UI입니다.",
  ],
  volume_hidden_icon: [
    "볼륨 조절? 먼저 찾아야죠. 꾹 눌러보세요.",
    "숨겨진 볼륨 아이콘을 찾는 것 자체가 미니게임입니다.",
    "이스터에그인 줄 알았는데 메인 기능이었습니다.",
    "UX 디자이너: '사용자가 찾는 재미도 있잖아요!'",
    "이 아이콘은 자기가 볼륨 컨트롤인 게 부끄러운 모양입니다.",
  ],
  volume_reverse_mapping: [
    "왼쪽으로 가면 볼륨이 올라갑니다. 직관적이죠?",
    "이 슬라이더는 거울 세계에서 왔습니다.",
    "반대로 동작하는 게 특징이자 버그입니다.",
    "사용자 테스트? 그게 뭔데요?",
    "오른쪽이 작아지는 세계에 오신 걸 환영합니다.",
  ],
  volume_random_jump: [
    "볼륨이 마음대로 점프합니다. 놀라지 마세요.",
    "이 슬라이더는 ADHD가 있습니다.",
    "조작할 때마다 노브가 도망갑니다.",
    "정확한 볼륨 조절은 운에 맡기세요.",
    "노브가 제멋대로 튀는 건 의도된 기능입니다.",
  ],
  volume_circular_gesture: [
    "볼륨 1을 올리려면 다이얼을 5바퀴 돌려야 합니다.",
    "팔목 운동과 볼륨 조절을 동시에 할 수 있습니다.",
    "원형 제스처로 볼륨 조절, 혁신이 아닌 고문입니다.",
    "이 다이얼을 돌리다 보면 손목이 먼저 항의합니다.",
    "회전식 볼륨의 로맨스, 2026년에는 아닙니다.",
  ],
  volume_puzzle_lock: [
    "볼륨을 조절하기 전에 퍼즐을 풀어야 합니다. 진짜로요.",
    "잠금 해제가 필요한 볼륨, 금고인 줄 알았습니다.",
    "볼륨에 보안을 건 개발자의 집착이 느껴집니다.",
    "1-3-2-4 순서를 외우셨나요? 볼륨 조절의 첫 관문입니다.",
    "매번 퍼즐을 풀어야 소리를 줄일 수 있다니.",
  ],
  volume_physics_launcher: [
    "볼륨을 발사체로 조절하는 시대가 왔습니다.",
    "물리 엔진으로 볼륨 조절, 과학이 UX를 만나면.",
    "정확한 볼륨은 포물선 계산 능력에 달렸습니다.",
    "볼륨 조절에 왜 발사 버튼이 필요한 거죠?",
    "이건 볼륨 컨트롤이 아니라 앵그리버드입니다.",
  ],
  volume_voice_shout: [
    "소리를 질러야 볼륨이 올라갑니다. 아이러니하죠.",
    "탭 속도로 볼륨 조절, 손가락 운동에 좋습니다.",
    "조용히 볼륨을 올리고 싶다면? 여기선 안 됩니다.",
    "빠르게 탭해서 볼륨 올리기, 모바일 게임인 줄 알았습니다.",
    "이 볼륨 컨트롤은 당신의 체력을 시험합니다.",
  ],
  tiny_button: [
    "동의 버튼이 개미만 합니다. 거부 버튼은 화면 전체죠.",
    "이 버튼을 누르려면 바늘이 필요합니다.",
    "작은 버튼에 숨겨진 진실: 누르면 안 되게 만든 겁니다.",
    "UI 디자이너: '버튼은 있잖아요. 크기가 문제인가요?'",
    "손가락이 두꺼운 사람은 영원히 동의할 수 없습니다.",
  ],
  moving_target: [
    "버튼이 도망갑니다. 정말로요.",
    "클릭하려는 순간 버튼이 이사를 갑니다.",
    "이 버튼은 사용자와 술래잡기를 하고 있습니다.",
    "움직이는 타겟, 게임이 아닌 실제 UI에서요.",
    "이 버튼을 누르면 당신은 진정한 UX 서바이버입니다.",
  ],
  modal_stack: [
    "팝업 위에 팝업, 그 위에 또 팝업. 팝업 타워입니다.",
    "팝업을 닫으면 새 팝업이 나타나는 무한 루프.",
    "이 팝업 스택은 하노이의 탑보다 어렵습니다.",
    "팝업 지옥에 오신 걸 환영합니다.",
    "팝업 6개를 순서대로 닫아야 합니다. 순서 틀리면 추가요.",
  ],
  picker_no_search: [
    "137개 항목 중 하나를 고르세요. 검색? 그런 건 없습니다.",
    "스크롤의 끝이 보이지 않는 드롭다운입니다.",
    "검색 기능을 빼면 사용자가 더 오래 머문다는 논리.",
    "이 목록을 다 보려면 커피 한 잔이 필요합니다.",
    "검색 없는 긴 목록, UX의 고전적 안티패턴입니다.",
  ],
  roach_motel_flow: [
    "구독은 원클릭, 해지는 12단계입니다.",
    "들어오긴 쉬운데 나가긴 어려운 바퀴벌레 모텔.",
    "해지 버튼이 왜 이렇게 잘 숨어있을까요.",
    "구독 취소를 포기하게 만드는 것이 목적인 UI입니다.",
    "'정말 떠나시겠어요?' 를 47번째 보고 있습니다.",
  ],
  consent_toggle_labour: [
    "쿠키 설정 스위치 73개를 하나하나 꺼야 합니다.",
    "개인정보 설정에 이렇게 많은 노동이 필요한 이유.",
    "모두 거부 버튼? 그런 건 사치입니다.",
    "스위치 하나하나에 당신의 인내심이 소모됩니다.",
    "개인정보 규정은 지키되, 최대한 불편하게.",
  ],
  hidden_reject_link: [
    "거절 링크가 배경색과 같은 색입니다. 투명 거절.",
    "\"괜찮습니다\"가 폰트 사이즈 8에 투명도 30%.",
    "이 UI에서 '아니오'를 찾으면 UX 탐정 자격증을 드립니다.",
    "수락 버튼은 형광색, 거절은 유령 텍스트.",
    "거절하고 싶다면 먼저 찾아야 합니다.",
  ],
  disguised_cta_grid: [
    "콘텐츠인 줄 알았는데 광고였습니다.",
    "진짜 버튼과 위장 광고, 구별할 수 있나요?",
    "클릭하면 광고, 안 하면 못 넘어가는 함정.",
    "진짜 콘텐츠와 광고의 경계가 사라진 UI입니다.",
    "스폰서 뱃지가 5픽셀 크기로 숨어있습니다.",
  ],
  state_feedback_broken: [
    "제출했는데 아무 반응이 없습니다. 된 건가요?",
    "로딩 중인지, 에러인지, 성공인지 알 수 없습니다.",
    "반응 없는 UI는 사용자를 불안하게 만듭니다.",
    "버튼을 눌렀는데 아무 일도 안 일어나면 당황스럽죠.",
    "상태 반응이 고장난 폼, 실제로 많이 존재합니다.",
  ],
  label_ambiguity: [
    "확인이 취소이고 취소가 확인인 세계.",
    "버튼 이름이 반대인 다이얼로그, 실화입니다.",
    "어떤 버튼이 진짜 '확인'인지 3초간 고민하게 됩니다.",
    "라벨만 보면 반대로 동작하는 UI의 공포.",
    "이 다이얼로그의 정답은 직감의 반대입니다.",
  ],
  clutter_find_cta: [
    "진짜 버튼을 찾아라! 화면에 가짜가 30개.",
    "광고, 배너, 팝업 사이에서 진짜 버튼을 찾는 서바이벌.",
    "어수선한 화면이 의도된 거라면, 이건 범죄입니다.",
    "정보 과부하 속에서 정답을 찾는 UX 지옥.",
    "이 화면에서 뭘 눌러야 하는지 3초 안에 찾으면 천재.",
  ],
  chaotic_layout_scavenger: [
    "요소들이 랜덤 위치에 겹쳐있는 카오스 레이아웃.",
    "이 레이아웃을 만든 사람은 CSS를 포기한 겁니다.",
    "정렬? 그게 뭔데요? 여긴 카오스입니다.",
    "모든 요소가 절대 좌표인 악몽의 화면.",
    "이 화면을 보면 디자인 시스템의 소중함을 알게 됩니다.",
  ],
  endless_wizard_flow: [
    "마법사 플로우가 끝나지 않습니다. 영원히요.",
    "7단계 중 5단계입니다. 그런데 7단계 뒤에 8단계가 있어요.",
    "뒤로 가면 처음부터 다시, 앞으로 가면 끝이 없는.",
    "이 폼을 완성하면 석사 학위를 줘야 합니다.",
    "끝없는 위저드 플로우, 인내심의 한계를 시험합니다.",
  ],
  government_portal_popups: [
    "관공서 웹사이트의 정수를 담았습니다.",
    "액티브엑스 없이도 이렇게 불편할 수 있습니다.",
    "스크롤 후 동의, 입력 후 팝업, 팝업 후 다시 입력.",
    "이 UI를 통과하면 민원 처리보다 어려운 건 없습니다.",
    "관공서 포털의 UX를 체험하세요. 체감 난이도: 극악.",
  ],
  nav_ambiguity_map: [
    "메뉴가 미로입니다. 정답은 5단계 아래에 있어요.",
    "설정을 찾으려면 일단 팀 > 그룹 > 채널 > 설정 > ...",
    "네비게이션이 이렇게 복잡할 필요가 있나요?",
    "이 메뉴 구조를 만든 사람도 길을 잃었을 겁니다.",
    "메뉴 깊이가 마리아나 해구보다 깊습니다.",
  ],
  enterprise_filter_overload: [
    "필터가 15개인데 '적용' 버튼이 안 보입니다.",
    "검색 필터의 과잉은 검색 불가와 같습니다.",
    "필터 옵션이 많으면 좋다고 누가 그랬나요.",
    "이 필터 UI를 통과하면 엑셀 고수가 됩니다.",
    "적용 버튼을 찾으려면 맨 아래까지 스크롤하세요.",
  ],
};

function generateTypeMemeCaption(type: string, params: Record<string, unknown>, hash: number): string {
  const captions = TYPE_MEME_CAPTIONS[type];
  if (!captions || captions.length === 0) {
    return "이 UI를 만든 사람은 반성해야 합니다.";
  }
  return captions[hash % captions.length]!;
}

// ---------------------------------------------------------------------------
// Type-based title generation (실제 렌더러와 일치하는 제목)
// ---------------------------------------------------------------------------

function generateTypeTitle(type: string, params: Record<string, unknown>, hash: number): string {
  switch (type) {
    case 'volume_hover_slider': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `호버로 볼륨 ${vol}% 맞추기` : '호버 슬라이더 볼륨 도전',
        '마우스 올려 볼륨 조절',
        '호버 감지 볼륨 컨트롤',
        vol != null ? `볼륨 ${vol}% 목표: 호버 조작` : '떠다니는 볼륨 슬라이더',
        '올려야만 작동하는 볼륨',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_hyper_sensitive': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `초민감 볼륨 ${vol}%로 맞추기` : '초민감 볼륨 컨트롤',
        '손 떨림 주의: 과민 슬라이더',
        '숨만 쉬어도 튀는 볼륨',
        vol != null ? `극초민감 슬라이더: 목표 ${vol}%` : '1픽셀이면 폭주하는 볼륨',
        '극도로 민감한 볼륨 조절',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_tiny_hitbox': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `초소형 히트박스로 ${vol}% 맞추기` : '초소형 볼륨 히트박스',
        '작디작은 볼륨 컨트롤',
        '찾을 수 없는 볼륨 클릭 영역',
        '히트박스 1px 볼륨 도전',
        vol != null ? `볼륨 ${vol}% 목표: 극소 버튼` : '눈 크게 뜨고 볼륨 찾기',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_hidden_icon': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `숨은 볼륨 아이콘으로 ${vol}%` : '숨겨진 볼륨 아이콘 찾기',
        '어디 있는지 모를 볼륨 버튼',
        '투명 볼륨 아이콘 탐색',
        '볼륨 컨트롤이 사라졌다',
        vol != null ? `볼륨 ${vol}% 목표: 아이콘 찾기` : '숨바꼭질 볼륨 UI',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_reverse_mapping': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `역방향 볼륨 ${vol}%로 맞추기` : '역방향 볼륨 슬라이더',
        '올리면 줄고 내리면 느는 볼륨',
        '반대로 움직이는 볼륨 컨트롤',
        vol != null ? `볼륨 ${vol}%: 뒤집힌 조작` : '직관 반대로 움직이는 볼륨',
        '역전된 볼륨 매핑 정복',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_random_jump': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `튀어다니는 볼륨 ${vol}% 잡기` : '랜덤 점프 볼륨 잡기',
        '예측 불가 볼륨 컨트롤',
        '점프하는 슬라이더 도전',
        vol != null ? `볼륨 ${vol}%: 랜덤 점프` : '불규칙 볼륨 슬라이더',
        '튀는 볼륨을 정복하라',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_circular_gesture': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `원형 제스처로 볼륨 ${vol}%` : '원형 다이얼 볼륨 조절',
        '돌려서 맞추는 볼륨 다이얼',
        '회전 제스처 볼륨 컨트롤',
        vol != null ? `볼륨 ${vol}%: 다이얼 돌리기` : '원을 그려 볼륨 맞추기',
        '시계 방향 볼륨 컨트롤',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_puzzle_lock': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `퍼즐 풀고 볼륨 ${vol}%` : '퍼즐 잠금 볼륨 해제',
        '잠긴 볼륨: 퍼즐을 풀어라',
        '보안 퍼즐 통과 후 볼륨 조절',
        vol != null ? `볼륨 ${vol}%: 퍼즐 해제 필요` : '볼륨 잠금 퍼즐 도전',
        '잠금 해제하고 볼륨 맞추기',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_physics_launcher': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `물리 발사로 볼륨 ${vol}%` : '물리 발사체 볼륨 조절',
        '던져서 볼륨 맞추기',
        '발사 각도로 볼륨 설정',
        vol != null ? `볼륨 ${vol}%: 물리 법칙` : '탄성 있는 볼륨 컨트롤',
        '물리 엔진 볼륨 챌린지',
      ];
      return pickFrom(titles, hash);
    }
    case 'volume_voice_shout': {
      const vol = params.targetVolume as number | undefined;
      const titles = [
        vol != null ? `소리쳐서 볼륨 ${vol}%로` : '외쳐서 볼륨 조절하기',
        '목소리로 제어하는 볼륨',
        '마이크에 대고 볼륨 맞추기',
        vol != null ? `볼륨 ${vol}%: 외치면 됩니다` : '음성 볼륨 컨트롤 도전',
        '소리 질러 볼륨 설정',
      ];
      return pickFrom(titles, hash);
    }
    case 'endless_wizard_flow': {
      const steps = params.stepCount as number | undefined;
      const titles = [
        steps != null ? `${steps}단계 끝없는 마법사 흐름` : '끝없는 마법사 흐름',
        '단계가 끝나지 않는 절차',
        '다음 버튼의 저주',
        steps != null ? `${steps}개 단계 완주 도전` : '끝없는 단계 통과하기',
        '언제 끝나는지 모를 가입 절차',
      ];
      return pickFrom(titles, hash);
    }
    case 'government_portal_popups': {
      const steps = params.stepCount as number | undefined;
      const titles = [
        steps != null ? `관공서 포털 ${steps}단계 통과` : '관공서 포털 팝업 지옥',
        '팝업이 끝없이 뜨는 포털',
        '공공기관 UI 탈출하기',
        steps != null ? `${steps}개 팝업 닫고 목표 달성` : '공무원식 웹사이트 통과',
        '관공서 스타일 UI 정복',
      ];
      return pickFrom(titles, hash);
    }
    case 'clutter_find_cta': {
      const label = params.targetLabel as string | undefined;
      const count = params.clutterItems as number | undefined;
      const titles = [
        label != null ? `"${label}" 버튼 찾기` : '광고 속 진짜 버튼 찾기',
        count != null ? `${count}개 항목 중 진짜 버튼` : '가짜 버튼 속 진짜 찾기',
        '광고 도배 속 진짜 링크 구별',
        '혼잡한 화면에서 실제 버튼 찾기',
        label != null ? `잡동사니 속 "${label}" 찾기` : '페이크 속 진짜 버튼 클릭',
      ];
      return pickFrom(titles, hash);
    }
    case 'chaotic_layout_scavenger': {
      const label = params.targetLabel as string | undefined;
      const titles = [
        label != null ? `혼돈 레이아웃에서 "${label}" 찾기` : '혼돈 레이아웃 탐색',
        '엉망인 화면에서 목표 버튼 찾기',
        '뒤죽박죽 UI 속 진짜 기능 찾기',
        '카오틱 레이아웃 스캐빈저',
        label != null ? `난잡한 UI 속 "${label}"` : '무질서한 레이아웃 정복',
      ];
      return pickFrom(titles, hash);
    }
    case 'nav_ambiguity_map': {
      const action = params.targetAction as string | undefined;
      const depth = params.menuDepth as number | undefined;
      const titles = [
        action != null ? `메뉴 미로: ${action} 찾기` : '모호한 메뉴 미로 탐색',
        depth != null ? `${depth}단계 중첩 메뉴 탐색` : '혼란스러운 네비게이션 정복',
        action != null ? `숨겨진 ${action} 메뉴 찾기` : '메뉴 미로에서 탈출',
        '모호한 메뉴명 속 정답 찾기',
        action != null ? `중첩 메뉴: ${action}` : '네비게이션 미로 도전',
      ];
      return pickFrom(titles, hash);
    }
    case 'enterprise_filter_overload': {
      const count = params.filterCount as number | undefined;
      const action = params.targetAction as string | undefined;
      const titles = [
        count != null ? `${count}개 필터 과부하 극복` : '기업용 필터 과부하',
        action != null ? `필터 지옥: ${action} 찾기` : '복잡한 필터 UI 정복',
        count != null ? `${count}개 필터 옵션 탐색` : '과도한 필터 UI 통과',
        '엔터프라이즈 필터 지옥',
        action != null ? `필터 미로에서 ${action}` : '수십 개 필터로 목표 찾기',
      ];
      return pickFrom(titles, hash);
    }
    case 'picker_no_search': {
      const category = params.category as string | undefined;
      const items = params.items as unknown[] | undefined;
      const count = items?.length;
      const titles = [
        count != null && category != null ? `${count}개 ${category}에서 찾기: 검색 불가` : '검색 없는 긴 목록 탐색',
        category != null ? `${category} 스크롤 선택 도전` : '끝없는 드롭다운 정복',
        count != null ? `${count}개 항목 중 정답 고르기` : '검색 없이 목록 탐색',
        category != null ? `${category}: 필터 없이 찾기` : '드롭다운 스크롤 지옥',
        count != null && category != null ? `${count}개 ${category} 목록: 검색 없음` : '스크롤로만 선택하기',
      ];
      return pickFrom(titles, hash);
    }
    case 'label_ambiguity': {
      const count = params.dialogCount as number | undefined;
      const titles = [
        count != null ? `${count}개 모호한 다이얼로그 통과` : '모호한 버튼 이름 도전',
        'OK/Cancel이 뒤바뀐 다이얼로그',
        '헷갈리는 버튼 이름 정복',
        count != null ? `${count}개 혼동 다이얼로그 클리어` : '의미 불명 버튼 선택',
        '이름 모호성 다이얼로그 통과',
      ];
      return pickFrom(titles, hash);
    }
    case 'consent_toggle_labour': {
      const count = params.toggleCount as number | undefined;
      const titles = [
        count != null ? `${count}개 쿠키 스위치 수동 거부` : '쿠키 동의 스위치 노동',
        count != null ? `${count}개 동의 항목 수동 해제` : '수동 동의 스위치 지옥',
        '"모두 거부" 없는 쿠키 설정',
        count != null ? `${count}개 스위치 하나씩 끄기` : '개별 쿠키 스위치 정복',
        '쿠키 동의 노동 챌린지',
      ];
      return pickFrom(titles, hash);
    }
    case 'state_feedback_broken': {
      const fields = params.fields as string[] | undefined;
      const titles = [
        '반응 없는 폼 완성 도전',
        '오류 메시지 제로 폼 채우기',
        fields != null ? `${fields.length}개 필드: 반응 없음` : '상태 표시 없는 폼 제출',
        '시행착오로 폼 완성하기',
        '반응이 깨진 입력 양식',
      ];
      return pickFrom(titles, hash);
    }
    case 'modal_stack': {
      const layers = params.layers as number | undefined;
      const titles = [
        layers != null ? `${layers}겹 팝업 닫기 도전` : '팝업 스택 해체하기',
        '겹겹이 쌓인 팝업 닫기',
        layers != null ? `${layers}개 팝업 스택 클리어` : '팝업 위의 팝업 처리',
        '끝없이 쌓이는 팝업 정복',
        layers != null ? `${layers}층 팝업 탑 해체` : '팝업 스택 순서대로 닫기',
      ];
      return pickFrom(titles, hash);
    }
    case 'roach_motel_flow': {
      const steps = params.steps as number | undefined;
      const titles = [
        steps != null ? `${steps}단계 구독 취소 탈출` : '함정 설계 탈출 도전',
        '가입은 쉽고 탈퇴는 험난',
        steps != null ? `${steps}개 관문 뚫고 해지하기` : '숨겨진 탈퇴 절차 완료',
        '구독 취소 미로 탈출',
        steps != null ? `${steps}단계 해지 흐름 클리어` : '함정 설계 패턴 정복',
      ];
      return pickFrom(titles, hash);
    }
    case 'hidden_reject_link': {
      const opacity = params.linkOpacity as number | undefined;
      const pct = opacity != null ? Math.round(opacity * 100) : undefined;
      const titles = [
        pct != null ? `투명도 ${pct}% 거절 링크 찾기` : '숨겨진 거절 링크 찾기',
        '"아니요" 버튼을 찾아라',
        '거의 안 보이는 거절 옵션',
        pct != null ? `불투명도 ${pct}% 숨겨진 거부` : '투명 거절 버튼 탐색',
        '유도 버튼 속 진짜 거절 찾기',
      ];
      return pickFrom(titles, hash);
    }
    case 'disguised_cta_grid': {
      const size = params.gridSize as number | undefined;
      const fakes = params.disguisedCount as number | undefined;
      const titles = [
        size != null ? `${size}×${size} 그리드: 진짜 버튼 찾기` : '위장 버튼 그리드 도전',
        fakes != null ? `${fakes}개 가짜 중 진짜 버튼 찾기` : '광고처럼 위장된 버튼 구별',
        '위장 버튼 그리드 정복',
        size != null ? `${size}×${size} 버튼 그리드 탐색` : '가짜 vs 진짜 버튼 구별',
        fakes != null ? `${fakes}개 위장 버튼 속 정답` : '위장 버튼 그리드 클리어',
      ];
      return pickFrom(titles, hash);
    }
    case 'moving_target': {
      const speed = params.speedPxPerSec as number | undefined;
      const titles = [
        speed != null ? `속도 ${speed}px/s 도망치는 버튼` : '움직이는 버튼 잡기',
        '도망가는 버튼을 클릭하라',
        '끊임없이 피하는 타겟 맞추기',
        speed != null ? `${speed}px/s로 도망치는 버튼` : '이동하는 버튼 포착',
        '반응하는 피하기 버튼 도전',
      ];
      return pickFrom(titles, hash);
    }
    case 'tiny_button': {
      const size = params.visualSizePx as number | undefined;
      const titles = [
        size != null ? `${size}px 초소형 버튼 클릭` : '초소형 버튼 클릭 도전',
        '거의 안 보이는 버튼 찾기',
        size != null ? `${size}px 버튼: 눈 부릅떠라` : '극미세 클릭 영역 정복',
        '작디작은 버튼 정확히 누르기',
        size != null ? `${size}px 크기 버튼 클릭 챌린지` : '초소형 타겟 클릭 챌린지',
      ];
      return pickFrom(titles, hash);
    }
    default:
      return '알 수 없는 UX 지옥 도전';
  }
}

// ---------------------------------------------------------------------------
// Variant system: easy / normal / hard
// ---------------------------------------------------------------------------

type Variant = 'easy' | 'normal' | 'hard';

const VARIANT_DIFFICULTY_OFFSET: Record<Variant, number> = {
  easy: -1,
  normal: 0,
  hard: 1,
};

const VARIANT_TIME_BONUS_MS: Record<Variant, number> = {
  easy: 10000,
  normal: 0,
  hard: -5000,
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Normal',
  4: 'Hard',
  5: 'Very Hard',
};

/** variant별로 다른 type을 선택해 같은 ref라도 다른 렌더러 사용 */
function pickStageTypeForVariant(archetype: string, referenceId: string, variant: Variant): string {
  const pool = ARCHETYPE_TO_STAGE_TYPES[archetype];
  if (!pool || pool.length === 0) return 'modal_stack';
  const hash = hashStr(referenceId);
  const variantOffset = variant === 'easy' ? 0 : variant === 'normal' ? 1 : 2;
  return pool[(hash + variantOffset) % pool.length]!;
}

/** variant에 따라 params를 스케일링 */
function scaleParams(params: Record<string, unknown>, variant: Variant, hash: number, type: string): Record<string, unknown> {
  const scaled = { ...params };

  if (variant === 'easy') {
    // 쉽게: 수치 줄이기 + 페널티 비활성화
    if (typeof scaled.clutterItems === 'number') scaled.clutterItems = Math.max(10, Math.round((scaled.clutterItems as number) * 0.6));
    if (typeof scaled.stepCount === 'number') scaled.stepCount = Math.max(3, (scaled.stepCount as number) - 2);
    if (typeof scaled.layers === 'number') scaled.layers = Math.max(2, (scaled.layers as number) - 2);
    if (typeof scaled.toggleCount === 'number') scaled.toggleCount = Math.max(3, Math.round((scaled.toggleCount as number) * 0.5));
    if (typeof scaled.dialogCount === 'number') scaled.dialogCount = Math.max(2, (scaled.dialogCount as number) - 1);
    if (typeof scaled.gridSize === 'number') scaled.gridSize = Math.max(2, (scaled.gridSize as number) - 1);
    if (typeof scaled.menuDepth === 'number') scaled.menuDepth = Math.max(2, (scaled.menuDepth as number) - 1);
    if (typeof scaled.steps === 'number') scaled.steps = Math.max(2, (scaled.steps as number) - 1);
    if (typeof scaled.tolerance === 'number') scaled.tolerance = Math.min(15, (scaled.tolerance as number) + 3);
    if (typeof scaled.linkOpacity === 'number') scaled.linkOpacity = Math.min(0.4, (scaled.linkOpacity as number) + 0.1);
    if (typeof scaled.visualSizePx === 'number') scaled.visualSizePx = Math.min(30, (scaled.visualSizePx as number) + 6);
    if (typeof scaled.hitSizePx === 'number') scaled.hitSizePx = Math.min(25, (scaled.hitSizePx as number) + 4);
    if (typeof scaled.decoyCount === 'number') scaled.decoyCount = Math.max(2, (scaled.decoyCount as number) - 2);
    if (typeof scaled.speedPxPerSec === 'number') scaled.speedPxPerSec = Math.max(30, Math.round((scaled.speedPxPerSec as number) * 0.6));
    scaled.wrongCloseAddsLayer = false;
    scaled.shuffleOnMiss = false;
  } else if (variant === 'normal') {
    // 보통: 페널티 둘 중 하나만 활성 (hash 기반)
    if (hash % 2 === 0) {
      scaled.wrongCloseAddsLayer = true;
      scaled.shuffleOnMiss = false;
    } else {
      scaled.wrongCloseAddsLayer = false;
      scaled.shuffleOnMiss = true;
    }
  } else if (variant === 'hard') {
    // 어렵게: 수치 늘리기 + 둘 다 활성 + type별 추가 장치
    if (typeof scaled.clutterItems === 'number') scaled.clutterItems = Math.round((scaled.clutterItems as number) * 1.5);
    if (typeof scaled.stepCount === 'number') scaled.stepCount = (scaled.stepCount as number) + 3;
    if (typeof scaled.layers === 'number') scaled.layers = Math.min(12, (scaled.layers as number) + 3);
    if (typeof scaled.toggleCount === 'number') scaled.toggleCount = Math.round((scaled.toggleCount as number) * 1.8);
    if (typeof scaled.dialogCount === 'number') scaled.dialogCount = Math.min(10, (scaled.dialogCount as number) + 2);
    if (typeof scaled.gridSize === 'number') scaled.gridSize = Math.min(8, (scaled.gridSize as number) + 1);
    if (typeof scaled.menuDepth === 'number') scaled.menuDepth = Math.min(6, (scaled.menuDepth as number) + 1);
    if (typeof scaled.steps === 'number') scaled.steps = Math.min(10, (scaled.steps as number) + 2);
    if (typeof scaled.tolerance === 'number') scaled.tolerance = Math.max(1, (scaled.tolerance as number) - 2);
    if (typeof scaled.linkOpacity === 'number') scaled.linkOpacity = Math.max(0.03, (scaled.linkOpacity as number) - 0.05);
    if (typeof scaled.visualSizePx === 'number') scaled.visualSizePx = Math.max(5, (scaled.visualSizePx as number) - 4);
    if (typeof scaled.hitSizePx === 'number') scaled.hitSizePx = Math.max(2, (scaled.hitSizePx as number) - 3);
    if (typeof scaled.decoyCount === 'number') scaled.decoyCount = (scaled.decoyCount as number) + 4;
    if (typeof scaled.speedPxPerSec === 'number') scaled.speedPxPerSec = Math.round((scaled.speedPxPerSec as number) * 1.6);
    scaled.wrongCloseAddsLayer = true;
    scaled.shuffleOnMiss = true;
    // Type별 추가 Hard 전용 장치
    if (type === 'hidden_reject_link') {
      scaled.fakeRejectLinks = true;
      scaled.scrollableToS = true;
      scaled.timerPopup = true;
    } else if (type === 'modal_stack') {
      scaled.fakeCloseTraps = true;
      scaled.dontShowAgainTrap = true;
      scaled.misleadingTitles = true;
    } else if (type === 'moving_target') {
      scaled.punishTapSpam = true;
      scaled.colorCycle = true;
    } else if (type === 'roach_motel_flow') {
      scaled.requireTyping = true;
    } else if (type === 'endless_wizard_flow') {
      scaled.misleadingLabels = true;
      scaled.backResets = true;
    } else if (type === 'state_feedback_broken') {
      scaled.requireStatusCheck = true;
    }
    // consent_toggle_labour: auto re-enable은 렌더러에 내장
  }

  // disguisedCount가 gridSize 이상이면 게임 불가능 → 보정
  if (typeof scaled.disguisedCount === 'number' && typeof scaled.gridSize === 'number') {
    scaled.disguisedCount = Math.min(scaled.disguisedCount as number, (scaled.gridSize as number) - 1);
  }

  return scaled;
}

// ---------------------------------------------------------------------------
// Main conversion: 1 ref → 3 variants
// ---------------------------------------------------------------------------

function referenceToVariants(ref: Reference): StageSpec[] {
  const variants: Variant[] = ['easy', 'normal', 'hard'];
  return variants.map((variant) => {
    const baseHash = hashStr(ref.id);
    const variantHash = hashStr(`${ref.id}_${variant}`);

    const type = pickStageTypeForVariant(ref.archetype, ref.id, variant);
    const baseDifficulty = ARCHETYPE_DIFFICULTY[ref.archetype] ?? 3;
    const rawDiff = baseDifficulty + VARIANT_DIFFICULTY_OFFSET[variant];
    const difficulty = Math.max(1, Math.min(5, rawDiff)) as 1 | 2 | 3 | 4 | 5;
    const timeLimitMs = Math.max(10000, getTimeLimitMs(difficulty) + VARIANT_TIME_BONUS_MS[variant]);

    // type 기반 objective 선택 (실제 렌더러 체험과 일치하도록)
    const typeObj = TYPE_OBJECTIVES[type];
    const objectives = typeObj ?? ARCHETYPE_OBJECTIVES[ref.archetype] ?? ['주어진 미션을 완료하세요'];
    const objective = pickFrom(objectives, variantHash, 5);

    // type 기반 explainWhyBad 선택 (실제 렌더러 컨셉과 일치하도록)
    const typeExplains = TYPE_EXPLAIN_WHY_BAD[type];
    const explains = typeExplains ?? ARCHETYPE_EXPLAIN_WHY_BAD[ref.archetype] ?? ['이 인터페이스는 UX 안티패턴을 보여줍니다.'];
    const explainWhyBad = pickFrom(explains, variantHash, 7);

    const baseParams = generateParams(type, ref.id, variantHash);
    const params = scaleParams(baseParams, variant, variantHash, type);

    return {
      id: `${ref.id}_${variant}`,
      type,
      title: `${generateTypeTitle(type, params, variantHash)}${variant !== 'normal' ? ` (${DIFFICULTY_LABEL[difficulty] ?? ''})` : ''}`,
      objective,
      memeCaption: generateTypeMemeCaption(type, params, variantHash),
      explainWhyBad,
      difficulty,
      timeLimitMs,
      allowHint: difficulty <= 2,
      allowSkip: true,
      packTag: 'uxhell',
      sourceTag: ref.sourceTag,
      patternTag: ref.archetype,
      params,
      meta: {
        referenceId: ref.id,
        url: ref.url,
        archetype: ref.archetype,
        kind: ref.kind,
        patternTags: ref.patternTags,
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Deduplication: type+params 완전 중복 제거
// ---------------------------------------------------------------------------

function deduplicateParams(stages: StageSpec[]): number {
  let dedupCount = 0;
  const usedSigs = new Set<string>();

  for (const stage of stages) {
    let sig = `${stage.type}:${JSON.stringify(stage.params)}`;

    if (!usedSigs.has(sig)) {
      usedSigs.add(sig);
      continue;
    }

    // Type-specific meaningful param variation
    let resolved = false;

    // picker_no_search: cycle through different PICKER_POOLS
    if (stage.type === 'picker_no_search' && Array.isArray(stage.params.items)) {
      const currentCategory = stage.params.category as string;
      for (let poolIdx = 0; poolIdx < PICKER_POOLS.length; poolIdx++) {
        const pool = PICKER_POOLS[poolIdx]!;
        if (pool.category === currentCategory) continue;
        const targetIndex = hashStr(stage.id + poolIdx) % pool.items.length;
        const candidate = { ...stage.params, items: pool.items, targetIndex, category: pool.category };
        const candidateSig = `${stage.type}:${JSON.stringify(candidate)}`;
        if (!usedSigs.has(candidateSig)) {
          stage.params = candidate;
          sig = candidateSig;
          resolved = true;
          break;
        }
      }
      // Also try different targetIndex within same pool
      if (!resolved) {
        for (let offset = 1; offset < 50; offset++) {
          const items = stage.params.items as string[];
          const newIdx = (stage.params.targetIndex as number + offset) % items.length;
          const candidate = { ...stage.params, targetIndex: newIdx };
          const candidateSig = `${stage.type}:${JSON.stringify(candidate)}`;
          if (!usedSigs.has(candidateSig)) {
            stage.params = candidate;
            sig = candidateSig;
            resolved = true;
            break;
          }
        }
      }
    }

    // clutter_find_cta / chaotic_layout_scavenger: cycle targetLabel
    if (!resolved && (stage.type === 'clutter_find_cta' || stage.type === 'chaotic_layout_scavenger')) {
      const currentLabel = stage.params.targetLabel as string;
      for (let i = 0; i < TARGET_LABELS.length; i++) {
        if (TARGET_LABELS[i] === currentLabel) continue;
        const candidate = { ...stage.params, targetLabel: TARGET_LABELS[i] };
        const candidateSig = `${stage.type}:${JSON.stringify(candidate)}`;
        if (!usedSigs.has(candidateSig)) {
          stage.params = candidate;
          sig = candidateSig;
          resolved = true;
          break;
        }
      }
      // Also vary clutterItems + scrollHeight
      if (!resolved) {
        for (let offset = 1; offset < 30; offset++) {
          for (let li = 0; li < TARGET_LABELS.length; li++) {
            const candidate = {
              ...stage.params,
              targetLabel: TARGET_LABELS[li],
              clutterItems: (stage.params.clutterItems as number) + offset * 3,
              scrollHeight: (stage.params.scrollHeight as number) + offset * 200,
            };
            const candidateSig = `${stage.type}:${JSON.stringify(candidate)}`;
            if (!usedSigs.has(candidateSig)) {
              stage.params = candidate;
              sig = candidateSig;
              resolved = true;
              break;
            }
          }
          if (resolved) break;
        }
      }
    }

    // nav_ambiguity_map / enterprise_filter_overload: cycle targetAction
    if (!resolved && (stage.type === 'nav_ambiguity_map' || stage.type === 'enterprise_filter_overload')) {
      const currentAction = stage.params.targetAction as string;
      for (let i = 0; i < NAV_TARGET_ACTIONS.length; i++) {
        if (NAV_TARGET_ACTIONS[i] === currentAction) continue;
        const candidate = { ...stage.params, targetAction: NAV_TARGET_ACTIONS[i] };
        const candidateSig = `${stage.type}:${JSON.stringify(candidate)}`;
        if (!usedSigs.has(candidateSig)) {
          stage.params = candidate;
          sig = candidateSig;
          resolved = true;
          break;
        }
      }
      // Also vary menuDepth + misleadingMenus
      if (!resolved) {
        for (let offset = 1; offset < 20; offset++) {
          for (let ai = 0; ai < NAV_TARGET_ACTIONS.length; ai++) {
            const candidate = {
              ...stage.params,
              targetAction: NAV_TARGET_ACTIONS[ai],
              menuDepth: Math.min(6, (stage.params.menuDepth as number) + (offset % 3)),
              misleadingMenus: Math.min(5, (stage.params.misleadingMenus as number) + ((offset + 1) % 2)),
            };
            const candidateSig = `${stage.type}:${JSON.stringify(candidate)}`;
            if (!usedSigs.has(candidateSig)) {
              stage.params = candidate;
              sig = candidateSig;
              resolved = true;
              break;
            }
          }
          if (resolved) break;
        }
      }
    }

    // Generic fallback for other types: increment numeric keys
    if (!resolved) {
      const numericKeys = Object.keys(stage.params).filter(
        k => k !== '_seed' && typeof stage.params[k] === 'number'
      );

      if (numericKeys.length === 0) {
        let seed = hashStr(stage.id) % 10000;
        stage.params._seed = seed;
        sig = `${stage.type}:${JSON.stringify(stage.params)}`;
        while (usedSigs.has(sig)) {
          seed++;
          stage.params._seed = seed;
          sig = `${stage.type}:${JSON.stringify(stage.params)}`;
        }
      } else {
        const origValues = new Map(numericKeys.map(k => [k, stage.params[k] as number]));
        let attempt = 0;
        while (usedSigs.has(sig) && attempt < 100) {
          attempt++;
          for (const [key, origVal] of origValues) {
            stage.params[key] = Number.isInteger(origVal)
              ? origVal + attempt
              : Math.round((origVal + attempt * 0.07) * 100) / 100;
          }
          sig = `${stage.type}:${JSON.stringify(stage.params)}`;
        }
      }
    }

    usedSigs.add(sig);
    dedupCount++;

    // params가 변경됐으므로 제목도 params 기반으로 재생성
    const suffix = stage.title.endsWith(' (Easy)') ? ' (Easy)'
      : stage.title.endsWith(' (Hard)') ? ' (Hard)'
      : '';
    stage.title = `${generateTypeTitle(stage.type, stage.params, hashStr(stage.id))}${suffix}`;
  }

  return dedupCount;
}

// ---------------------------------------------------------------------------
// Title deduplication: 동일 제목에 번호 suffix 부여
// ---------------------------------------------------------------------------

function deduplicateTitles(stages: StageSpec[]): number {
  let dedupCount = 0;
  const titleCount = new Map<string, number>();

  // 1pass: 각 제목이 몇 번 나오는지 집계
  for (const stage of stages) {
    titleCount.set(stage.title, (titleCount.get(stage.title) ?? 0) + 1);
  }

  // 중복이 있는 제목만 처리
  const duplicatedTitles = new Set([...titleCount.entries()]
    .filter(([, count]) => count > 1)
    .map(([title]) => title));

  if (duplicatedTitles.size === 0) return 0;

  // 2pass: 중복 제목에 순번 부여
  const titleSeq = new Map<string, number>();
  for (const stage of stages) {
    if (!duplicatedTitles.has(stage.title)) continue;
    const seq = (titleSeq.get(stage.title) ?? 0) + 1;
    titleSeq.set(stage.title, seq);
    stage.title = `${stage.title} #${seq}`;
    dedupCount++;
  }

  return dedupCount;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const projectRoot = path.resolve(__dirname, '..');
  const inputPath = path.join(projectRoot, 'src/content/uxhell/uxhell.references.json');
  const outputPath = path.join(projectRoot, 'src/stages/stages.uxhell.json');

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const references: Reference[] = JSON.parse(raw);

  const totalCount = references.length;
  const excluded = references.filter(r => r.kind === 'external_bonus');
  const included = references.filter(r => r.kind !== 'external_bonus');

  // 각 ref → 3 variants (easy/normal/hard) 생성
  const stages: StageSpec[] = included.flatMap(referenceToVariants);

  // id 기준 알파벳 정렬 (deterministic 출력 보장)
  stages.sort((a, b) => a.id.localeCompare(b.id));

  // type+params 중복 제거 (수치 파라미터 변형)
  const dedupCount = deduplicateParams(stages);

  // 제목 중복 제거 (동일 제목에 #N suffix 부여)
  const titleDedupCount = deduplicateTitles(stages);

  // 출력
  fs.writeFileSync(outputPath, JSON.stringify(stages, null, 2), 'utf-8');

  // 콘솔 통계
  const typeDistribution: Record<string, number> = {};
  for (const s of stages) {
    typeDistribution[s.type] = (typeDistribution[s.type] ?? 0) + 1;
  }

  const diffDistribution: Record<number, number> = {};
  for (const s of stages) {
    diffDistribution[s.difficulty] = (diffDistribution[s.difficulty] ?? 0) + 1;
  }

  const emptyParams = stages.filter(s => Object.keys(s.params).length === 0);
  const uniqueObjectives = new Set(stages.map(s => s.objective));
  const uniqueTypes = new Set(stages.map(s => s.type));

  console.log(`Total references: ${totalCount}`);
  console.log(`Excluded (external_bonus): ${excluded.length}`);
  console.log(`Included refs: ${included.length} × 3 variants = ${stages.length} stages`);
  console.log(`Unique types: ${uniqueTypes.size}`);
  console.log(`Unique objectives: ${uniqueObjectives.size}`);
  console.log('Difficulty spread:', diffDistribution);
  console.log('Type distribution:', typeDistribution);
  if (emptyParams.length > 0) {
    console.warn(`WARNING: ${emptyParams.length} stages have empty params`);
  } else {
    console.log('All stages have non-empty params.');
  }
  console.log(`Dedup: ${dedupCount} stages had params perturbed to ensure uniqueness`);
  console.log(`Title dedup: ${titleDedupCount} stages had duplicate titles resolved with #N suffix`);

  // 중복 검증
  const paramSigs = new Map<string, string[]>();
  for (const s of stages) {
    const sig = `${s.type}:${JSON.stringify(s.params)}`;
    const ids = paramSigs.get(sig) ?? [];
    ids.push(s.id);
    paramSigs.set(sig, ids);
  }
  const remaining = [...paramSigs.entries()].filter(([, ids]) => ids.length > 1);
  if (remaining.length > 0) {
    console.warn(`WARNING: ${remaining.length} duplicate type+params groups remain`);
    for (const [sig, ids] of remaining) {
      const type = sig.split(':')[0];
      console.warn(`  dup type="${type}" ids=[${ids.join(', ')}]`);
    }
  } else {
    console.log('All stages have unique type+params combinations.');
  }

  console.log(`Output written to: ${outputPath}`);
}

main();

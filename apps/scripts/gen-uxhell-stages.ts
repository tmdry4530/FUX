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
    '다크 패턴 인증 흐름을 탈출하세요',
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
    '피츠의 법칙이 울고 있습니다 - 클릭하세요',
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
    '다크 패턴을 뚫고 목표를 달성하세요',
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
    '직관적이지 않은 볼륨 컨트롤은 사용자에게 불필요한 인지 부담을 줍니다.',
    '예측 불가능한 볼륨 인터페이스는 기본적인 사용성 원칙을 위반합니다.',
    '볼륨 조절 UI는 단순해야 하는데, 이렇게 복잡하면 사용자는 그냥 소리를 끕니다.',
    '볼륨 컨트롤의 피드백이 불명확하면 사용자는 계속 시도하다 포기합니다.',
    '물리적 직관과 다른 볼륨 매핑은 인지 불협화를 일으킵니다.',
  ],
  slider_hell: [
    '슬라이더의 민감도나 동작이 예상과 다르면 사용자 경험이 크게 저하됩니다.',
    '예측 불가능한 슬라이더는 정밀 조작을 불가능하게 만들어 좌절감을 줍니다.',
    '슬라이더 UX의 핵심은 일관성인데, 이를 무너뜨리면 신뢰를 잃습니다.',
    '피드백 없는 슬라이더는 사용자가 현재 상태를 알 수 없게 합니다.',
    '비선형 슬라이더 응답은 사용자의 멘탈 모델을 완전히 무너뜨립니다.',
  ],
  scroll_hell: [
    '과도한 스크롤은 사용자의 시간을 낭비하고 원하는 콘텐츠를 찾기 어렵게 만듭니다.',
    '끝없는 페이지는 사용자에게 진행 상황을 알 수 없게 해 불안감을 줍니다.',
    '중요한 기능을 스크롤 끝에 숨기는 것은 의도적인 접근성 방해입니다.',
    '스크롤 중 레이아웃 변경은 사용자의 위치 감각을 잃게 합니다.',
    '네비게이션 미로는 사용자가 원하는 것을 찾는 데 과도한 시간을 소비하게 합니다.',
  ],
  form_input_hell: [
    '복잡한 양식은 사용자 이탈의 주요 원인입니다.',
    '불명확한 오류 메시지는 사용자가 무엇을 고쳐야 할지 모르게 합니다.',
    '너무 많은 필수 항목은 가입 완료율을 급격히 낮춥니다.',
    '폼 유효성 검사가 제출 후에만 일어나면 사용자 경험이 매우 나빠집니다.',
    '레이블이 불명확한 폼은 사용자에게 추측을 강요합니다.',
  ],
  dropdown_hell: [
    '검색 없는 긴 드롭다운은 선택을 고통스럽게 만듭니다.',
    '수백 개의 옵션이 있는 드롭다운은 키보드 탐색 없이는 사용 불가능합니다.',
    '알파벳순 정렬도 없는 긴 목록은 사용자를 절망하게 합니다.',
    '드롭다운에 검색 기능이 없으면 50개 이상의 항목은 고문입니다.',
    '정렬 기준이 불명확한 드롭다운은 원하는 항목 찾기를 도박으로 만듭니다.',
  ],
  auth_hell: [
    '의도적으로 복잡한 인증 절차는 사용자를 가두는 다크 패턴입니다.',
    '탈퇴 버튼을 숨기거나 어렵게 만드는 것은 로치 모텔 패턴의 전형입니다.',
    '과도한 확인 단계는 사용자가 포기하고 계정을 그냥 방치하게 만듭니다.',
    '구독 취소를 어렵게 만드는 것은 단기 수익에는 도움이 되지만 신뢰를 파괴합니다.',
    '로그인은 쉽고 로그아웃은 어렵게 만드는 비대칭 UX는 불신을 낳습니다.',
  ],
  captcha_hell: [
    '과도한 보안 인증은 실제 사용자마저 차단합니다.',
    '광고처럼 위장된 버튼은 사용자의 신뢰를 근본적으로 훼손합니다.',
    '진짜와 가짜를 구분하기 어렵게 만드는 UI는 사용자를 범죄 피해자로 만듭니다.',
    '캡차 남용은 접근성을 심각하게 해치고 장애인 사용자를 배제합니다.',
    '보안을 핑계로 사용자를 괴롭히는 것은 UX와 보안 모두를 망칩니다.',
  ],
  color_theme_hell: [
    '일관성 없는 색상 체계는 인터페이스의 가독성을 떨어뜨립니다.',
    '색상 대비가 낮은 UI는 시각 장애인이나 노인에게 사용 불가능합니다.',
    '의미 없이 색상을 남용하면 사용자는 색상으로 정보를 읽는 능력을 잃습니다.',
    '색상 피드백이 깨지면 사용자는 현재 상태를 파악할 수 없습니다.',
    '다크 모드와 라이트 모드 사이의 불일관성은 사용자 혼란을 야기합니다.',
  ],
  cursor_hell: [
    '작은 클릭 영역은 피츠의 법칙을 위반하여 조작을 어렵게 합니다.',
    '시각적 크기와 실제 클릭 영역의 불일치는 사용자를 혼란스럽게 합니다.',
    '움직이는 버튼은 접근성 지침을 위반하며 운동 장애가 있는 사용자를 배제합니다.',
    '히트박스가 너무 작은 버튼은 모바일에서 사용을 불가능하게 만듭니다.',
    '클릭 후 즉각적인 피드백이 없으면 사용자는 여러 번 클릭해 오류를 일으킵니다.',
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
    '이 인터페이스는 여러 UX 안티패턴을 복합적으로 보여줍니다.',
    '복합적인 다크 패턴은 단일 패턴보다 훨씬 더 해롭습니다.',
    '나쁜 UX 패턴들이 조합되면 사용자는 완전히 길을 잃습니다.',
    '여러 안티패턴의 결합은 사용자를 의도적으로 혼란시키려는 설계입니다.',
    '이런 UI를 사용하면 사용자는 서비스 자체를 불신하게 됩니다.',
  ],
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
];

// ---------------------------------------------------------------------------
// Target labels for ClutterFinder
// ---------------------------------------------------------------------------

const TARGET_LABELS = [
  '진짜 다운로드',
  '실제 로그인',
  '건너뛰기',
  '닫기',
  '구독 취소',
  '계정 삭제',
  '무료 체험 시작',
  '다음 단계',
  '제출하기',
  '계속하기',
  '무시하기',
  '나중에 하기',
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
  '계정 삭제',
  '알림 끄기',
  '데이터 내보내기',
  '구독 취소',
  '비밀번호 변경',
  '2단계 인증 설정',
  '개인정보 설정',
  '결제 수단 관리',
  '주소록 편집',
  '언어 설정 변경',
  '앱 연결 관리',
  '마케팅 수신 거부',
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
    const menuDepths = [3, 4, 4, 5, 5, 6, 7];
    const misleadingCounts = [2, 3, 3, 4, 5, 6];
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

function generateMemeCaption(title: string): string {
  return `"${title}" - 실제로 존재하는 UX입니다`;
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

const VARIANT_TITLE_SUFFIX: Record<Variant, string> = {
  easy: ' (Easy)',
  normal: '',
  hard: ' (Hard)',
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
function scaleParams(params: Record<string, unknown>, variant: Variant): Record<string, unknown> {
  const scaled = { ...params };

  if (variant === 'easy') {
    // 쉽게: 수치 줄이기
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
  } else if (variant === 'hard') {
    // 어렵게: 수치 늘리기
    if (typeof scaled.clutterItems === 'number') scaled.clutterItems = Math.round((scaled.clutterItems as number) * 1.5);
    if (typeof scaled.stepCount === 'number') scaled.stepCount = (scaled.stepCount as number) + 3;
    if (typeof scaled.layers === 'number') scaled.layers = Math.min(12, (scaled.layers as number) + 3);
    if (typeof scaled.toggleCount === 'number') scaled.toggleCount = Math.round((scaled.toggleCount as number) * 1.8);
    if (typeof scaled.dialogCount === 'number') scaled.dialogCount = Math.min(10, (scaled.dialogCount as number) + 2);
    if (typeof scaled.gridSize === 'number') scaled.gridSize = Math.min(8, (scaled.gridSize as number) + 1);
    if (typeof scaled.menuDepth === 'number') scaled.menuDepth = Math.min(9, (scaled.menuDepth as number) + 2);
    if (typeof scaled.steps === 'number') scaled.steps = Math.min(10, (scaled.steps as number) + 2);
    if (typeof scaled.tolerance === 'number') scaled.tolerance = Math.max(1, (scaled.tolerance as number) - 2);
    if (typeof scaled.linkOpacity === 'number') scaled.linkOpacity = Math.max(0.03, (scaled.linkOpacity as number) - 0.05);
    if (typeof scaled.visualSizePx === 'number') scaled.visualSizePx = Math.max(5, (scaled.visualSizePx as number) - 4);
    if (typeof scaled.hitSizePx === 'number') scaled.hitSizePx = Math.max(2, (scaled.hitSizePx as number) - 3);
    if (typeof scaled.decoyCount === 'number') scaled.decoyCount = (scaled.decoyCount as number) + 4;
    if (typeof scaled.speedPxPerSec === 'number') scaled.speedPxPerSec = Math.round((scaled.speedPxPerSec as number) * 1.6);
    scaled.wrongCloseAddsLayer = true;
    scaled.shuffleOnMiss = true;
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

    const objectives = ARCHETYPE_OBJECTIVES[ref.archetype] ?? ['주어진 미션을 완료하세요'];
    const objective = pickFrom(objectives, variantHash, 5);

    const explains = ARCHETYPE_EXPLAIN_WHY_BAD[ref.archetype] ?? ['이 인터페이스는 UX 안티패턴을 보여줍니다.'];
    const explainWhyBad = pickFrom(explains, baseHash, 7);

    const baseParams = generateParams(type, ref.id, variantHash);
    const params = scaleParams(baseParams, variant);

    return {
      id: `${ref.id}_${variant}`,
      type,
      title: `${ref.title}${VARIANT_TITLE_SUFFIX[variant]}`,
      objective,
      memeCaption: generateMemeCaption(ref.title),
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
  console.log(`Output written to: ${outputPath}`);
}

main();

/**
 * V3 Content Pack Generator
 * 20 seeds (10 volume + 10 web-hell) x variants = 100 levels
 */

const volumeSeeds = [
  {
    type: "volume_hover_slider",
    slug: "hover",
    titleBase: "유령 슬라이더",
    objectiveBase: "슬라이더 위에 손가락을 올려야만 보입니다. 벗어나면 사라져요!",
    memeBase: "슬라이더가 유령처럼 나타났다 사라진다",
    explainBase: "호버 시에만 나타나는 컨트롤은 발견 가능성(discoverability)을 극도로 저하시킵니다. 특히 터치 디바이스에서는 '호버' 개념 자체가 없어 접근성 위반입니다.",
    patternTag: "volume:hover",
    baseParams: { mode: "hover_slider", targetVolume: 50, tolerance: 5, showDelayMs: 500, hideOnOutMs: 200 },
    variants: [
      { diff: 1, tl: 30000, p: { targetVolume: 50, tolerance: 10, showDelayMs: 800, hideOnOutMs: 500 } },
      { diff: 2, tl: 25000, p: { targetVolume: 40, tolerance: 7, showDelayMs: 500, hideOnOutMs: 300 } },
      { diff: 3, tl: 20000, p: { targetVolume: 65, tolerance: 5, showDelayMs: 300, hideOnOutMs: 200 } },
      { diff: 4, tl: 18000, p: { targetVolume: 30, tolerance: 3, showDelayMs: 200, hideOnOutMs: 100 } },
      { diff: 5, tl: 15000, p: { targetVolume: 75, tolerance: 2, showDelayMs: 100, hideOnOutMs: 50 } },
    ]
  },
  {
    type: "volume_hyper_sensitive",
    slug: "hypersens",
    titleBase: "과민 슬라이더",
    objectiveBase: "조금만 움직여도 볼륨이 폭주합니다. 목표치에 정확히 맞추세요!",
    memeBase: "1mm 움직였는데 볼륨이 20에서 90으로",
    explainBase: "비선형 감도 곡선은 사용자에게 제어감을 빼앗습니다. 적절한 보간(interpolation)과 감속(deceleration) 없이 만든 슬라이더는 정밀 조작이 불가능합니다.",
    patternTag: "volume:hyper-sensitive",
    baseParams: { mode: "hyper_sensitive", targetVolume: 45, tolerance: 5, sensitivity: 5 },
    variants: [
      { diff: 1, tl: 25000, p: { targetVolume: 50, tolerance: 10, sensitivity: 3 } },
      { diff: 2, tl: 22000, p: { targetVolume: 35, tolerance: 7, sensitivity: 5 } },
      { diff: 3, tl: 20000, p: { targetVolume: 60, tolerance: 5, sensitivity: 8 } },
      { diff: 4, tl: 18000, p: { targetVolume: 25, tolerance: 3, sensitivity: 12 } },
      { diff: 5, tl: 15000, p: { targetVolume: 80, tolerance: 2, sensitivity: 20 } },
    ]
  },
  {
    type: "volume_tiny_hitbox",
    slug: "tinyhit",
    titleBase: "미세 터치 슬라이더",
    objectiveBase: "3px짜리 트랙을 정확히 터치해서 볼륨을 조절하세요!",
    memeBase: "슬라이더 잡으려면 현미경이 필요함",
    explainBase: "터치 타겟이 44px 미만이면 WCAG 접근성 기준을 위반합니다. 3px 트랙은 사실상 사용 불가능한 UI이며, 모바일에서는 더욱 심각합니다.",
    patternTag: "volume:tiny-hitbox",
    baseParams: { mode: "tiny_hitbox", targetVolume: 50, tolerance: 5, trackWidthPx: 3 },
    variants: [
      { diff: 1, tl: 30000, p: { targetVolume: 50, tolerance: 10, trackWidthPx: 8 } },
      { diff: 2, tl: 25000, p: { targetVolume: 40, tolerance: 7, trackWidthPx: 5 } },
      { diff: 3, tl: 22000, p: { targetVolume: 65, tolerance: 5, trackWidthPx: 3 } },
      { diff: 4, tl: 18000, p: { targetVolume: 30, tolerance: 3, trackWidthPx: 2 } },
      { diff: 5, tl: 15000, p: { targetVolume: 85, tolerance: 2, trackWidthPx: 1 } },
    ]
  },
  {
    type: "volume_hidden_icon",
    slug: "hidden",
    titleBase: "숨겨진 볼륨",
    objectiveBase: "스피커 아이콘을 길게 눌러야 숨겨진 슬라이더가 나타납니다!",
    memeBase: "볼륨 조절이 어딨는지 아무도 모름",
    explainBase: "중요한 기능을 아이콘 뒤에 숨기는 것은 발견성을 극도로 낮춥니다. 사용자가 우연히 발견하지 않는 한 기능의 존재 자체를 모르게 됩니다.",
    patternTag: "volume:hidden-icon",
    baseParams: { mode: "hidden_icon", targetVolume: 60, tolerance: 5, showDelayMs: 1000 },
    variants: [
      { diff: 1, tl: 30000, p: { targetVolume: 50, tolerance: 10, showDelayMs: 500 } },
      { diff: 2, tl: 25000, p: { targetVolume: 40, tolerance: 7, showDelayMs: 800 } },
      { diff: 3, tl: 22000, p: { targetVolume: 70, tolerance: 5, showDelayMs: 1000 } },
      { diff: 4, tl: 18000, p: { targetVolume: 25, tolerance: 3, showDelayMs: 1500 } },
      { diff: 5, tl: 15000, p: { targetVolume: 90, tolerance: 2, showDelayMs: 2000 } },
    ]
  },
  {
    type: "volume_reverse_mapping",
    slug: "reverse",
    titleBase: "거꾸로 슬라이더",
    objectiveBase: "오른쪽으로 드래그하면 볼륨이 줄어듭니다. 반대로 생각하세요!",
    memeBase: "오른쪽이 줄이는 거고 왼쪽이 올리는 거임",
    explainBase: "정신 모델(mental model)을 파괴하는 역방향 매핑은 사용자를 혼란에 빠뜨립니다. 관습적 방향성을 무시한 인터페이스는 학습 부담을 극대화합니다.",
    patternTag: "volume:reverse",
    baseParams: { mode: "reverse_mapping", targetVolume: 40, tolerance: 5 },
    variants: [
      { diff: 1, tl: 25000, p: { targetVolume: 50, tolerance: 10 } },
      { diff: 2, tl: 22000, p: { targetVolume: 35, tolerance: 7 } },
      { diff: 3, tl: 20000, p: { targetVolume: 70, tolerance: 5 } },
      { diff: 4, tl: 18000, p: { targetVolume: 20, tolerance: 3 } },
      { diff: 5, tl: 15000, p: { targetVolume: 85, tolerance: 2 } },
    ]
  },
  {
    type: "volume_random_jump",
    slug: "jump",
    titleBase: "순간이동 노브",
    objectiveBase: "노브가 드래그 중 랜덤으로 텔레포트합니다. 목표 볼륨에 도달하세요!",
    memeBase: "노브가 텔레포트하는 게 정상인 세계",
    explainBase: "사용자 입력과 무관하게 UI 요소가 움직이는 것은 에이전시(agency)를 빼앗는 행위입니다. 예측 불가능한 인터페이스는 사용자에게 좌절감을 줍니다.",
    patternTag: "volume:random-jump",
    baseParams: { mode: "random_jump", targetVolume: 55, tolerance: 5, jitterPx: 30 },
    variants: [
      { diff: 1, tl: 30000, p: { targetVolume: 50, tolerance: 10, jitterPx: 15 } },
      { diff: 2, tl: 25000, p: { targetVolume: 40, tolerance: 7, jitterPx: 25 } },
      { diff: 3, tl: 22000, p: { targetVolume: 65, tolerance: 5, jitterPx: 40 } },
      { diff: 4, tl: 18000, p: { targetVolume: 30, tolerance: 3, jitterPx: 60 } },
      { diff: 5, tl: 15000, p: { targetVolume: 80, tolerance: 2, jitterPx: 80 } },
    ]
  },
  {
    type: "volume_circular_gesture",
    slug: "circular",
    titleBase: "원형 다이얼",
    objectiveBase: "원형 다이얼을 계속 돌려서 볼륨을 맞추세요. 한 바퀴에 5%만 변합니다!",
    memeBase: "볼륨 1% 올리려고 다이얼을 20바퀴 돌림",
    explainBase: "과도하게 낮은 감도의 원형 컨트롤은 사용자에게 불필요한 반복 동작을 강요합니다. 효율적인 입력 방식이 존재하는데 비효율적 방식을 선택하는 것은 나쁜 UX입니다.",
    patternTag: "volume:circular",
    baseParams: { mode: "circular_gesture", targetVolume: 70, tolerance: 5 },
    variants: [
      { diff: 1, tl: 30000, p: { targetVolume: 30, tolerance: 10 } },
      { diff: 2, tl: 28000, p: { targetVolume: 50, tolerance: 7 } },
      { diff: 3, tl: 25000, p: { targetVolume: 70, tolerance: 5 } },
      { diff: 4, tl: 22000, p: { targetVolume: 85, tolerance: 3 } },
      { diff: 5, tl: 18000, p: { targetVolume: 95, tolerance: 2 } },
    ]
  },
  {
    type: "volume_puzzle_lock",
    slug: "puzzle",
    titleBase: "퍼즐 잠금 볼륨",
    objectiveBase: "퍼즐을 풀어야 볼륨 슬라이더가 잠금 해제됩니다!",
    memeBase: "볼륨 조절하려면 먼저 퍼즐을 풀어야 함",
    explainBase: "기본 기능 사용에 불필요한 장벽을 두는 것은 사용자 경험을 의도적으로 방해합니다. 볼륨 조절같은 기본 기능에 퍼즐을 요구하는 것은 극단적 마찰(friction)입니다.",
    patternTag: "volume:puzzle",
    baseParams: { mode: "puzzle_lock", targetVolume: 50, tolerance: 5 },
    variants: [
      { diff: 1, tl: 35000, p: { targetVolume: 50, tolerance: 10 } },
      { diff: 2, tl: 30000, p: { targetVolume: 40, tolerance: 7 } },
      { diff: 3, tl: 25000, p: { targetVolume: 65, tolerance: 5 } },
      { diff: 4, tl: 22000, p: { targetVolume: 30, tolerance: 3 } },
      { diff: 5, tl: 18000, p: { targetVolume: 80, tolerance: 2 } },
    ]
  },
  {
    type: "volume_physics_launcher",
    slug: "physics",
    titleBase: "볼륨 대포",
    objectiveBase: "새총/대포로 볼륨 게이지를 목표 지점까지 발사하세요!",
    memeBase: "볼륨을 조절하려면 대포를 쏴야 하는 세계",
    explainBase: "게이미피케이션의 극단적 남용입니다. 단순한 슬라이더로 해결할 기능에 물리 시뮬레이션을 적용하면 사용자에게 불필요한 인지 부하를 줍니다.",
    patternTag: "volume:physics",
    baseParams: { mode: "physics_launcher", targetVolume: 60, tolerance: 5 },
    variants: [
      { diff: 1, tl: 30000, p: { targetVolume: 40, tolerance: 15 } },
      { diff: 2, tl: 28000, p: { targetVolume: 55, tolerance: 10 } },
      { diff: 3, tl: 25000, p: { targetVolume: 70, tolerance: 7 } },
      { diff: 4, tl: 22000, p: { targetVolume: 35, tolerance: 5 } },
      { diff: 5, tl: 18000, p: { targetVolume: 85, tolerance: 3 } },
    ]
  },
  {
    type: "volume_voice_shout",
    slug: "voice",
    titleBase: "소리 질러 볼륨",
    objectiveBase: "화면을 빠르게 탭해서 볼륨 게이지를 채우세요! (음성 시뮬레이션)",
    memeBase: "볼륨 올리려면 소리를 질러야 하는 앱",
    explainBase: "음성 입력을 요구하는 볼륨 조절은 공공장소에서 사용 불가능합니다. 상황 인식(context awareness) 없이 설계된 인터페이스의 대표적 사례입니다.",
    patternTag: "volume:voice",
    baseParams: { mode: "voice_shout", targetVolume: 70, tolerance: 5 },
    variants: [
      { diff: 1, tl: 25000, p: { targetVolume: 40, tolerance: 15 } },
      { diff: 2, tl: 22000, p: { targetVolume: 55, tolerance: 10 } },
      { diff: 3, tl: 20000, p: { targetVolume: 70, tolerance: 7 } },
      { diff: 4, tl: 18000, p: { targetVolume: 85, tolerance: 5 } },
      { diff: 5, tl: 15000, p: { targetVolume: 95, tolerance: 3 } },
    ]
  },
];

const webSeeds = [
  {
    type: "endless_wizard_flow",
    slug: "wizard",
    titleBase: "끝없는 단계",
    objectiveBase: "신청/가입 마법사를 끝까지 완료하세요. 끝이 있을까요?",
    memeBase: "지원서 작성하다가 인생이 지나감",
    explainBase: "불필요하게 긴 단계별 프로세스는 사용자의 시간을 낭비합니다. 한 페이지로 가능한 작업을 10단계로 나누는 것은 전환율을 떨어뜨리는 자해 행위입니다.",
    patternTag: "web:wizard",
    baseParams: { mode: "endless_wizard", stepCount: 8, backResets: false, misleadingLabels: false, decoyCtas: 1, forcedScroll: false, requiredFields: ["Name", "Email"] },
    variants: [
      { diff: 1, tl: 45000, p: { stepCount: 5, backResets: false, misleadingLabels: false, decoyCtas: 0, forcedScroll: false, requiredFields: ["Name"] } },
      { diff: 2, tl: 50000, p: { stepCount: 7, backResets: false, misleadingLabels: false, decoyCtas: 1, forcedScroll: false, requiredFields: ["Name", "Email"] } },
      { diff: 3, tl: 60000, p: { stepCount: 9, backResets: true, misleadingLabels: false, decoyCtas: 2, forcedScroll: true, requiredFields: ["Name", "Email", "Phone"] } },
      { diff: 4, tl: 75000, p: { stepCount: 12, backResets: true, misleadingLabels: true, decoyCtas: 3, forcedScroll: true, requiredFields: ["Name", "Email", "Phone", "Address"] } },
    ]
  },
  {
    type: "government_portal_popups",
    slug: "govportal",
    titleBase: "관공서 포털",
    objectiveBase: "경고 팝업, 약관 동의, 보안 경고를 모두 통과하세요!",
    memeBase: "관공서 홈페이지에 로그인하려면 ActiveX 5개 필요",
    explainBase: "과도한 보안 경고와 팝업은 사용자를 피로하게 하고, 진짜 중요한 경고를 무시하게 만듭니다. 보안극장(security theater)은 실제 보안을 약화시킵니다.",
    patternTag: "web:gov-portal",
    baseParams: { mode: "government_portal", stepCount: 6, backResets: false, misleadingLabels: false, decoyCtas: 2, forcedScroll: true, requiredFields: ["Name"] },
    variants: [
      { diff: 2, tl: 45000, p: { stepCount: 4, backResets: false, misleadingLabels: false, decoyCtas: 1, forcedScroll: true, requiredFields: ["Name"] } },
      { diff: 3, tl: 55000, p: { stepCount: 6, backResets: false, misleadingLabels: false, decoyCtas: 2, forcedScroll: true, requiredFields: ["Name", "ID"] } },
      { diff: 4, tl: 65000, p: { stepCount: 8, backResets: true, misleadingLabels: true, decoyCtas: 3, forcedScroll: true, requiredFields: ["Name", "ID", "Phone"] } },
      { diff: 5, tl: 75000, p: { stepCount: 10, backResets: true, misleadingLabels: true, decoyCtas: 4, forcedScroll: true, requiredFields: ["Name", "ID", "Phone", "Address"] } },
    ]
  },
  {
    type: "nav_ambiguity_map",
    slug: "navmaze",
    titleBase: "미로 네비게이션",
    objectiveBase: "메뉴 미로에서 목표 기능을 찾아보세요. 어디에 있을까요?",
    memeBase: "설정 찾으려고 메뉴를 15분째 탐험 중",
    explainBase: "정보 구조(IA)가 엉망인 네비게이션은 사용자를 길 잃게 만듭니다. '팀 채팅'이 '채팅'과 '팀' 어디에 있는지 모르는 것은 IA 실패의 전형입니다.",
    patternTag: "web:nav-maze",
    baseParams: { mode: "nav_maze", targetAction: "Send message", menuDepth: 3, misleadingMenus: 3 },
    variants: [
      { diff: 1, tl: 30000, p: { targetAction: "View profile", menuDepth: 2, misleadingMenus: 1 } },
      { diff: 2, tl: 35000, p: { targetAction: "Send message", menuDepth: 3, misleadingMenus: 2 } },
      { diff: 3, tl: 40000, p: { targetAction: "Change settings", menuDepth: 3, misleadingMenus: 4 } },
      { diff: 4, tl: 45000, p: { targetAction: "Create channel", menuDepth: 4, misleadingMenus: 5 } },
    ]
  },
  {
    type: "enterprise_filter_overload",
    slug: "filteroverload",
    titleBase: "필터 과부하",
    objectiveBase: "12개 필터 중 올바른 것만 설정하고 숨겨진 적용 버튼을 찾으세요!",
    memeBase: "필터가 12개인데 적용 버튼은 스크롤 끝에 숨어있음",
    explainBase: "필터 UI는 사용자가 원하는 것을 빠르게 찾게 도와줘야 합니다. 하지만 필터 자체가 너무 많으면 필터를 필터링해야 하는 아이러니가 발생합니다.",
    patternTag: "web:filter-overload",
    baseParams: { mode: "filter_overload", targetAction: "Apply", menuDepth: 1, misleadingMenus: 0, filterCount: 12, hiddenApplyButton: true },
    variants: [
      { diff: 2, tl: 35000, p: { targetAction: "Apply", menuDepth: 1, misleadingMenus: 0, filterCount: 8, hiddenApplyButton: false } },
      { diff: 3, tl: 40000, p: { targetAction: "Apply", menuDepth: 1, misleadingMenus: 1, filterCount: 12, hiddenApplyButton: true } },
      { diff: 4, tl: 50000, p: { targetAction: "Apply", menuDepth: 1, misleadingMenus: 2, filterCount: 16, hiddenApplyButton: true } },
      { diff: 5, tl: 60000, p: { targetAction: "Apply", menuDepth: 1, misleadingMenus: 3, filterCount: 20, hiddenApplyButton: true } },
    ]
  },
  {
    type: "clutter_find_cta",
    slug: "cluttercta",
    titleBase: "CTA 보물찾기",
    objectiveBase: "정보 폭발 페이지에서 진짜 버튼을 찾아 클릭하세요!",
    memeBase: "지원 버튼이 배너 47개 사이에 숨어있음",
    explainBase: "정보 과부하(information overload)는 사용자의 인지 자원을 고갈시킵니다. 핵심 CTA가 수십 개의 방해 요소에 묻히면 전환율은 바닥을 칩니다.",
    patternTag: "web:clutter",
    baseParams: { mode: "clutter_page", targetLabel: "Apply", clutterItems: 20, scrollHeight: 2, hasSimBadge: true },
    variants: [
      { diff: 1, tl: 25000, p: { targetLabel: "Save", clutterItems: 10, scrollHeight: 1, hasSimBadge: true } },
      { diff: 2, tl: 30000, p: { targetLabel: "Apply", clutterItems: 15, scrollHeight: 2, hasSimBadge: true } },
      { diff: 3, tl: 35000, p: { targetLabel: "Next", clutterItems: 25, scrollHeight: 3, hasSimBadge: true } },
      { diff: 4, tl: 40000, p: { targetLabel: "Submit", clutterItems: 35, scrollHeight: 4, hasSimBadge: true } },
      { diff: 5, tl: 45000, p: { targetLabel: "Confirm", clutterItems: 50, scrollHeight: 5, hasSimBadge: true } },
    ]
  },
  {
    type: "chaotic_layout_scavenger",
    slug: "chaotic",
    titleBase: "카오스 레이아웃",
    objectiveBase: "겹치고 흩어진 요소들 사이에서 목표 버튼을 찾으세요!",
    memeBase: "웹사이트가 포토샵 레이어를 전부 켠 것 같음",
    explainBase: "시각적 계층(visual hierarchy)이 없는 페이지는 사용자에게 인지적 고통을 줍니다. 모든 것이 강조되면 아무것도 강조되지 않는 것과 같습니다.",
    patternTag: "web:chaotic",
    baseParams: { mode: "chaotic_layout", targetLabel: "Buy Now", clutterItems: 30, scrollHeight: 3, hasSimBadge: true },
    variants: [
      { diff: 2, tl: 30000, p: { targetLabel: "Order", clutterItems: 15, scrollHeight: 2, hasSimBadge: true } },
      { diff: 3, tl: 35000, p: { targetLabel: "Buy Now", clutterItems: 25, scrollHeight: 3, hasSimBadge: true } },
      { diff: 4, tl: 40000, p: { targetLabel: "Checkout", clutterItems: 40, scrollHeight: 4, hasSimBadge: true } },
      { diff: 5, tl: 50000, p: { targetLabel: "Pay", clutterItems: 60, scrollHeight: 5, hasSimBadge: true } },
    ]
  },
  {
    type: "endless_wizard_flow",
    slug: "onboard",
    titleBase: "온보딩 지옥",
    objectiveBase: "끝나지 않는 온보딩 단계를 모두 완료하세요!",
    memeBase: "회원가입 3단계라더니 15단계째",
    explainBase: "첫 사용 경험(FTUE)에서 과도한 온보딩은 사용자 이탈의 주범입니다. 사용자는 앱을 빨리 쓰고 싶은데, 끝없는 튜토리얼이 그것을 막습니다.",
    patternTag: "web:onboarding-hell",
    baseParams: { mode: "endless_wizard", stepCount: 10, backResets: true, misleadingLabels: false, decoyCtas: 2, forcedScroll: true, requiredFields: ["Nickname"] },
    variants: [
      { diff: 2, tl: 50000, p: { stepCount: 6, backResets: false, misleadingLabels: false, decoyCtas: 1, forcedScroll: false, requiredFields: ["Name"] } },
      { diff: 3, tl: 60000, p: { stepCount: 8, backResets: true, misleadingLabels: false, decoyCtas: 2, forcedScroll: true, requiredFields: ["Name", "Bio"] } },
      { diff: 4, tl: 70000, p: { stepCount: 12, backResets: true, misleadingLabels: true, decoyCtas: 3, forcedScroll: true, requiredFields: ["Name", "Bio", "Interests"] } },
    ]
  },
  {
    type: "nav_ambiguity_map",
    slug: "teamchat",
    titleBase: "팀 vs 채팅 미궁",
    objectiveBase: "팀 채팅에서 메시지를 보내는 곳을 찾으세요!",
    memeBase: "채팅이 '팀'에 있는지 '채널'에 있는지 '대화'에 있는지 모름",
    explainBase: "비슷한 개념을 다른 이름으로 분산시키면 사용자는 영원히 헤맵니다. 일관된 정보 구조와 명확한 레이블링이 네비게이션의 핵심입니다.",
    patternTag: "web:team-vs-chat",
    baseParams: { mode: "nav_maze", targetAction: "Write message", menuDepth: 3, misleadingMenus: 4 },
    variants: [
      { diff: 2, tl: 35000, p: { targetAction: "Write message", menuDepth: 2, misleadingMenus: 2 } },
      { diff: 3, tl: 40000, p: { targetAction: "Send file", menuDepth: 3, misleadingMenus: 3 } },
      { diff: 4, tl: 45000, p: { targetAction: "Start call", menuDepth: 4, misleadingMenus: 5 } },
      { diff: 5, tl: 50000, p: { targetAction: "Schedule meeting", menuDepth: 5, misleadingMenus: 6 } },
    ]
  },
  {
    type: "clutter_find_cta",
    slug: "dashclutter",
    titleBase: "대시보드 과부하",
    objectiveBase: "위젯과 알림 사이에서 핵심 액션을 찾으세요!",
    memeBase: "대시보드에 위젯이 30개인데 원하는 건 하나도 없음",
    explainBase: "대시보드에 모든 정보를 쑤셔 넣으면 정작 중요한 액션을 찾기 어렵습니다. 정보의 우선순위 없이 나열하는 것은 디자인이 아니라 포기입니다.",
    patternTag: "web:dashboard-clutter",
    baseParams: { mode: "clutter_page", targetLabel: "Create Report", clutterItems: 25, scrollHeight: 3, hasSimBadge: true },
    variants: [
      { diff: 2, tl: 30000, p: { targetLabel: "New Task", clutterItems: 15, scrollHeight: 2, hasSimBadge: true } },
      { diff: 3, tl: 35000, p: { targetLabel: "Create Report", clutterItems: 25, scrollHeight: 3, hasSimBadge: true } },
      { diff: 4, tl: 45000, p: { targetLabel: "Export Data", clutterItems: 40, scrollHeight: 4, hasSimBadge: true } },
      { diff: 5, tl: 50000, p: { targetLabel: "Admin Panel", clutterItems: 55, scrollHeight: 5, hasSimBadge: true } },
    ]
  },
  {
    type: "chaotic_layout_scavenger",
    slug: "retroweb",
    titleBase: "레트로 웹사이트",
    objectiveBase: "90년대풍 카오스 레이아웃에서 주문 버튼을 찾으세요!",
    memeBase: "이 웹사이트는 1998년부터 리뉴얼 안 했음",
    explainBase: "레트로 감성이 아니라 정보 설계 실패입니다. 겹치는 요소, 일관성 없는 폰트, 무작위 배치는 사용자 경험의 적입니다.",
    patternTag: "web:retro-chaos",
    baseParams: { mode: "chaotic_layout", targetLabel: "Order Now", clutterItems: 35, scrollHeight: 4, hasSimBadge: true },
    variants: [
      { diff: 2, tl: 35000, p: { targetLabel: "Shop", clutterItems: 20, scrollHeight: 2, hasSimBadge: true } },
      { diff: 3, tl: 40000, p: { targetLabel: "Order Now", clutterItems: 30, scrollHeight: 3, hasSimBadge: true } },
      { diff: 4, tl: 50000, p: { targetLabel: "Contact Us", clutterItems: 45, scrollHeight: 4, hasSimBadge: true } },
      { diff: 5, tl: 60000, p: { targetLabel: "Download", clutterItems: 60, scrollHeight: 5, hasSimBadge: true } },
    ]
  },
];

function generateLevels(seeds, packTag) {
  const levels = [];
  seeds.forEach((seed, seedIdx) => {
    seed.variants.forEach((variant, varIdx) => {
      const id = `v3_${packTag}_${String(seedIdx).padStart(2, "0")}_${varIdx}_${seed.slug}`;
      const diffLabel = ["", "Lv.1", "Lv.2", "Lv.3", "Lv.4", "Lv.5"][variant.diff];
      levels.push({
        id,
        type: seed.type,
        title: `${seed.titleBase} ${diffLabel}`,
        objective: seed.objectiveBase,
        memeCaption: seed.memeBase,
        explainWhyBad: seed.explainBase,
        difficulty: variant.diff,
        timeLimitMs: variant.tl,
        allowHint: true,
        allowSkip: true,
        hintText: seed.objectiveBase.slice(0, 30) + "...",
        packTag,
        sourceTag: "community",
        patternTag: seed.patternTag,
        safety: "simulation_only",
        params: { ...seed.baseParams, ...variant.p },
      });
    });
  });
  return levels;
}

const volumeLevels = generateLevels(volumeSeeds, "volume-hell");
const webLevels = generateLevels(webSeeds, "web-hell");
const allLevels = [...volumeLevels, ...webLevels];

console.log(`Generated: volume=${volumeLevels.length}, web=${webLevels.length}, total=${allLevels.length}`);

const fs = require("fs");
const path = require("path");
const outDir = path.join(__dirname, "..", "apps", "src", "stages");
fs.writeFileSync(path.join(outDir, "stages.v3.json"), JSON.stringify(allLevels, null, 2));
console.log("Written to apps/src/stages/stages.v3.json");

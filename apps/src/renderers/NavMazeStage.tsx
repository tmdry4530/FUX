import { useState, useCallback, useMemo, useRef } from "react";

export interface NavMazeParams {
  mode: "nav_maze" | "filter_overload";
  targetAction: string;
  menuDepth: number;
  misleadingMenus: number;
  filterCount?: number;
  hiddenApplyButton?: boolean;
  wrongCloseAddsLayer?: boolean;
  shuffleOnMiss?: boolean;
}

interface NavMazeStageProps {
  params: NavMazeParams;
  onComplete: () => void;
  onFail: () => void;
}

interface MenuItem {
  label: string;
  isTarget: boolean;
  isDeadEnd?: boolean;
  loopBackDepth?: number; // 루프 트랩: currentPath를 이 길이로 되돌림
  children?: MenuItem[];
}

// targetAction 키워드 기반 의미적으로 유사한 레이블 생성
function getSimilarLabels(targetAction: string, count: number): string[] {
  const pools: Record<string, string[]> = {
    개인정보: ["보안 설정", "계정 관리", "개인정보 보호", "프로필 설정", "접근 권한", "데이터 관리"],
    설정: ["환경 설정", "기본 설정", "앱 설정", "시스템 설정", "고급 설정", "일반"],
    계정: ["프로필", "사용자 정보", "내 정보", "계정 관리", "인증 설정", "보안"],
    결제: ["구독 관리", "요금제", "청구 정보", "결제 수단", "영수증", "플랜"],
    알림: ["푸시 알림", "메시지 설정", "공지 관리", "수신 설정", "알림 센터", "이메일 설정"],
    취소: ["구독 취소", "탈퇴 신청", "서비스 종료", "계정 삭제", "해지 신청", "해약"],
  };

  let matched: string[] = [];
  for (const [key, labels] of Object.entries(pools)) {
    if (targetAction.includes(key)) {
      matched = labels;
      break;
    }
  }

  if (matched.length === 0) {
    matched = ["설정", "관리", "내 계정", "서비스", "정보", "도움말", "지원", "기타", "더보기", "옵션"];
  }

  return Array.from({ length: count }, (_, i) => matched[i % matched.length] ?? "메뉴");
}

export default function NavMazeStage({
  params,
  onComplete,
  onFail,
}: NavMazeStageProps) {
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [hasScrolledToApply, setHasScrolledToApply] = useState(
    !params.hiddenApplyButton
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [misleadingMenusCount, setMisleadingMenusCount] = useState(params.misleadingMenus);
  const [reshuffleKey, setReshuffleKey] = useState(0);

  const handleScroll = useCallback(() => {
    if (!params.hiddenApplyButton) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrolledToBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    if (scrolledToBottom) {
      setHasScrolledToApply(true);
    }
  }, [params.hiddenApplyButton]);

  const menuTree = useMemo(() => {
    const buildTree = (depth: number, isCorrectPath: boolean): MenuItem[] => {
      if (depth === 0) {
        return [
          {
            label: params.targetAction,
            isTarget: true,
          },
        ];
      }

      const items: MenuItem[] = [];
      const correctIndex = Math.floor(Math.random() * (misleadingMenusCount + 1));
      const misleadingLabels = getSimilarLabels(params.targetAction, misleadingMenusCount + 1);

      for (let i = 0; i <= misleadingMenusCount; i++) {
        const isCorrect = isCorrectPath && i === correctIndex;
        const label = misleadingLabels[i % misleadingLabels.length] ?? "메뉴";

        // 루프 트랩: 잘못된 경로 일부에서 이전 깊이로 되돌림 (depth > 1 에서 35% 확률)
        const isLoopTrap = !isCorrect && depth > 1 && Math.random() < 0.35;
        const loopBackDepth = isLoopTrap
          ? Math.max(0, depth - Math.floor(Math.random() * 2) - 2)
          : undefined;

        items.push({
          label,
          isTarget: false,
          // 루프 트랩이 아닌 모든 잘못된 경로 = isDeadEnd (깊이 무관하게 onFail 트리거)
          isDeadEnd: !isCorrect && !isLoopTrap,
          loopBackDepth,
          children: buildTree(depth - 1, isCorrect),
        });
      }

      return items;
    };

    return buildTree(params.menuDepth, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.menuDepth, misleadingMenusCount, params.targetAction, reshuffleKey]);

  const getCurrentMenu = useCallback((): MenuItem[] => {
    let current = menuTree;
    for (const index of currentPath) {
      const item = current[index];
      if (item?.children) {
        current = item.children;
      }
    }
    return current;
  }, [menuTree, currentPath]);

  const handleMenuClick = useCallback(
    (index: number) => {
      const currentMenu = getCurrentMenu();
      const item = currentMenu[index];
      if (!item) return;

      if (item.isTarget) {
        onComplete();
        return;
      }

      // 루프 트랩: currentPath를 이전 깊이로 되돌림 (실패 없이 방향 상실)
      if (item.loopBackDepth !== undefined) {
        setCurrentPath((prev) => prev.slice(0, item.loopBackDepth));
        return;
      }

      // 모든 잘못된 경로에서 onFail (깊이 무관)
      if (item.isDeadEnd) {
        if (params.wrongCloseAddsLayer) {
          setMisleadingMenusCount((prev) => Math.min(prev + 1, params.misleadingMenus + 4));
        }
        if (params.shuffleOnMiss) {
          setReshuffleKey((prev) => prev + 1);
        }
        onFail();
        setCurrentPath([]);
        return;
      }

      setCurrentPath([...currentPath, index]);
    },
    [getCurrentMenu, currentPath, params.wrongCloseAddsLayer, params.shuffleOnMiss, onComplete, onFail]
  );

  const handleBack = useCallback(() => {
    setCurrentPath(currentPath.slice(0, -1));
  }, [currentPath]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    // 함정: filter_0, filter_3, filter_6 변경 시 인접 필터 리셋
    setFilterValues((prev) => {
      const updated: Record<string, string> = { ...prev, [key]: value };
      const resetTriggers = ["filter_0", "filter_3", "filter_6"];
      if (resetTriggers.includes(key) && value !== "전체") {
        const keyNum = parseInt(key.replace("filter_", ""), 10);
        updated[`filter_${keyNum + 1}`] = "전체";
      }
      return updated;
    });
  }, []);

  const handleApply = useCallback(() => {
    if (!hasScrolledToApply) return;
    onComplete();
  }, [hasScrolledToApply, onComplete]);

  // 초기화 버튼: 적용처럼 보이지만 모든 필터 리셋 후 onFail
  const handleReset = useCallback(() => {
    setFilterValues({});
    onFail();
  }, [onFail]);

  if (params.mode === "filter_overload") {
    const filterCount = params.filterCount || 12;
    const filters = Array.from({ length: filterCount }, (_, i) => ({
      key: `filter_${i}`,
      label: [
        "카테고리",
        "브랜드",
        "가격대",
        "색상",
        "크기",
        "배송",
        "리뷰평점",
        "할인율",
        "지역",
        "날짜",
        "상태",
        "옵션",
      ][i % 12],
      options: ["전체", "옵션1", "옵션2", "옵션3"],
    }));

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F9FAFB",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E5E8EB",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#191F28" }}>
            필터 설정
          </div>
          <div style={{ fontSize: "13px", color: "#8B95A1", marginTop: "4px" }}>
            모든 필터를 확인하고, 맨 아래 숨겨진 "적용" 버튼을 찾아 누르세요.
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {filters.map((filter) => (
              <div key={filter.key}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#4E5968",
                    marginBottom: "6px",
                  }}
                >
                  {filter.label}
                </label>
                <select
                  value={filterValues[filter.key] || "전체"}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "14px",
                    border: "1px solid #E5E8EB",
                    borderRadius: "4px",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {filter.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {params.hiddenApplyButton && (
            <div style={{ height: "400px", marginTop: "20px" }} />
          )}

          {/* 초기화(함정) + 적용(진짜) 버튼 - 초기화가 더 크고 파란색 */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: params.hiddenApplyButton ? "6px 12px" : "12px 24px",
                fontSize: params.hiddenApplyButton ? "10px" : "14px",
                fontWeight: "500",
                color: "#FFFFFF",
                backgroundColor: "#3182F6",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!hasScrolledToApply}
              style={{
                padding: params.hiddenApplyButton ? "6px 12px" : "10px 16px",
                fontSize: params.hiddenApplyButton ? "9px" : "12px",
                fontWeight: "400",
                color: hasScrolledToApply ? "#4E5968" : "#8B95A1",
                backgroundColor: hasScrolledToApply ? "#E5E8EB" : "#F9FAFB",
                border: "1px solid #E5E8EB",
                borderRadius: "4px",
                cursor: hasScrolledToApply ? "pointer" : "not-allowed",
              }}
            >
              적용
            </button>
          </div>
        </div>
      </div>
    );
  }

  // nav_maze mode
  const currentMenu = getCurrentMenu();
  const breadcrumb = currentPath
    .map((_itemIndex, pathIndex) => {
      let current = menuTree;
      for (let i = 0; i <= pathIndex; i++) {
        const idx = currentPath[i];
        if (idx !== undefined) {
          const item = current[idx];
          if (i === pathIndex) {
            return item?.label || "";
          }
          if (item?.children) {
            current = item.children;
          }
        }
      }
      return "";
    })
    .filter(Boolean);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F9FAFB",
        overflow: "hidden",
      }}
    >
      {/* 목표 카드 */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E8EB",
        }}
      >
        <div style={{ fontSize: "11px", color: "#8B95A1", marginBottom: "2px" }}>
          찾아야 할 기능
        </div>
        <div style={{ fontSize: "17px", fontWeight: "700", color: "#191F28" }}>
          {params.targetAction}
        </div>
        <div
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#8B95A1",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            flexWrap: "wrap",
            minHeight: "18px",
            visibility: breadcrumb.length > 0 ? "visible" : "hidden",
          }}
        >
          <span style={{ color: "#3182F6" }}>홈</span>
          {breadcrumb.map((crumb, i) => (
            <span key={i}>
              <span style={{ margin: "0 2px" }}>&gt;</span>
              <span style={i === breadcrumb.length - 1 ? { color: "#191F28", fontWeight: "600" } : undefined}>{crumb}</span>
            </span>
          ))}
          {breadcrumb.length === 0 && <span>&nbsp;</span>}
        </div>
      </div>

      {/* 상태 안내 */}
      <div
        style={{
          padding: "10px 16px",
          backgroundColor: currentPath.length === 0 ? "#E8F3FF" : "#F2F4F6",
          fontSize: "13px",
          color: currentPath.length === 0 ? "#3182F6" : "#4E5968",
          lineHeight: "1.5",
        }}
      >
        {currentPath.length === 0 ? (
          <>아래 메뉴를 탭해 하위 메뉴로 이동하세요. 잘못된 메뉴를 누르면 실패!</>
        ) : (
          <>
            현재 <b>{currentPath.length}단계</b> 깊이
            {currentMenu.some((item) => item.isTarget)
              ? " — 목표가 이 메뉴에 있습니다!"
              : " — 계속 탐색하세요."}
          </>
        )}
      </div>

      {/* 뒤로가기 — 항상 공간 확보하여 레이아웃 시프트 방지 */}
      <div style={{ padding: "8px 16px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E8EB", minHeight: 60 }}>
        {currentPath.length > 0 && (
          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: "8px 16px",
              minHeight: 44,
              fontSize: "14px",
              fontWeight: "500",
              color: "#4E5968",
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E8EB",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ← 뒤로
          </button>
        )}
      </div>

      {/* 메뉴 목록 — 전체 폭 리스트 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
        {currentMenu.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleMenuClick(idx)}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 16px",
              marginBottom: "6px",
              fontSize: "15px",
              fontWeight: "500",
              color: "#191F28",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E8EB",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              boxSizing: "border-box",
            }}
          >
            {item.label}
            {item.children && item.children.length > 0 && (
              <span style={{ float: "right", color: "#8B95A1" }}>{">"}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

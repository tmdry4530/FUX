import { useState, useCallback, useMemo, useRef, useEffect } from "react";

export interface NavMazeParams {
  mode: "nav_maze" | "filter_overload";
  targetAction: string;
  menuDepth: number;
  misleadingMenus: number;
  filterCount?: number;
  hiddenApplyButton?: boolean;
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
  children?: MenuItem[];
}

export default function NavMazeStage({
  params,
  onComplete,
  onFail,
}: NavMazeStageProps) {
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [wrongPathCount, setWrongPathCount] = useState(0);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [hasScrolledToApply, setHasScrolledToApply] = useState(
    !params.hiddenApplyButton
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      const correctIndex = Math.floor(Math.random() * (params.misleadingMenus + 1));

      for (let i = 0; i <= params.misleadingMenus; i++) {
        const isCorrect = isCorrectPath && i === correctIndex;
        const misleadingLabels = [
          "팀",
          "그룹",
          "채널",
          "채팅",
          "메시지",
          "대화",
          "워크스페이스",
          "프로젝트",
          "설정",
          "관리",
        ];
        const label = misleadingLabels[i % misleadingLabels.length] ?? "메뉴";

        items.push({
          label,
          isTarget: false,
          isDeadEnd: !isCorrect && depth === 1,
          children: buildTree(depth - 1, isCorrect),
        });
      }

      return items;
    };

    return buildTree(params.menuDepth, true);
  }, [params.menuDepth, params.misleadingMenus, params.targetAction]);

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

      if (item.isDeadEnd) {
        const newCount = wrongPathCount + 1;
        setWrongPathCount(newCount);
        if (newCount >= 3) {
          onFail();
        } else {
          setCurrentPath([]);
        }
        return;
      }

      setCurrentPath([...currentPath, index]);
    },
    [getCurrentMenu, currentPath, wrongPathCount, onComplete, onFail]
  );

  const handleBack = useCallback(() => {
    setCurrentPath(currentPath.slice(0, -1));
  }, [currentPath]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApply = useCallback(() => {
    if (!hasScrolledToApply) return;
    onComplete();
  }, [hasScrolledToApply, onComplete]);

  useEffect(() => {
    if (wrongPathCount >= 3) {
      onFail();
    }
  }, [wrongPathCount, onFail]);

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
            fontSize: "18px",
            fontWeight: "600",
            color: "#191F28",
          }}
        >
          필터 설정
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
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
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

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              type="button"
              onClick={handleApply}
              disabled={!hasScrolledToApply}
              style={{
                padding: params.hiddenApplyButton ? "6px 12px" : "12px 24px",
                fontSize: params.hiddenApplyButton ? "10px" : "14px",
                fontWeight: "500",
                color: "#FFFFFF",
                backgroundColor: hasScrolledToApply ? "#3182F6" : "#E5E8EB",
                border: "none",
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
        backgroundColor: "#F9FAFB",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E5E8EB",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#191F28",
            borderBottom: "1px solid #E5E8EB",
          }}
        >
          Navigation
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {currentMenu.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleMenuClick(idx)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "4px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#191F28",
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E8EB",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {item.label}
              {item.children && item.children.length > 0 && " →"}
            </button>
          ))}
        </div>

        {currentPath.length > 0 && (
          <div style={{ padding: "16px", borderTop: "1px solid #E5E8EB" }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4E5968",
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E8EB",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ← 뒤로
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {breadcrumb.length > 0 && (
          <div
            style={{
              fontSize: "14px",
              color: "#8B95A1",
              marginBottom: "16px",
            }}
          >
            {breadcrumb.join(" > ")}
          </div>
        )}

        <div
          style={{
            fontSize: "16px",
            color: "#191F28",
            fontWeight: "500",
          }}
        >
          목표: {params.targetAction}
        </div>
        <div style={{ fontSize: "14px", color: "#8B95A1", marginTop: "8px" }}>
          왼쪽 메뉴에서 올바른 경로를 찾아 이동하세요.
        </div>
        <div style={{ fontSize: "14px", color: "#E53935", marginTop: "8px" }}>
          잘못된 경로 {wrongPathCount} / 3
        </div>
      </div>
    </div>
  );
}

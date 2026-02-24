import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { StageListScreen } from "./screens/StageListScreen";
import { StagePlayScreen } from "./screens/StagePlayScreen";
import { ResultScreen } from "./screens/ResultScreen";

/**
 * 딥링크 query param fallback
 * ?stageId=xxx → /stage/xxx 로 리다이렉트
 * 잘못된 stageId는 Home으로 이동 + console 경고
 */
function QueryParamRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stageId = searchParams.get("stageId");

  useEffect(() => {
    if (stageId) {
      console.log(`[FUX:Deeplink] query param redirect: stageId=${stageId}`);
      navigate(`/stage/${stageId}`, { replace: true });
    }
  }, [stageId, navigate]);

  return <StageListScreen />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<QueryParamRedirect />} />
      <Route path="/stage/:stageId" element={<StagePlayScreen />} />
      <Route path="/result/:stageId" element={<ResultScreen />} />
      {/* Catch-all: 알 수 없는 경로는 Home으로 안전 이동 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

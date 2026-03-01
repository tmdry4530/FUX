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
import { DailyChallengeScreen } from "./screens/DailyChallengeScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { CollectionScreen } from "./screens/CollectionScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { useGameState } from "./game-state/useGameState";

/**
 * 딥링크 query param fallback
 * ?stageId=xxx → /stage/xxx 로 리다이렉트
 * 온보딩 미완료 시 /onboarding 으로 리다이렉트 (딥링크 제외)
 */
function QueryParamRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, initialized } = useGameState();
  const stageId = searchParams.get("stageId");

  useEffect(() => {
    if (!initialized) return;
    if (stageId) {
      console.log(`[Ilbureo:Deeplink] query param redirect: stageId=${stageId}`);
      navigate(`/stage/${stageId}`, { replace: true });
      return;
    }
    if (!state.hasSeenOnboarding) {
      navigate('/onboarding', { replace: true });
    }
  }, [stageId, navigate, initialized, state.hasSeenOnboarding]);

  if (!initialized) return null;
  return <StageListScreen />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<QueryParamRedirect />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/stage/:stageId" element={<StagePlayScreen />} />
      <Route path="/result/:stageId" element={<ResultScreen />} />
      <Route path="/challenge" element={<DailyChallengeScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/collection" element={<CollectionScreen />} />
      {/* Catch-all: 알 수 없는 경로는 Home으로 안전 이동 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

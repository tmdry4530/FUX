import { Routes, Route } from "react-router-dom";
import { StageListScreen } from "./screens/StageListScreen";
import { StagePlayScreen } from "./screens/StagePlayScreen";
import { ResultScreen } from "./screens/ResultScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StageListScreen />} />
      <Route path="/stage/:stageId" element={<StagePlayScreen />} />
      <Route path="/result/:stageId" element={<ResultScreen />} />
    </Routes>
  );
}

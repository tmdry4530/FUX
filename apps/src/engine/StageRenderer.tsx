import type { StageSpec } from "../stages/stage-spec";
import type { StagePhase } from "./types";

interface StageRendererProps {
  spec: StageSpec;
  phase: StagePhase;
  remainingMs: number;
  onSuccess: () => void;
  onMiss: () => void;
}

type StageComponent = React.ComponentType<StageRendererProps>;

const registry = new Map<string, StageComponent>();

export function registerStageRenderer(type: string, component: StageComponent) {
  registry.set(type, component);
}

export function StageRenderer(props: StageRendererProps) {
  const Component = registry.get(props.spec.type);

  if (!Component) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#999" }}>
        알 수 없는 스테이지 타입: <code>{props.spec.type}</code>
      </div>
    );
  }

  return <Component {...props} />;
}

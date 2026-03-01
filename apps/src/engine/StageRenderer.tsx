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
    if (typeof window !== 'undefined') {
      console.error(`[UXTrap] Stage type not registered: "${props.spec.type}" (id: ${props.spec.id})`);
      window.dispatchEvent(new CustomEvent('stage_missing', {
        detail: { type: props.spec.type, id: props.spec.id }
      }));
    }
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ fontSize: 16, color: "#191F28", fontWeight: 600, marginBottom: 8 }}>
          스테이지를 로드할 수 없습니다
        </p>
        <p style={{ fontSize: 13, color: "#8B95A1", marginBottom: 4 }}>
          타입: <code>{props.spec.type}</code>
        </p>
        <p style={{ fontSize: 13, color: "#8B95A1", marginBottom: 16 }}>
          ID: <code>{props.spec.id}</code>
        </p>
        <p style={{ fontSize: 13, color: "#4E5968", marginBottom: 20 }}>
          이 스테이지 타입은 아직 지원되지 않습니다.
        </p>
      </div>
    );
  }

  return <Component {...props} />;
}

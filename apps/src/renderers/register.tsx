import { registerStageRenderer } from "../engine/StageRenderer";
import TinyButtonStage from "./TinyButtonStage";
import type { TinyButtonParams } from "./TinyButtonStage";
import MovingTargetStage from "./MovingTargetStage";
import type { MovingTargetParams } from "./MovingTargetStage";
import ModalStackStage from "./ModalStackStage";
import type { ModalStackParams } from "./ModalStackStage";

registerStageRenderer("tiny_button", ({ spec, onSuccess, onMiss }) => (
  <TinyButtonStage params={spec.params as TinyButtonParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("moving_target", ({ spec, onSuccess, onMiss }) => (
  <MovingTargetStage params={spec.params as MovingTargetParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("modal_stack", ({ spec, onSuccess, onMiss }) => (
  <ModalStackStage params={spec.params as ModalStackParams} onComplete={onSuccess} onFail={onMiss} />
));

import { registerStageRenderer } from "../engine/StageRenderer";
import TinyButtonStage from "./TinyButtonStage";
import type { TinyButtonParams } from "./TinyButtonStage";
import MovingTargetStage from "./MovingTargetStage";
import type { MovingTargetParams } from "./MovingTargetStage";
import ModalStackStage from "./ModalStackStage";
import type { ModalStackParams } from "./ModalStackStage";
import RoachMotelFlowStage from "./RoachMotelFlowStage";
import type { RoachMotelFlowParams } from "./RoachMotelFlowStage";
import ConsentToggleLabourStage from "./ConsentToggleLabourStage";
import type { ConsentToggleLabourParams } from "./ConsentToggleLabourStage";
import HiddenRejectLinkStage from "./HiddenRejectLinkStage";
import type { HiddenRejectLinkParams } from "./HiddenRejectLinkStage";
import DisguisedCtaGridStage from "./DisguisedCtaGridStage";
import type { DisguisedCtaGridParams } from "./DisguisedCtaGridStage";
import PickerNoSearchStage from "./PickerNoSearchStage";
import type { PickerNoSearchParams } from "./PickerNoSearchStage";
import StateFeedbackBrokenStage from "./StateFeedbackBrokenStage";
import type { StateFeedbackBrokenParams } from "./StateFeedbackBrokenStage";
import LabelAmbiguityStage from "./LabelAmbiguityStage";
import type { LabelAmbiguityParams } from "./LabelAmbiguityStage";

// --- Legacy (v1) ---
registerStageRenderer("tiny_button", ({ spec, onSuccess, onMiss }) => (
  <TinyButtonStage params={spec.params as unknown as TinyButtonParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("moving_target", ({ spec, onSuccess, onMiss }) => (
  <MovingTargetStage params={spec.params as unknown as MovingTargetParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("modal_stack", ({ spec, onSuccess, onMiss }) => (
  <ModalStackStage params={spec.params as unknown as ModalStackParams} onComplete={onSuccess} onFail={onMiss} />
));

// --- v2 ---
registerStageRenderer("roach_motel_flow", ({ spec, onSuccess, onMiss }) => (
  <RoachMotelFlowStage params={spec.params as unknown as RoachMotelFlowParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("consent_toggle_labour", ({ spec, onSuccess, onMiss }) => (
  <ConsentToggleLabourStage params={spec.params as unknown as ConsentToggleLabourParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("hidden_reject_link", ({ spec, onSuccess, onMiss }) => (
  <HiddenRejectLinkStage params={spec.params as unknown as HiddenRejectLinkParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("disguised_cta_grid", ({ spec, onSuccess, onMiss }) => (
  <DisguisedCtaGridStage params={spec.params as unknown as DisguisedCtaGridParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("picker_no_search", ({ spec, onSuccess, onMiss }) => (
  <PickerNoSearchStage params={spec.params as unknown as PickerNoSearchParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("state_feedback_broken", ({ spec, onSuccess, onMiss }) => (
  <StateFeedbackBrokenStage params={spec.params as unknown as StateFeedbackBrokenParams} onComplete={onSuccess} onFail={onMiss} />
));

registerStageRenderer("label_ambiguity", ({ spec, onSuccess, onMiss }) => (
  <LabelAmbiguityStage params={spec.params as unknown as LabelAmbiguityParams} onComplete={onSuccess} onFail={onMiss} />
));

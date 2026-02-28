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
import LabelAmbiguityStage from "./LabelAmbiguityStage";
import type { LabelAmbiguityParams } from "./LabelAmbiguityStage";
import VolumeControlStage from "./VolumeControlStage";
import type { VolumeControlParams } from "./VolumeControlStage";
import WizardFlowStage from "./WizardFlowStage";
import type { WizardFlowParams } from "./WizardFlowStage";
import ClutterFinderStage from "./ClutterFinderStage";
import type { ClutterFinderParams } from "./ClutterFinderStage";
import NavMazeStage from "./NavMazeStage";
import type { NavMazeParams } from "./NavMazeStage";

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

registerStageRenderer("label_ambiguity", ({ spec, onSuccess, onMiss }) => (
  <LabelAmbiguityStage params={spec.params as unknown as LabelAmbiguityParams} onComplete={onSuccess} onFail={onMiss} />
));

// --- v3: Volume Hell (10 types → 1 renderer) ---
registerStageRenderer("volume_hover_slider", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_hyper_sensitive", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_tiny_hitbox", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_hidden_icon", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_reverse_mapping", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_random_jump", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_circular_gesture", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_puzzle_lock", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_physics_launcher", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("volume_voice_shout", ({ spec, onSuccess, onMiss }) => (
  <VolumeControlStage params={spec.params as unknown as VolumeControlParams} onComplete={onSuccess} onFail={onMiss} />
));

// --- v3: Web Hell (6 types → 3 renderers) ---
registerStageRenderer("endless_wizard_flow", ({ spec, onSuccess, onMiss }) => (
  <WizardFlowStage params={spec.params as unknown as WizardFlowParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("government_portal_popups", ({ spec, onSuccess, onMiss }) => (
  <WizardFlowStage params={spec.params as unknown as WizardFlowParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("clutter_find_cta", ({ spec, onSuccess, onMiss }) => (
  <ClutterFinderStage params={spec.params as unknown as ClutterFinderParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("chaotic_layout_scavenger", ({ spec, onSuccess, onMiss }) => (
  <ClutterFinderStage params={spec.params as unknown as ClutterFinderParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("nav_ambiguity_map", ({ spec, onSuccess, onMiss }) => (
  <NavMazeStage params={spec.params as unknown as NavMazeParams} onComplete={onSuccess} onFail={onMiss} />
));
registerStageRenderer("enterprise_filter_overload", ({ spec, onSuccess, onMiss }) => (
  <NavMazeStage params={spec.params as unknown as NavMazeParams} onComplete={onSuccess} onFail={onMiss} />
));

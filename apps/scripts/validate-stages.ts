#!/usr/bin/env tsx
/**
 * validate-stages.ts
 * 모든 stages JSON 파일을 검증하는 스크립트
 * 실행: tsx scripts/validate-stages.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// 허용 stageType 목록 (하드코딩)
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set<string>([
  'tiny_button',
  'moving_target',
  'modal_stack',
  'roach_motel_flow',
  'consent_toggle_labour',
  'hidden_reject_link',
  'disguised_cta_grid',
  'picker_no_search',
  'label_ambiguity',
  'volume_hover_slider',
  'volume_hyper_sensitive',
  'volume_tiny_hitbox',
  'volume_hidden_icon',
  'volume_reverse_mapping',
  'volume_random_jump',
  'volume_circular_gesture',
  'volume_puzzle_lock',
  'volume_physics_launcher',
  'volume_voice_shout',
  'endless_wizard_flow',
  'government_portal_popups',
  'clutter_find_cta',
  'chaotic_layout_scavenger',
  'nav_ambiguity_map',
  'enterprise_filter_overload',
]);

const REQUIRED_FIELDS = [
  'id',
  'type',
  'title',
  'objective',
  'memeCaption',
  'explainWhyBad',
  'difficulty',
  'timeLimitMs',
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StageRecord {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  objective?: unknown;
  memeCaption?: unknown;
  explainWhyBad?: unknown;
  difficulty?: unknown;
  timeLimitMs?: unknown;
  [key: string]: unknown;
}

interface ValidationError {
  file: string;
  stageId: string | undefined;
  index: number;
  message: string;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateStage(
  stage: StageRecord,
  index: number,
  fileName: string,
  errors: ValidationError[],
): void {
  const stageId = typeof stage.id === 'string' ? stage.id : undefined;
  const context = { file: fileName, stageId, index };

  // 필수 필드 존재 확인
  for (const field of REQUIRED_FIELDS) {
    if (stage[field] === undefined || stage[field] === null) {
      errors.push({ ...context, message: `Missing required field: "${field}"` });
    }
  }

  // type 검증
  if (typeof stage.type === 'string') {
    if (!ALLOWED_TYPES.has(stage.type)) {
      errors.push({ ...context, message: `Unknown type: "${stage.type}"` });
    }
  } else if (stage.type !== undefined) {
    errors.push({ ...context, message: `Field "type" must be a string, got: ${typeof stage.type}` });
  }

  // difficulty 범위 1-5 검증
  if (stage.difficulty !== undefined) {
    const d = stage.difficulty;
    if (typeof d !== 'number' || !Number.isInteger(d) || d < 1 || d > 5) {
      errors.push({ ...context, message: `"difficulty" must be an integer 1-5, got: ${JSON.stringify(d)}` });
    }
  }

  // timeLimitMs > 0 검증
  if (stage.timeLimitMs !== undefined) {
    const t = stage.timeLimitMs;
    if (typeof t !== 'number' || t <= 0) {
      errors.push({ ...context, message: `"timeLimitMs" must be a positive number, got: ${JSON.stringify(t)}` });
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const projectRoot = path.resolve(__dirname, '..');
  const stagesDir = path.join(projectRoot, 'src/stages');

  const FILES = [
    'stages.v3.json',
    'stages.v2.json',
    'stages.mvp.json',
    'stages.uxhell.json',
  ];

  const errors: ValidationError[] = [];
  const allIds = new Map<string, string>(); // id -> first file that contains it
  let totalCount = 0;

  for (const fileName of FILES) {
    const filePath = path.join(stagesDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found, skipping: ${fileName}`);
      continue;
    }

    let stages: StageRecord[];
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      stages = JSON.parse(raw) as StageRecord[];
    } catch (e) {
      errors.push({ file: fileName, stageId: undefined, index: -1, message: `Failed to parse JSON: ${(e as Error).message}` });
      continue;
    }

    if (!Array.isArray(stages)) {
      errors.push({ file: fileName, stageId: undefined, index: -1, message: 'Top-level value must be an array' });
      continue;
    }

    totalCount += stages.length;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]!;
      validateStage(stage, i, fileName, errors);

      // 전체 id 중복 체크
      if (typeof stage.id === 'string') {
        const existingFile = allIds.get(stage.id);
        if (existingFile) {
          errors.push({
            file: fileName,
            stageId: stage.id,
            index: i,
            message: `Duplicate id "${stage.id}" (first seen in ${existingFile})`,
          });
        } else {
          allIds.set(stage.id, fileName);
        }
      }
    }
  }

  // 결과 출력
  if (errors.length > 0) {
    console.error(`\nValidation FAILED: ${errors.length} error(s) found across ${totalCount} stages\n`);
    for (const err of errors) {
      const location = err.stageId
        ? `[${err.file}] stage "${err.stageId}" (index ${err.index})`
        : `[${err.file}]`;
      console.error(`  ERROR ${location}: ${err.message}`);
    }
    process.exit(1);
  } else {
    console.log(`All ${totalCount} stages valid`);
    process.exit(0);
  }
}

main();

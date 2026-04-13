import type { CommandIntent, ScenarioType, StepStatus } from './types';

export const SCENARIO_TYPES: Record<Uppercase<ScenarioType>, ScenarioType> = {
  COFFEE: 'coffee',
  LAUNDRY: 'laundry',
  COOKING: 'cooking',
};

export const STEP_STATUS: Record<Uppercase<StepStatus>, StepStatus> = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DONE: 'done',
  SKIPPED: 'skipped',
};

export const STEP_ACTIONS = {
  NONE: 'none',
  RECALCULATE: 'recalculate',
  DRILL_DOWN: 'drill_down',
  NAVIGATE: 'navigate',
} as const;

export const COMMAND_INTENTS: Record<Uppercase<CommandIntent>, CommandIntent> = {
  CHANGE_VIEW: 'change_view',
  FOCUS_OBJECT: 'focus_object',
  EXPLAIN_MORE: 'explain_more',
  REPEAT_STEP: 'repeat_step',
  NEXT_STEP: 'next_step',
  PREV_STEP: 'prev_step',
  ADJUST_QUANTITY: 'adjust_quantity',
  SUBSTITUTE_ITEM: 'substitute_item',
  UPDATE_CONDITION: 'update_condition',
  RECALCULATE_PLAN: 'recalculate_plan',
  SHOW_WARNING: 'show_warning',
};

export const FALLBACK_MESSAGE = '요청을 정확히 해석하지 못했어요. 조건을 더 구체적으로 입력해 주세요.';

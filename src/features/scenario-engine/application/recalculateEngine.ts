import type { Command, Step } from '../domain/types';
import { STEP_ACTIONS, STEP_STATUS } from '../domain/constants';

function withResetStatus(step: Step): Step {
  const resetSubsteps = step.substeps?.map(withResetStatus);

  return {
    ...step,
    status: STEP_STATUS.PENDING,
    ...(resetSubsteps ? { substeps: resetSubsteps } : {}),
  };
}

export function recalculatePlan(plan: Step[], command: Command): Step[] {
  if (command.stepAction !== STEP_ACTIONS.RECALCULATE) {
    return plan;
  }

  return plan.map(withResetStatus);
}

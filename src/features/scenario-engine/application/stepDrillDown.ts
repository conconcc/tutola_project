import type { Step } from '@/features/scenario-engine/domain/types';

function findStepById(plan: Step[], stepId: string): Step | undefined {
  for (const step of plan) {
    if (step.id === stepId) {
      return step;
    }

    if (step.substeps) {
      const found = findStepById(step.substeps, stepId);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

export function drillDownStep(plan: Step[], stepId: string): Step[] {
  const targetStep = findStepById(plan, stepId);
  return targetStep?.substeps ?? [];
}

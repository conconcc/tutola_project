import { commandSchema } from '../../features/scenario-engine/domain/schemas';
import { FALLBACK_MESSAGE } from '../../features/scenario-engine/domain/constants';
import type { Command, ScenarioType } from '../../features/scenario-engine/domain/types';

export interface AIAdapter {
  interpret(input: string, scenarioType: ScenarioType, currentState: Record<string, unknown>): Promise<Command>;
}

function buildDeterministicFallback(
  input: string,
  scenarioType: ScenarioType,
  currentState: Record<string, unknown>,
): Command {
  const normalized = input.trim().toLowerCase();
  if (normalized.length === 0) {
    return {
      scenarioType,
      intent: 'explain_more',
      target: 'current_step',
      params: { currentState },
      stepAction: 'none',
      message: FALLBACK_MESSAGE,
    };
  }

  if (normalized.includes('다음') || normalized.includes('next')) {
    return {
      scenarioType,
      intent: 'next_step',
      target: 'step',
      params: { currentState },
      stepAction: 'navigate',
      message: '다음 단계로 이동할게요.',
    };
  }

  if (normalized.includes('이전') || normalized.includes('prev')) {
    return {
      scenarioType,
      intent: 'prev_step',
      target: 'step',
      params: { currentState },
      stepAction: 'navigate',
      message: '이전 단계로 돌아갈게요.',
    };
  }

  if (normalized.includes('위') || normalized.includes('top')) {
    return {
      scenarioType,
      intent: 'change_view',
      target: 'camera',
      params: { view: 'top', currentState },
      stepAction: 'navigate',
      message: '상단 시점으로 전환할게요.',
    };
  }

  if (normalized.includes('다시') || normalized.includes('재계산')) {
    return {
      scenarioType,
      intent: 'recalculate_plan',
      target: 'plan',
      params: { currentState },
      stepAction: 'recalculate',
      message: '현재 조건으로 계획을 다시 계산할게요.',
    };
  }

  if (normalized.includes('경고') || normalized.includes('주의') || normalized.includes('warning')) {
    return {
      scenarioType,
      intent: 'show_warning',
      target: 'warnings',
      params: { currentState },
      stepAction: 'none',
      message: '현재 조건의 경고 사항을 확인해 볼게요.',
    };
  }

  return {
    scenarioType,
    intent: 'explain_more',
    target: 'current_step',
    params: { currentState },
    stepAction: 'none',
    message: FALLBACK_MESSAGE,
  };
}

export class MockAIAdapter implements AIAdapter {
  async interpret(input: string, scenarioType: ScenarioType, currentState: Record<string, unknown>): Promise<Command> {
    const draft = buildDeterministicFallback(input, scenarioType, currentState);
    const parsed = commandSchema.safeParse(draft);
    return parsed.success ? parsed.data : buildDeterministicFallback('', scenarioType, currentState);
  }
}

export function createAIAdapter(): AIAdapter {
  return new MockAIAdapter();
}

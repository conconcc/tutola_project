import { describe, expect, it } from 'vitest';

import { recalculatePlan } from './recalculateEngine';
import type { Command, Step } from '../domain/types';

const basePlan: Step[] = [
  {
    id: 'step-1',
    title: '준비',
    description: '준비 단계',
    status: 'active',
    substeps: [
      {
        id: 'step-1-1',
        title: '물 준비',
        description: '물을 준비합니다',
        status: 'done',
      },
    ],
  },
];

describe('recalculatePlan', () => {
  it('recalculate 명령이면 상태를 pending으로 초기화한다', () => {
    const command: Command = {
      scenarioType: 'coffee',
      intent: 'recalculate_plan',
      target: 'plan',
      params: {},
      stepAction: 'recalculate',
      message: '다시 계산',
    };

    const updated = recalculatePlan(basePlan, command);
    expect(updated[0]?.status).toBe('pending');
    expect(updated[0]?.substeps?.[0]?.status).toBe('pending');
  });

  it('recalculate가 아니면 기존 plan을 그대로 유지한다', () => {
    const command: Command = {
      scenarioType: 'coffee',
      intent: 'next_step',
      target: 'step',
      params: {},
      stepAction: 'none',
      message: '다음 단계',
    };

    const updated = recalculatePlan(basePlan, command);
    expect(updated).toEqual(basePlan);
  });
});

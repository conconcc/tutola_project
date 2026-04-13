import { describe, expect, it } from 'vitest';

import type { Step } from '../domain/types';
import { drillDownStep } from './stepDrillDown';

const plan: Step[] = [
  {
    id: 'step-1',
    title: '준비',
    description: '준비 단계',
    status: 'pending',
    hint: '준비합니다',
    substeps: [
      {
        id: 'step-1-1',
        title: '물 준비',
        description: '물 준비',
        status: 'pending',
        hint: '물을 준비합니다',
      },
    ],
  },
  {
    id: 'step-2',
    title: '추출',
    description: '추출 단계',
    status: 'pending',
    hint: '추출합니다',
  },
];

describe('drillDownStep', () => {
  it('substeps가 있는 step id면 하위 단계를 반환한다', () => {
    const result = drillDownStep(plan, 'step-1');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('step-1-1');
  });

  it('존재하지 않는 step id면 빈 배열을 반환한다', () => {
    const result = drillDownStep(plan, 'missing');
    expect(result).toEqual([]);
  });

  it('substeps가 없는 step id면 빈 배열을 반환한다', () => {
    const result = drillDownStep(plan, 'step-2');
    expect(result).toEqual([]);
  });
});

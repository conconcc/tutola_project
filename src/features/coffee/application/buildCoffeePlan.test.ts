import { describe, expect, it } from 'vitest';

import { buildCoffeePlan } from './buildCoffeePlan';
import type { CoffeeState } from '../../scenario-engine/domain/types';

function createState(overrides: Partial<CoffeeState> = {}): CoffeeState {
  return {
    beanAmount: 20,
    waterAmount: 320,
    dripperType: 'v60',
    kettleAvailable: true,
    flavorPreference: 'balanced',
    currentStepId: 'coffee-prepare',
    currentView: 'front',
    ...overrides,
  };
}

describe('buildCoffeePlan', () => {
  it('kettleAvailable이 false면 kettle-substitute 단계를 포함한다', () => {
    const steps = buildCoffeePlan(createState({ kettleAvailable: false }));
    expect(steps.some((step) => step.id === 'kettle-substitute')).toBe(true);
  });

  it("flavorPreference가 'strong'이면 추출 시간 증가 단계를 포함한다", () => {
    const steps = buildCoffeePlan(createState({ flavorPreference: 'strong' }));
    expect(steps.some((step) => step.id === 'coffee-extract-strong')).toBe(true);
  });

  it("flavorPreference가 'light'이면 추출 시간 감소 단계를 포함한다", () => {
    const steps = buildCoffeePlan(createState({ flavorPreference: 'light' }));
    expect(steps.some((step) => step.id === 'coffee-extract-light')).toBe(true);
  });

  it("모든 Step은 status가 'pending'이고 hint를 포함한다", () => {
    const steps = buildCoffeePlan(createState());
    expect(steps.every((step) => step.status === 'pending' && typeof step.hint === 'string')).toBe(true);
  });
});

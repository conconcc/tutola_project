import { describe, expect, it } from 'vitest';

import { buildLaundryWarnings } from './laundryWarnings';
import type { LaundryState } from '../../scenario-engine/domain/types';

function createState(overrides: Partial<LaundryState> = {}): LaundryState {
  return {
    loadSize: 'medium',
    fabricTypes: ['cotton'],
    colorGroups: ['lights'],
    detergentType: 'standard',
    washerType: 'front_load',
    soilLevel: 'normal',
    currentStepId: 'step-1',
    ...overrides,
  };
}

describe('buildLaundryWarnings', () => {
  it("colorGroups에 whites/darks가 같이 있으면 COLOR_BLEED_RISK를 반환한다", () => {
    const warnings = buildLaundryWarnings(
      createState({
        colorGroups: ['whites', 'darks'],
      }),
    );

    expect(warnings.some((warning) => warning.code === 'COLOR_BLEED_RISK' && warning.severity === 'critical')).toBe(
      true,
    );
  });

  it("loadSize가 large이고 soilLevel이 heavy면 OVER_LOAD_RISK를 반환한다", () => {
    const warnings = buildLaundryWarnings(
      createState({
        loadSize: 'large',
        soilLevel: 'heavy',
      }),
    );

    expect(warnings.some((warning) => warning.code === 'OVER_LOAD_RISK' && warning.severity === 'caution')).toBe(
      true,
    );
  });

  it("fabricTypes에 wool이 있고 detergentType이 standard면 FABRIC_DAMAGE_RISK를 반환한다", () => {
    const warnings = buildLaundryWarnings(
      createState({
        fabricTypes: ['wool'],
        detergentType: 'standard',
      }),
    );

    expect(
      warnings.some((warning) => warning.code === 'FABRIC_DAMAGE_RISK' && warning.severity === 'caution'),
    ).toBe(true);
  });

  it('조건이 없으면 경고를 반환하지 않는다', () => {
    const warnings = buildLaundryWarnings(
      createState({
        loadSize: 'small',
        soilLevel: 'light',
        colorGroups: ['lights'],
        fabricTypes: ['synthetic'],
        detergentType: 'color_protect',
      }),
    );

    expect(warnings).toEqual([]);
  });
});

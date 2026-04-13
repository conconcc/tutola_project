import type { LaundryState, Warning } from '../../scenario-engine/domain/types';

function hasValue<T>(items: T[], value: T): boolean {
  return items.includes(value);
}

export function buildLaundryWarnings(state: LaundryState): Warning[] {
  const warnings: Warning[] = [];

  if (hasValue(state.colorGroups, 'whites') && hasValue(state.colorGroups, 'darks')) {
    warnings.push({
      id: 'warning-color-bleed-risk',
      code: 'COLOR_BLEED_RISK',
      severity: 'critical',
      message: '흰옷과 어두운 옷이 함께 있어 이염 위험이 있습니다.',
    });
  }

  if (state.loadSize === 'large' && state.soilLevel === 'heavy') {
    warnings.push({
      id: 'warning-over-load-risk',
      code: 'OVER_LOAD_RISK',
      severity: 'caution',
      message: '대용량 + 강오염 조합으로 세탁 성능 저하 위험이 있습니다.',
    });
  }

  if (hasValue(state.fabricTypes, 'wool') && state.detergentType === 'standard') {
    warnings.push({
      id: 'warning-fabric-damage-risk',
      code: 'FABRIC_DAMAGE_RISK',
      severity: 'caution',
      message: '울 소재에 일반 세제를 사용하면 손상 위험이 있습니다.',
    });
  }

  return warnings;
}

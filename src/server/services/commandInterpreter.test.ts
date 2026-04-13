import { describe, expect, it } from 'vitest';

import { interpretCommand } from './commandInterpreter';

describe('interpretCommand', () => {
  it('상단 시점 요청을 change_view 명령으로 해석한다', async () => {
    const command = await interpretCommand({
      scenarioType: 'coffee',
      naturalLanguageInput: '위에서 보여줘',
      currentState: { currentView: 'front' },
    });

    expect(command.intent).toBe('change_view');
    expect(command.stepAction).toBe('navigate');
  });

  it('재계산 요청을 recalculate_plan 명령으로 해석한다', async () => {
    const command = await interpretCommand({
      scenarioType: 'laundry',
      naturalLanguageInput: '재계산해줘',
      currentState: { loadSize: 'large' },
    });

    expect(command.intent).toBe('recalculate_plan');
    expect(command.stepAction).toBe('recalculate');
  });

  it('다음 단계 요청을 next_step 명령으로 해석한다', async () => {
    const command = await interpretCommand({
      scenarioType: 'cooking',
      naturalLanguageInput: '다음 단계로',
      currentState: { currentStepId: 'step-1' },
    });

    expect(command.intent).toBe('next_step');
    expect(command.stepAction).toBe('navigate');
  });

  it('경고 확인 요청을 show_warning 명령으로 해석한다', async () => {
    const command = await interpretCommand({
      scenarioType: 'laundry',
      naturalLanguageInput: '경고 보여줘',
      currentState: { loadSize: 'large', soilLevel: 'heavy' },
    });

    expect(command.intent).toBe('show_warning');
    expect(command.target).toBe('warnings');
  });
});

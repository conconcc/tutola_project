import { describe, expect, it } from 'vitest';

import { createAIAdapter } from './aiAdapter';

describe('MockAIAdapter', () => {
  it('위/ top 요청을 change_view로 해석한다', async () => {
    const adapter = createAIAdapter();
    const command = await adapter.interpret('top view', 'coffee', { currentView: 'front' });

    expect(command.intent).toBe('change_view');
    expect(command.stepAction).toBe('navigate');
  });

  it('다음 요청을 next_step으로 해석한다', async () => {
    const adapter = createAIAdapter();
    const command = await adapter.interpret('다음', 'cooking', { currentStepId: 'step-1' });

    expect(command.intent).toBe('next_step');
  });

  it('알 수 없는 입력은 explain_more fallback으로 해석한다', async () => {
    const adapter = createAIAdapter();
    const command = await adapter.interpret('???', 'laundry', { loadSize: 'small' });

    expect(command.intent).toBe('explain_more');
    expect(command.stepAction).toBe('none');
  });
});

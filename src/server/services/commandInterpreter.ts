import { commandSchema } from '../../features/scenario-engine/domain/schemas';
import type { Command, InterpretRequest } from '../../features/scenario-engine/domain/types';
import { createAIAdapter } from './aiAdapter';

export async function interpretCommand(request: InterpretRequest): Promise<Command> {
  const aiAdapter = createAIAdapter();
  const command = await aiAdapter.interpret(
    request.naturalLanguageInput,
    request.scenarioType,
    request.currentState,
  );

  const parsed = commandSchema.safeParse(command);
  if (!parsed.success) {
    return {
      scenarioType: request.scenarioType,
      intent: 'explain_more',
      target: 'current_step',
      params: { reason: 'invalid-ai-output' },
      stepAction: 'none',
      message: '명령 해석에 실패했습니다. 다시 입력해 주세요.',
    };
  }

  return parsed.data;
}

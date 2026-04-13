import { z } from 'zod';
import type { Step } from './types';

export const scenarioTypeSchema = z.enum(['coffee', 'laundry', 'cooking']);

export const commandIntentSchema = z.enum([
  'change_view',
  'focus_object',
  'explain_more',
  'repeat_step',
  'next_step',
  'prev_step',
  'adjust_quantity',
  'substitute_item',
  'update_condition',
  'recalculate_plan',
  'show_warning',
]);

export const stepStatusSchema = z.enum(['pending', 'active', 'done', 'skipped']);

export const stepSchema: z.ZodType<Step> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    hint: z.string().optional(),
    status: stepStatusSchema,
    substeps: z.array(stepSchema).optional(),
    visualCue: z.string().optional(),
    estimatedDurationSeconds: z.number().int().positive().optional(),
  }),
);

export const commandSchema = z.object({
  scenarioType: scenarioTypeSchema,
  intent: commandIntentSchema,
  target: z.string().min(1),
  params: z.record(z.string(), z.unknown()),
  stepAction: z.enum(['none', 'recalculate', 'drill_down', 'navigate']),
  message: z.string().min(1),
});

export const interpretRequestSchema = z.object({
  scenarioType: scenarioTypeSchema,
  naturalLanguageInput: z.string().min(1).max(500),
  currentState: z.record(z.string(), z.unknown()).refine((state) => Object.keys(state).length <= 100, {
    message: 'currentState key count must be <= 100',
  }),
});

export type CommandInput = z.infer<typeof commandSchema>;
export type InterpretRequestInput = z.infer<typeof interpretRequestSchema>;

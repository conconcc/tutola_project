# SCHEMA.md — TUTOLA Domain Type Schema

> **Source of Truth** for all domain types, Zod schemas, and API boundaries.
> Cursor, Antigravity, and reviewers should use this document as the single reference for data structures.

---

## 0. 타입 정의 전략 (레이어별 기준)

이 문서의 타입 정의는 **설계 참조용**이다. 실제 코드 구현 시 아래 기준을 따른다.

| 레이어 | 타입 정의 방식 | 이유 |
|--------|--------------|------|
| Form 입력, API request body | `z.object()` → `z.infer<>` 파생 | 런타임 검증 필요 |
| AI 출력, 외부 API 응답 | `z.object()` → `z.infer<>` 파생 | 신뢰할 수 없는 데이터 |
| 내부 도메인 타입 (Step, Warning 등) | `interface` 직접 정의 | 이미 검증된 데이터 |
| 컴포넌트 Props | `interface` 직접 정의 | UI 레이어는 이미 검증된 데이터 |

```typescript
// ✅ 외부 입력 → Zod 우선
const coffeeFormSchema = z.object({
  beanAmount: z.number().min(5).max(50),
  dripperType: z.enum(['v60', 'kalita', 'chemex', 'aeropress', 'french_press']),
});
export type CoffeeFormData = z.infer<typeof coffeeFormSchema>; // 파생

// ✅ 내부 도메인 → interface 직접 정의 (이 문서의 구조를 코드에서 그대로 사용)
export interface Step {
  id: string;
  title: string;
  status: StepStatus;
  substeps?: Step[];
}
```


## 1. Core Primitives

### 1.1 ScenarioType

```typescript
type ScenarioType = 'coffee' | 'laundry' | 'cooking';
```

### 1.2 StepStatus

```typescript
type StepStatus = 'pending' | 'active' | 'done' | 'skipped';
```

### 1.3 CommandIntent

```typescript
type CommandIntent =
  | 'change_view'
  | 'focus_object'
  | 'explain_more'
  | 'repeat_step'
  | 'next_step'
  | 'prev_step'
  | 'adjust_quantity'
  | 'substitute_item'
  | 'update_condition'
  | 'recalculate_plan'
  | 'show_warning';
```

---

## 2. Common Domain Models

### 2.1 Step

```typescript
interface Step {
  id: string;
  title: string;
  description: string;
  hint?: string;
  status: StepStatus;
  substeps?: Step[];
  visualCue?: string;
  estimatedDurationSeconds?: number;
}
```

### 2.2 Warning

```typescript
interface Warning {
  id: string;
  code: string;               // e.g. 'COLOR_BLEED_RISK', 'OVER_EXTRACTION'
  severity: 'info' | 'caution' | 'critical';
  message: string;
  affectedStep?: string;      // Step id
}
```

### 2.3 Substitution

```typescript
interface Substitution {
  id: string;
  originalItem: string;
  substituteItem: string;
  impact: string;             // 설명: "맛이 약간 달라질 수 있음"
  affectedSteps: string[];    // Step ids
}
```

### 2.4 ProgressEvent

```typescript
interface ProgressEvent {
  timestamp: string;          // ISO 8601
  scenarioType: ScenarioType;
  stepId: string;
  eventType: 'step_start' | 'step_complete' | 'drill_down' | 'command_applied' | 'plan_recalculated';
  metadata?: Record<string, unknown>;
}
```

### 2.5 Command

```typescript
interface Command {
  scenarioType: ScenarioType;
  intent: CommandIntent;
  target: string;
  params: Record<string, unknown>;
  stepAction: 'none' | 'recalculate' | 'drill_down' | 'navigate';
  message: string;            // 코치형 피드백 메시지
}
```

---

## 3. Base Scenario Interface

```typescript
interface BaseScenario<TState, TResources> {
  id: string;
  scenarioType: ScenarioType;
  title: string;
  resources: TResources;
  currentState: TState;
  plan: Step[];
  warnings: Warning[];
  substitutions: Substitution[];
}
```

All scenario-specific types MUST extend this interface via generic instantiation.

---

## 4. Scenario-Specific State

### 4.1 CoffeeState & CoffeeResources

```typescript
type DripperType = 'v60' | 'kalita' | 'chemex' | 'aeropress' | 'french_press';
type FlavorPreference = 'light' | 'balanced' | 'strong';
type CameraView = 'front' | 'top' | 'side' | 'zoom';
type FocusTarget = 'dripper' | 'pour' | 'cup' | 'kettle';

interface CoffeeState {
  beanAmount: number;           // grams
  waterAmount: number;          // ml
  dripperType: DripperType;
  kettleAvailable: boolean;
  flavorPreference: FlavorPreference;
  currentStepId: string;
  currentView: CameraView;
  focusTarget?: FocusTarget;
}

interface CoffeeResources {
  beanName?: string;
  grindSize?: 'coarse' | 'medium' | 'fine';
  waterTemperature?: number;    // Celsius
}

type CoffeeScenario = BaseScenario<CoffeeState, CoffeeResources>;
```

### 4.2 LaundryState & LaundryResources

```typescript
type LoadSize = 'small' | 'medium' | 'large';
type FabricType = 'cotton' | 'synthetic' | 'wool' | 'delicate' | 'mixed';
type ColorGroup = 'whites' | 'lights' | 'darks' | 'colors';
type DetergentType = 'standard' | 'sensitive' | 'color_protect' | 'wool_care';
type WasherType = 'top_load' | 'front_load';
type SoilLevel = 'light' | 'normal' | 'heavy';

interface LaundryState {
  loadSize: LoadSize;
  fabricTypes: FabricType[];
  colorGroups: ColorGroup[];
  detergentType: DetergentType;
  washerType: WasherType;
  soilLevel: SoilLevel;
  currentStepId: string;
}

interface LaundryResources {
  machineModel?: string;
  availableDetergents?: DetergentType[];
}

type LaundryScenario = BaseScenario<LaundryState, LaundryResources>;
```

### 4.3 CookingState & CookingResources

```typescript
interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  prepState: 'whole' | 'chopped' | 'sliced' | 'minced' | 'cooked';
  isAvailable: boolean;
  substituteId?: string;
}

interface CookingState {
  recipeId: string;
  servings: number;
  ingredients: Ingredient[];
  toolAvailability: Record<string, boolean>;  // e.g. { oven: true, blender: false }
  currentStepId: string;
}

interface CookingResources {
  recipeName: string;
  baseServings: number;
  estimatedTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

type CookingScenario = BaseScenario<CookingState, CookingResources>;
```

---

## 5. Education Extension Types

> Used when TUTOLA is deployed as an institutional learning platform.

### 5.1 Course

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  scenarioTypes: ScenarioType[];
  modules: Module[];
  targetAudience: string;
  estimatedHours: number;
  isPublished: boolean;
}
```

### 5.2 Module

```typescript
interface Module {
  id: string;
  courseId: string;
  title: string;
  scenarioType: ScenarioType;
  scenarioId: string;
  order: number;
  objectives: string[];
  assessmentCriteria?: AssessmentCriteria[];
}

interface AssessmentCriteria {
  id: string;
  description: string;
  weight: number;             // 0–100, sum must equal 100 across criteria
}
```

### 5.3 Cohort

```typescript
interface Cohort {
  id: string;
  courseId: string;
  name: string;
  startDate: string;          // ISO 8601
  endDate: string;
  instructorId: string;
  learnerIds: string[];
  status: 'upcoming' | 'active' | 'completed';
}
```

### 5.4 AssessmentRecord

```typescript
interface AssessmentRecord {
  id: string;
  learnerId: string;
  moduleId: string;
  cohortId: string;
  completedAt: string;        // ISO 8601
  progressEvents: ProgressEvent[];
  score?: number;             // 0–100
  instructorNote?: string;
  passed: boolean;
}
```

---

## 6. AI / Command Layer Types

### 6.1 InterpretRequest

```typescript
interface InterpretRequest {
  scenarioType: ScenarioType;
  naturalLanguageInput: string;
  currentState: Record<string, unknown>;
}
```

### 6.2 InterpretResponse

```typescript
type InterpretResponse =
  | { success: true; command: Command }
  | { success: false; fallbackMessage: string; raw: string };
```

---

## 7. Zod Validation Principles

1. **모든 외부 입력은 Zod로 검증**한다 — form data, API request body, AI output 포함
2. **Schema → Type 순서**: 항상 `z.infer<typeof schema>`로 타입을 파생한다
3. **AI 응답**은 `safeParse`로 검증하고, 실패 시 반드시 fallback을 실행한다
4. **string enum**은 `z.enum([...])` 사용, TypeScript union과 일치시킨다
5. **Optional 필드**는 `.optional()` 또는 `.nullable().optional()` 명시

```typescript
// Example: Command schema
import { z } from 'zod';

const commandIntentSchema = z.enum([
  'change_view', 'focus_object', 'explain_more', 'repeat_step',
  'next_step', 'prev_step', 'adjust_quantity', 'substitute_item',
  'update_condition', 'recalculate_plan', 'show_warning',
]);

const commandSchema = z.object({
  scenarioType: z.enum(['coffee', 'laundry', 'cooking']),
  intent: commandIntentSchema,
  target: z.string().min(1),
  params: z.record(z.unknown()),
  stepAction: z.enum(['none', 'recalculate', 'drill_down', 'navigate']),
  message: z.string().min(1),
});

export type Command = z.infer<typeof commandSchema>;
```

---

## 8. DTO & API Boundary Rules

| Rule | Detail |
|------|--------|
| **Domain model ≠ DTO** | API response shape는 domain type과 분리한다 |
| **Server → Client** | `mappers/` 레이어에서 domain → DTO 변환 |
| **Client → Server** | Request body는 Zod schema로 즉시 검증 |
| **No domain types in URL params** | URL param은 string, 서버에서 parse |
| **AI output is always untrusted** | `aiResponseSchema.safeParse()` 필수 |

```typescript
// DTO example
interface StepDTO {
  id: string;
  title: string;
  description: string;
  hasSubsteps: boolean;       // domain의 substeps?.length > 0 를 boolean으로 평탄화
  status: StepStatus;
}

// Mapper
function toStepDTO(step: Step): StepDTO {
  return {
    id: step.id,
    title: step.title,
    description: step.description,
    hasSubsteps: (step.substeps?.length ?? 0) > 0,
    status: step.status,
  };
}
```

---

## 9. Naming & Convention Reference

| Pattern | Convention | Example |
|---------|-----------|---------|
| Pure builder | `buildX` | `buildCoffeePlan` |
| Mapper | `toX` / `mapX` | `toStepDTO`, `mapIngredients` |
| Validator | `validateX` / `XSchema` | `validateServings`, `commandSchema` |
| Boolean fields | `is/has/can/should` | `isAvailable`, `hasSubsteps` |
| Enum values | `SCREAMING_SNAKE_CASE` constants | `LOAD_SIZE.LARGE` |

export type ScenarioType = 'coffee' | 'laundry' | 'cooking';

export type StepStatus = 'pending' | 'active' | 'done' | 'skipped';

export type CommandIntent =
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

export interface Step {
  id: string;
  title: string;
  description: string;
  hint?: string | undefined;
  status: StepStatus;
  substeps?: Step[] | undefined;
  visualCue?: string | undefined;
  estimatedDurationSeconds?: number | undefined;
}

export interface Warning {
  id: string;
  code: string;
  severity: 'info' | 'caution' | 'critical';
  message: string;
  affectedStep?: string | undefined;
}

export interface Substitution {
  id: string;
  originalItem: string;
  substituteItem: string;
  impact: string;
  affectedSteps: string[];
}

export interface Command {
  scenarioType: ScenarioType;
  intent: CommandIntent;
  target: string;
  params: Record<string, unknown>;
  stepAction: 'none' | 'recalculate' | 'drill_down' | 'navigate';
  message: string;
}

export interface BaseScenario<TState, TResources> {
  id: string;
  scenarioType: ScenarioType;
  title: string;
  resources: TResources;
  currentState: TState;
  plan: Step[];
  warnings: Warning[];
  substitutions: Substitution[];
}

export type DripperType = 'v60' | 'kalita' | 'chemex' | 'aeropress' | 'french_press';
export type FlavorPreference = 'light' | 'balanced' | 'strong';
export type CameraView = 'front' | 'top' | 'side' | 'zoom';
export type FocusTarget = 'dripper' | 'pour' | 'cup' | 'kettle';

export interface CoffeeState {
  beanAmount: number;
  waterAmount: number;
  dripperType: DripperType;
  kettleAvailable: boolean;
  flavorPreference: FlavorPreference;
  currentStepId: string;
  currentView: CameraView;
  focusTarget?: FocusTarget | undefined;
}

export interface CoffeeResources {
  beanName?: string | undefined;
  grindSize?: 'coarse' | 'medium' | 'fine' | undefined;
  waterTemperature?: number | undefined;
}

export type CoffeeScenario = BaseScenario<CoffeeState, CoffeeResources>;

export type LoadSize = 'small' | 'medium' | 'large';
export type FabricType = 'cotton' | 'synthetic' | 'wool' | 'delicate' | 'mixed';
export type ColorGroup = 'whites' | 'lights' | 'darks' | 'colors';
export type DetergentType = 'standard' | 'sensitive' | 'color_protect' | 'wool_care';
export type WasherType = 'top_load' | 'front_load';
export type SoilLevel = 'light' | 'normal' | 'heavy';

export interface LaundryState {
  loadSize: LoadSize;
  fabricTypes: FabricType[];
  colorGroups: ColorGroup[];
  detergentType: DetergentType;
  washerType: WasherType;
  soilLevel: SoilLevel;
  currentStepId: string;
}

export interface LaundryResources {
  machineModel?: string | undefined;
  availableDetergents?: DetergentType[] | undefined;
}

export type LaundryScenario = BaseScenario<LaundryState, LaundryResources>;

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  prepState: 'whole' | 'chopped' | 'sliced' | 'minced' | 'cooked';
  isAvailable: boolean;
  substituteId?: string | undefined;
}

export interface CookingState {
  recipeId: string;
  servings: number;
  ingredients: Ingredient[];
  toolAvailability: Record<string, boolean>;
  currentStepId: string;
}

export interface CookingResources {
  recipeName: string;
  baseServings: number;
  estimatedTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type CookingScenario = BaseScenario<CookingState, CookingResources>;

export interface InterpretRequest {
  scenarioType: ScenarioType;
  naturalLanguageInput: string;
  currentState: Record<string, unknown>;
}

export type InterpretResponse =
  | { success: true; command: Command }
  | { success: false; errorCode: string; message: string };

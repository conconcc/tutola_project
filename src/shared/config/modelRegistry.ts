/**
 * 3D Model Registry
 *
 * 현재: public/models/ 로컬 파일 서빙 (Next.js static)
 *
 * S3 전환 시 아래 한 줄만 바꾸면 됩니다:
 *   const BASE = 'https://<bucket>.s3.<region>.amazonaws.com/models';
 *
 * 또는 환경변수로 관리:
 *   const BASE = process.env.NEXT_PUBLIC_MODEL_BASE_URL ?? '/models';
 */

// ── [SWAP POINT] 모델 base URL ──────────────────────────────────────────────
// .env  NEXT_PUBLIC_MODEL_BASE_URL 값으로 제어합니다.
// 로컬  : NEXT_PUBLIC_MODEL_BASE_URL=/models
// S3    : NEXT_PUBLIC_MODEL_BASE_URL=https://<bucket>.s3.<region>.amazonaws.com/models
// CDN   : NEXT_PUBLIC_MODEL_BASE_URL=https://<cdn-domain>/models
const BASE = process.env.NEXT_PUBLIC_MODEL_BASE_URL ?? '/models';

// ── 개별 모델 경로 빌더 ──────────────────────────────────────────────────────
const m = (scenario: string, file: string) => `${BASE}/${scenario}/${file}`;

// ── Coffee Brewing 모델 ──────────────────────────────────────────────────────
export const COFFEE_MODELS = {
  kettle:        m('coffee', 'kettle.glb'),
  dripper:       m('coffee', 'dripper.glb'),
  paperFilter:   m('coffee', 'paper-filter.glb'),
  coffeeServer:  m('coffee', 'coffee-server.glb'),
  scale:         m('coffee', 'scale.glb'),
  mug:           m('coffee', 'mug.glb'),
  coffeeBeans:   m('coffee', 'coffee-beans.glb'),
  thermometer:   m('coffee', 'thermometer.glb'),
} as const;

// step ID → 모델 경로 매핑 (CoffeeViewer가 사용)
export const COFFEE_STEP_MODELS: Record<string, string> = {
  'coffee-grind':    COFFEE_MODELS.coffeeBeans,
  'coffee-weigh':    COFFEE_MODELS.scale,
  'coffee-boil':     COFFEE_MODELS.kettle,
  'coffee-filter':   COFFEE_MODELS.paperFilter,
  'coffee-bloom':    COFFEE_MODELS.dripper,
  'coffee-pour':     COFFEE_MODELS.dripper,
  'coffee-serve':    COFFEE_MODELS.mug,
  'coffee-temp':     COFFEE_MODELS.thermometer,
};

export const COFFEE_DEFAULT_MODEL = COFFEE_MODELS.dripper;

// ── Laundry 모델 ─────────────────────────────────────────────────────────────
export const LAUNDRY_MODELS = {
  washingMachine: m('laundry', 'washing-machine.glb'),
  laundryBasket:  m('laundry', 'laundry-basket.glb'),
  jeans:          m('laundry', 'jeans.glb'),
  shirt:          m('laundry', 'shirt.glb'),
  woolKnit:       m('laundry', 'wool-knit.glb'),
  laundryNet:     m('laundry', 'laundry-net.glb'),
  detergent:      m('laundry', 'detergent.glb'),
  dryingRack:     m('laundry', 'drying-rack.glb'),
} as const;

// step ID → 모델 경로 매핑 (LaundryViewer가 사용)
export const LAUNDRY_STEP_MODELS: Record<string, string> = {
  'laundry-pretreat':          LAUNDRY_MODELS.detergent,
  'laundry-sort-delicate':     LAUNDRY_MODELS.laundryNet,
  'laundry-sort-normal':       LAUNDRY_MODELS.laundryBasket,
  'laundry-detergent-neutral': LAUNDRY_MODELS.detergent,
  'laundry-detergent-normal':  LAUNDRY_MODELS.detergent,
  'laundry-course-setting':    LAUNDRY_MODELS.washingMachine,
};

export const LAUNDRY_DEFAULT_MODEL = LAUNDRY_MODELS.laundryBasket;

// ── Cooking 모델 ──────────────────────────────────────────────────────────────
export const COOKING_MODELS = {
  stove:             m('cooking', 'stove.glb'),
  fryingPan:         m('cooking', 'frying-pan.glb'),
  pot:               m('cooking', 'pot.glb'),
  cuttingBoardKnife: m('cooking', 'cutting-board-knife.glb'),
  ingredients:       m('cooking', 'ingredients.glb'),
  utensils:          m('cooking', 'utensils.glb'),
  platingDish:       m('cooking', 'plating-dish.glb'),
} as const;

// step ID → 모델 경로 매핑 (CookingViewer가 사용)
export const COOKING_STEP_MODELS: Record<string, string> = {
  'cooking-gather':         COOKING_MODELS.ingredients,
  'cooking-wash-prep':      COOKING_MODELS.ingredients,
  'cooking-cutting-order':  COOKING_MODELS.cuttingBoardKnife,
  'cooking-heat-pan':       COOKING_MODELS.fryingPan,
  'cooking-main-sequence':  COOKING_MODELS.utensils,
  'cooking-simmer-balance': COOKING_MODELS.pot,
  'cooking-season':         COOKING_MODELS.utensils,
  'cooking-plate':          COOKING_MODELS.platingDish,
};

export const COOKING_DEFAULT_MODEL = COOKING_MODELS.ingredients;

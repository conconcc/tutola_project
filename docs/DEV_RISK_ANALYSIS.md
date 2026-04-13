# DEV_RISK_ANALYSIS.md — 개발 중 잠재적 문제 분석 및 선제 대응

> 개발 시작 전 알고 있으면 막힘 없이 진행할 수 있는 기술적 위험 요소 정리.
> 각 항목은 **위험 설명 → 원인 → 선제 해결책**으로 구성한다.

---

## 위험 레벨 기준

| 등급 | 의미 |
|------|------|
| 🔴 HIGH | 개발 중단 또는 배포 실패 가능 |
| 🟡 MEDIUM | 시간 손실 또는 기능 미동작 가능 |
| 🟢 LOW | 주의 필요하나 영향 제한적 |

---

## 🔴 HIGH — [확정] React Three Fiber SSR 충돌

**적용 전략: `next/dynamic` + `ssr: false`로 확정**

### 왜 이 문제가 발생하는가

Next.js App Router는 모든 컴포넌트를 기본적으로 **서버에서 먼저 렌더링(SSR)** 한다.
이때 Node.js 서버 환경에는 `window`, `WebGL`, `requestAnimationFrame` 같은 브라우저 API가 없다.

React Three Fiber는 이 브라우저 API에 완전히 의존하므로, 서버에서 import되는 순간 아래 에러가 발생한다:
```
ReferenceError: window is not defined
ReferenceError: document is not defined
Error: WebGL is not supported in this environment
```

**`'use client'`만으로는 왜 부족한가:**
`'use client'`는 "이 컴포넌트는 클라이언트에서 실행된다"는 선언이지만,
Next.js는 여전히 **초기 HTML 생성을 위해 서버에서 import를 평가(evaluate)** 한다.
즉, 모듈 자체가 서버에서 로드되는 것을 막지 못한다.

### 확정 해결책: `dynamic({ ssr: false })`

```typescript
// ✅ 사용하는 쪽 (예: src/app/coffee/page.tsx 또는 상위 클라이언트 컴포넌트)
import dynamic from 'next/dynamic';

const CoffeeViewer = dynamic(
  () => import('@/features/coffee/ui/CoffeeViewer').then(m => m.CoffeeViewer),
  {
    ssr: false,                                      // 서버에서 실행 완전 차단
    loading: () => <CoffeeViewerSkeleton />,         // 로딩 중 fallback UI
  }
);

// ✅ CoffeeViewer 파일 자체에는 'use client' 유지 (이중 보호)
// src/features/coffee/ui/CoffeeViewer/index.tsx
'use client';
import { Canvas } from '@react-three/fiber';
// ...
```

**규칙: R3F 컴포넌트를 사용하는 모든 곳에서 `dynamic({ ssr: false })`를 적용한다.**

---

## 🔴 HIGH — [설명 추가] Zustand Server/Client Hydration Mismatch

### 개념 설명 — Hydration이란?

Next.js의 렌더링은 2단계로 이루어진다:

```
1단계 (서버):
  서버가 HTML을 생성한다 e.g. <div class="step">물 붓기</div>
  이때 Zustand store도 초기값으로 초기화된다 e.g. { currentStepId: 'step-1' }

2단계 (클라이언트, Hydration):
  브라우저가 JS를 실행하면서 React가 DOM을 "인수인계" 받는다
  이때 클라이언트의 Zustand도 독립적으로 초기화된다

문제 발생 시점:
  서버에서 만든 HTML과 클라이언트 React가 그린 결과가 다를 때
  → "Hydration mismatch" 에러 또는 경고 발생
  → 화면이 깜빡이거나 상태가 초기화되는 현상
```

### TUTOLA에서 이 문제가 발생하는 경우

```typescript
// ❌ 위험한 패턴: Server Component에서 Zustand store 값을 참조
// src/app/coffee/page.tsx (Server Component)
import { useCoffeeStore } from '@/features/coffee/store'; // ❌ Server에서 import
export default function CoffeePage() {
  const state = useCoffeeStore(s => s.currentStepId); // ❌ 서버에서 실행됨
  return <div>{state}</div>;
}
```

### MVP 확정 해결책: 순수 메모리 store

TUTOLA의 시나리오 상태(스텝 진행, 입력 파라미터 등)는 **세션 내 일시적 데이터**다.
페이지 새로고침 시 초기화되어도 무방하므로, `persist` 없이 순수 메모리 store로 구현한다.

```typescript
// ✅ src/features/coffee/store/useCoffeeStore.ts
'use client'; // 파일 상단 선언 불필요, 사용하는 컴포넌트에서 처리

import { create } from 'zustand';
import { CoffeeState } from '../domain/types';
import { DEFAULT_COFFEE_STATE } from '../domain/constants';

interface CoffeeStore {
  state: CoffeeState;
  updateState: (patch: Partial<CoffeeState>) => void;
  reset: () => void;
}

// persist 없음 = sessionStorage/localStorage 없음 = hydration 문제 없음
export const useCoffeeStore = create<CoffeeStore>((set) => ({
  state: DEFAULT_COFFEE_STATE,
  updateState: (patch) => set((prev) => ({ state: { ...prev.state, ...patch } })),
  reset: () => set({ state: DEFAULT_COFFEE_STATE }),
}));
```

**규칙: Zustand store는 `'use client'` 컴포넌트 안에서만 호출한다. Server Component에서 직접 import 금지.**

---

## 🔴 HIGH — [검토 완료] TypeScript + Zod 타입 파생 패턴

### z.infer<> 패턴 검토 결과

**결론: TUTOLA 풀스택 환경에서 z.infer<> 패턴은 적합하다. 단, 적용 범위를 레이어에 따라 구분한다.**

### 왜 적합한가

TypeScript 풀스택 생태계(tRPC, Next.js 공식 예제, Zod 공식 문서)의 표준 패턴이다.
핵심 장점:
1. **타입 드리프트 원천 차단**: 스키마와 타입이 항상 일치 (하나를 바꾸면 다른 하나도 자동 변경)
2. **런타임 검증 + 컴파일 타임 검증 동시 획득**: 코드 재사용
3. **API boundary 명확화**: 외부에서 오는 데이터의 신뢰성 보장

### TUTOLA 레이어별 적용 기준

```
레이어                    타입 정의 방식              이유
─────────────────────────────────────────────────────────────────────
외부 입력 (Form, API)     z.infer<> 필수              런타임 검증이 필요
AI 출력                  z.infer<> 필수              신뢰할 수 없는 데이터
Server Action / Route    z.infer<> 필수              외부에서 오는 request body
─────────────────────────────────────────────────────────────────────
도메인 내부 타입          interface / type 가능         검증 없이 내부에서만 사용
순수 함수 입출력          interface / type 가능         이미 검증된 데이터
컴포넌트 Props            interface 권장               UI 레이어는 이미 검증된 데이터
─────────────────────────────────────────────────────────────────────
```

### 실제 코드 패턴

```typescript
// ✅ 패턴 A: 외부 입력 레이어 (z.infer<> 필수)
// src/server/validators/commandSchema.ts
const commandSchema = z.object({
  scenarioType: z.enum(['coffee', 'laundry', 'cooking']),
  intent: commandIntentSchema,
  message: z.string().min(1),
});
export type Command = z.infer<typeof commandSchema>; // 타입은 스키마에서 파생

// ✅ 패턴 B: 도메인 내부 타입 (interface 직접 정의 가능)
// src/features/scenario-engine/domain/types.ts
export interface Step {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  substeps?: Step[];
}
// Step은 외부 입력이 아니라 내부 로직이 만드는 객체 → Zod 불필요

// ✅ 패턴 C: 폼 입력 (z.infer<> 필수)
// src/features/coffee/ui/CoffeeForm/schema.ts
const coffeeFormSchema = z.object({
  beanAmount: z.number().min(5, '최소 5g').max(50, '최대 50g'),
  waterAmount: z.number().min(100).max(500),
  dripperType: z.enum(['v60', 'kalita', 'chemex', 'aeropress', 'french_press']),
  kettleAvailable: z.boolean(),
  flavorPreference: z.enum(['light', 'balanced', 'strong']),
});
export type CoffeeFormData = z.infer<typeof coffeeFormSchema>;
```

### SCHEMA.md와의 관계

`docs/SCHEMA.md`의 타입 정의는 **설계 문서용 참조**이며, 실제 코드에서는:
- 외부 입력 → Zod schema 우선, `z.infer<>`로 타입 파생
- 내부 도메인 → interface 직접 정의 (SCHEMA.md 구조 따름)

---

## 🔴 HIGH — [자동화 가능] Vercel 빌드 자동 검증

### Antigravity로 자동화 가능 여부: ✅ 가능

Antigravity는 터미널 명령 실행 능력을 가지므로 `npm run build`를 Mission P6-B에서 직접 실행할 수 있다.

### Antigravity Mission P6-B 자동 실행 시퀀스

```
Antigravity Mission P6-B 실행 시:

1. npm run build 실행
   ├── 成功 → 다음 단계 진행
   └── 実패 → 에러 메시지 캡처 → Cursor에 보고 → Cursor 수정 → 재시도

2. 빌드 성공 후 번들 크기 확인
   - .next/static/ 디렉터리 크기 확인
   - Three.js 번들이 과다하면 경고 보고

3. npm start 로 production 서버 시작
   - 브라우저에서 localhost:3000 접속 → 3개 시나리오 확인
   - 스크린샷 저장

4. 결과 보고
```

### Cursor로도 자동화 가능 여부: ⚠️ 부분 가능

Cursor는 명령어 실행이 가능하지만, **결과를 브라우저로 추가 검증하는 것은 Antigravity에게 위임**하는 것이 낫다.

```
권장 분업:
  Cursor  → npx tsc --noEmit, npx eslint, npx vitest run (코드 레벨 게이트)
  Antigravity → npm run build, 브라우저 E2E (런타임 레벨 게이트)
```

### GitHub Actions CI 자동화 (차선책 → 보완책으로 권장)

로컬 자동화 외에, **Git push 시마다 자동으로 빌드를 검증**하는 CI 파이프라인을 추가한다.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check (Gate 1)
        run: npx tsc --noEmit

      - name: ESLint check (Gate 2)
        run: npx eslint src/ --ext .ts,.tsx --max-warnings 0

      - name: Unit tests (Gate 3)
        run: npx vitest run

      - name: Production build (Gate 5)
        run: npm run build
        env:
          AI_PROVIDER_API_KEY: ${{ secrets.AI_PROVIDER_API_KEY }}
```

> 이 파일을 추가하면 GitHub가 자동으로 실행한다. Vercel과 연결 시 CI 통과 후에만 배포된다.

---

## 🟡 MEDIUM — Three.js 번들 크기 과다

**선제 해결책**
```typescript
// 1. dynamic import로 코드 분할 (이미 확정)
const CoffeeViewer = dynamic(
  () => import('@/features/coffee/ui/CoffeeViewer').then(m => m.CoffeeViewer),
  { ssr: false, loading: () => <CoffeeViewerSkeleton /> }
);

// 2. drei에서 named import (tree-shaking 활성화)
import { OrbitControls, useGLTF } from '@react-three/drei'; // ✅
import * as drei from '@react-three/drei'; // ❌

// 3. 번들 분석 (필요 시)
// npm install -D @next/bundle-analyzer
```

---

## 🟡 MEDIUM — Tailwind CSS 동적 클래스 누락 (Production)

```typescript
// ❌ 클래스 이름을 문자열 조합으로 생성 금지
const cls = `bg-${color}-500`;            // purge됨

// ✅ 전체 클래스 이름 명시
const cls = isActive ? 'bg-amber-500' : 'bg-zinc-800';

// ✅ cn() 헬퍼 활용
import { cn } from '@/shared/lib/cn';
<div className={cn('rounded-xl p-4', isActive && 'bg-amber-500 ring-2')} />
```

---

## 🟡 MEDIUM — `/api/interpret` fallback 없으면 UI 완전 중단

```typescript
// src/app/api/interpret/route.ts — 항상 fallback 포함
export async function POST(req: Request) {
  const body = await req.json();
  const result = interpretRequestSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { success: false, fallbackMessage: '입력을 이해하지 못했어요.' },
      { status: 200 }  // ← 200으로 반환 (UI가 에러 처리하도록)
    );
  }

  const command = ruleBasedInterpreter(result.data);
  return Response.json({ success: true, command });
}
```

---

## 🟡 MEDIUM — GLTF 모델 없을 때 3D 씬 빈 화면

**2단계 전략:**

```typescript
// 1단계: 모델 준비 전 (개발용 placeholder)
export function DripperModel() {
  return (
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.3, 0.5, 0.8, 32]} />
      <meshStandardMaterial color="#c8a882" />
    </mesh>
  );
}

// 2단계: 모델 준비 후 (파일 교체만으로 전환)
export function DripperModel() {
  const { scene } = useGLTF('/models/coffee/dripper.glb');
  return <primitive object={scene} />;
}
useGLTF.preload('/models/coffee/dripper.glb');
```

---

## 🟢 LOW — ESLint + Next.js 기본 설정

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-restricted-exports": ["error", {
      "restrictDefaultExports": { "direct": true }
    }]
  }
}
```

---

## 🟢 LOW — Vercel Serverless 타임아웃 (AI 연결 시)

```typescript
// src/app/api/interpret/route.ts
export const maxDuration = 30;
export const dynamic = 'force-dynamic';
```

---

## 빠른 참조: Phase별 주의 사항

| Phase | 주의 사항 |
|-------|----------|
| 1 | `tsc --noEmit` 통과 후 다음 Phase 이동 |
| 2 | 외부 입력엔 Zod+z.infer<>, 내부 도메인엔 interface |
| 3 | R3F → `dynamic({ ssr: false })` 확정 적용 |
| 3 | 3D 모델 없으면 geometry placeholder로 먼저 구현 |
| 4 | Tailwind 동적 클래스 전체 이름 명시 |
| 5 | Zustand store는 'use client' 컴포넌트 안에서만 호출 |
| 6 | Antigravity Mission P6-B로 `npm run build` 자동 검증 |
| 6 | Vercel 환경변수(AI_PROVIDER_API_KEY 등) 배포 전 설정 |

---

## 개발 시작 직전 체크리스트

```
□ Node.js v18+ 확인
□ .env.local 파일 생성 (.env.example 복사)
□ npm install 완료
□ npx tsc --noEmit → 0 errors
□ npm run dev → localhost:3000 접속 가능
□ .github/workflows/ci.yml 생성 확인
□ Cursor에서 .cursor/rules/ 파일 로드 확인
□ AGENTS.md 경로 일치 확인
```

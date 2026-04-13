# AGENTS.md — TUTOLA (Antigravity Persistent Instructions)

## Project Context

TUTOLA is a Multi-Scenario Lifestyle & Hobby Coaching Platform.
Stack: **Next.js App Router · TypeScript · Tailwind CSS · React Three Fiber · Zod · Zustand**

This file provides persistent instructions for **Antigravity** across all sessions.
Cursor handles structure and logic. Antigravity handles mission-based implementation and browser verification.

---

## Project Location

```
c:\Users\lesj2\prac\project\tutola\
```

Dev server runs at: `http://localhost:3000`

---

## Antigravity Core Responsibilities

1. **Mission-based implementation** — implement a clearly scoped feature end-to-end
2. **Browser verification** — always validate working behavior in the browser
3. **Artifact production** — save screenshots, recordings, and task logs per mission
4. **Regression spot-checking** — verify nothing broke after Cursor's changes

---

## Mission Execution Protocol

Every Antigravity mission MUST follow this structure:

```
1. Read task context (AGENTS.md, task.md, antigravity-missions.md)
2. Implement the scoped change (editor / terminal as needed)
3. Run dev server (npm run dev) if not already running
4. Open browser → verify behavior against Success Criteria
5. Capture screenshot or recording artifact
6. Update task.md with [x] for completed items
7. Report result with artifact reference
```

**베드 검증 (Mission P6-B에서만):**
```
npm run build 실행
  └─ 성공 → npm start 실행 → 브라우저 검증
  └─ 실패 → 에러 캐하 + 스크린샷 → Cursor에 보고 → 수정 대기
```

---

## Verification Checklist (per mission)

Before marking a mission done, confirm:

**모든 미션 공통:**
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] Target page/route renders without crash in browser
- [ ] Core interaction works as described in Success Criteria
- [ ] Screenshot or recording saved to artifacts directory
- [ ] `task.md` updated

**Mission P6-B 추가:**
- [ ] `npm run build` 성공 (exit code 0)
- [ ] production 서버에서 3개 시나리오 접속 가능
- [ ] 3D CoffeeViewer dynamic import 정상 로딩 (SSR 충돌 없음)

---

## Architecture Constraints (Non-Negotiable)

| Rule | Detail |
|------|--------|
| Framework | Next.js App Router only |
| Language | TypeScript strict mode, `any` is forbidden |
| Styling | Tailwind CSS only (no CSS-in-JS, no plain CSS unless Tailwind is insufficient) |
| State | Zustand for scenario state, React state for local UI only |
| Validation | Zod for all external input (forms, API responses, command output) |
| 3D | React Three Fiber + drei, always `'use client'` + `dynamic({ ssr: false })` |
| AI Layer | Adapter pattern — never call LLM directly from UI or domain layer |
| Exports | No default exports. Named exports only. |
| any | Absolutely forbidden. Use `unknown` + type guard if needed. |

---

## Routing Structure

```
/             → Landing / Scenario Selection
/coffee       → Coffee Brewing Scenario
/laundry      → Laundry Scenario
/cooking      → Cooking Scenario
/api/interpret → Natural language → Command endpoint
```

---

## Folder Conventions

```
src/
  app/               ← Next.js routes only, no business logic
  features/
    scenario-engine/ ← Shared domain/application logic
    coffee/
    laundry/
    cooking/
  shared/            ← Reusable components, hooks, utils
  server/            ← Server-side services, validators, AI adapter
```

**Never mix domain logic into `app/` or UI components.**

---

## LLM / AI Layer

- AI calls go through `src/server/services/aiAdapter.ts` only
- Input/output must be validated with Zod before use
- Always implement a deterministic fallback
- Environment variable: `AI_PROVIDER_API_KEY` (set in `.env.local`)
- Do not call AI from client components directly

---

## 3D Model Convention

- Coffee 3D models are GLTF format, stored in `public/models/coffee/`
- Use `useGLTF` from `@react-three/drei` for loading
- Always preload with `useGLTF.preload()`
- Camera presets are defined in `features/coffee/ui/CoffeeViewer/cameraPresets.ts`

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| File | Role-based kebab-case | `buildCoffeePlan.ts` |
| Component | PascalCase | `StepCard.tsx` |
| Hook | camelCase + `use` prefix | `useScenarioEngine.ts` |
| Boolean | `is/has/can/should` prefix | `isStepComplete` |
| Handler | `handle` prefix | `handleStepSelect` |
| Pure transformer | `to/build/create/map` prefix | `buildLaundryPlan` |
| Validator | `validate` prefix or schema name | `validateCommand` |

---

## Prohibited Patterns

- `export default` — use named exports
- `any` type — use `unknown` + narrowing
- Inline anonymous business logic in JSX
- Business logic inside `app/` route files
- `useEffect` for data derivation (use `useMemo` or computed values)
- Importing server-only modules in client components

---

## Key Artifacts Directory

```
C:\Users\lesj2\.gemini\antigravity\brain\cc90cb15-18e5-4125-a6f8-4a67489244d0\
  implementation_plan.md
  task.md
  walkthrough.md
```

---

## i18n Note

- MVP: Korean UI only (hardcoded strings are acceptable for now)
- Future: i18n support will be added — do NOT hardcode strings in a way that makes extraction difficult
- Preferred pattern: group UI strings in a `messages` const at the top of the file for easy future migration

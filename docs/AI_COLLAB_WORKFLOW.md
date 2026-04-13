# AI_COLLAB_WORKFLOW.md — AI Collaboration Workflow

> 이 문서는 TUTOLA 개발 전반에서 **AI 도구를 어떻게 사용했는지**를 기록한다.
> "AI를 썼다"가 아니라 **"AI와 어떤 구조로 일했는지"**를 보여주기 위한 문서다.

---

## 1. 역할 분담 원칙

```
인간 (사람)
  ├── 제품 방향 결정 (PRD)
  ├── 기술 스택 결정
  ├── 심사 기준 해석 및 전략 수립
  ├── 최종 검토 및 배포 승인
  └── AI 결과물 리뷰 및 거부권

Cursor (Editor AI)
  ├── 프로젝트 스캐폴딩
  ├── 타입 / 스키마 / 도메인 모델 구현
  ├── 공통 엔진 로직 (plan builder, command handler)
  ├── UI 컴포넌트 작성
  ├── 리팩터링
  └── 단위 테스트 작성

Antigravity (Agent AI)
  ├── Mission 단위 구현 (editor + terminal + browser)
  ├── 브라우저 동작 검증
  ├── 스크린샷 / 녹화 아티팩트 생성
  ├── 배포 스크립트 실행
  └── Regression 점검
```

---

## 2. 전체 개발 흐름

```
Phase 0: 기획 (인간)
  PRD 작성 → 심사 기준 해석 → 기술 결정
      ↓
Phase 1: 구조 설계 (인간 + Cursor + Antigravity)
  SCHEMA.md 작성 → 폴더 구조 생성 → AGENTS.md / .cursor/rules 생성
      ↓
Phase 2: 공통 엔진 (Cursor)
  BaseScenario 타입 → Step / Command 모델 → Zod schema → 재계산 엔진
      ↓
Phase 3: Coffee 시나리오 (Cursor → Antigravity 검증)
  도메인 구현 → 3D 뷰어 → 패널 → Antigravity 브라우저 검증
      ↓
Phase 4: Laundry 시나리오 (Cursor → Antigravity 검증)
Phase 5: Cooking 시나리오 (Cursor → Antigravity 검증)
      ↓
Phase 6: QA & 배포 (Antigravity 주도)
  E2E 브라우저 검증 → 스크린샷 아티팩트 → Vercel 배포
```

---

## 3. Cursor 협업 방식

### 규칙 기반 지속 지침

Cursor는 `.cursor/rules/` 아래의 `.mdc` 파일들을 참조해 작업한다.

| 파일 | 역할 |
|------|------|
| `architecture.mdc` | 폴더 구조, 레이어 경계, AI Adapter 패턴 |
| `typescript.mdc` | `any` 금지, Zod 필수, discriminated union |
| `ui.mdc` | Server/Client 분리, Tailwind, R3F 3D 패턴 |
| `testing.mdc` | 필수 테스트 대상, 브라우저 검증 기준 |

### Cursor 작업 원칙

1. **한 번에 전체 앱 생성 금지** — feature/레이어 단위로 분할
2. **각 작업 후 앱이 runnable 상태** — `npm run dev` + `tsc --noEmit` 통과
3. **구조 먼저, UI 나중** — 타입 → 로직 → 컴포넌트 순서
4. **규칙 파일을 항상 참고** — 임의 패턴 도입 금지

---

## 4. Antigravity 협업 방식

### AGENTS.md 기반 영속 지침

Antigravity는 `AGENTS.md`를 통해 프로젝트 컨텍스트, 미션 원칙, 검증 절차를 이해한다.

### Antigravity Mission 구조

모든 Antigravity 미션은 다음 형식을 따른다:

```
Mission: [미션 제목]
Goal: [명확한 단일 목표]
Scope: [변경 범위]
Success Criteria:
  - [ ] [검증 항목 1]
  - [ ] [검증 항목 2]
Artifacts:
  - screenshot: [파일명]
  - recording: [파일명]
```

### Antigravity 실행 프로토콜

```
1. AGENTS.md + task.md 읽기
2. 구현 (editor / terminal / browser 병행)
3. npm run dev 실행
4. 브라우저 열기 → 동작 검증
5. 스크린샷 / recording 저장
6. task.md 업데이트 ([/] → [x])
7. 결과 리포트 + 아티팩트 참조
```

---

## 5. 아티팩트 규칙

모든 AI 도구가 생성하는 결과물은 아래 기준으로 저장한다.

| 아티팩트 종류 | 저장 위치 | 생성 주체 |
|-------------|----------|----------|
| `implementation_plan.md` | `.antigravity/` | Antigravity |
| `task.md` | `.antigravity/` | Antigravity |
| `walkthrough.md` | `.antigravity/` | Antigravity |
| 스크린샷 (`.webp`) | `.antigravity/screenshots/` | Antigravity |
| 브라우저 녹화 (`.webp`) | `.antigravity/recordings/` | Antigravity |
| `.cursor/rules/*.mdc` | `.cursor/rules/` | 인간 + Antigravity |
| `AGENTS.md` | 루트 | 인간 + Antigravity |

---

## 6. 품질 게이트 (Quality Gates)

각 Phase 완료 전 아래를 통과해야 다음 Phase로 진행한다.

### Gate 1 — TypeScript
```bash
npx tsc --noEmit
# ✅ 0 errors
```

### Gate 2 — Lint
```bash
npx eslint src/ --ext .ts,.tsx
# ✅ 0 errors, 0 warnings
```

### Gate 3 — 단위 테스트
```bash
npx vitest run
# ✅ All tests pass
```

### Gate 4 — 브라우저 검증 (Antigravity)
```
- [ ] 대상 페이지가 오류 없이 렌더링됨
- [ ] 핵심 인터랙션이 동작함
- [ ] 스크린샷이 저장됨
```

### Gate 5 — 빌드 (배포 전)
```bash
npm run build
# ✅ Build succeeds
```

---

## 7. AI 프롬프트 품질 원칙

1. **의도를 명시한다** — "navbar를 만들어"가 아니라 "커피 시나리오 내비게이터 컴포넌트를 만들어. step list와 view control을 포함한다"
2. **범위를 제한한다** — 한 번에 하나의 파일/기능 단위
3. **기준을 참조한다** — "SCHEMA.md의 CoffeeState 타입을 사용해"
4. **완료 기준을 명시한다** — "tsc --noEmit 통과, vitest run 통과 후 완료"
5. **실패 처리를 요구한다** — "Zod 검증 실패 시 fallback 처리 포함"

---

## 8. AI 도구별 특성 활용 요약

| 특성 | Cursor | Antigravity |
|------|--------|-------------|
| 강점 | 코드 편집, 타입 추론, 리팩터링 | 브라우저 조작, 멀티스텝 실행, 아티팩트 생성 |
| 지속 지침 | `.cursor/rules/*.mdc` | `AGENTS.md` |
| 검증 방식 | 코드 리뷰, tsc, lint | 브라우저 렌더링, 스크린샷, recording |
| 아티팩트 | 코드 파일 | 스크린샷, 영상, 계획 문서 |
| 적합한 작업 | 반복적 코드 생성 | 통합 검증, 배포, E2E |

---

## 9. 배포 파이프라인 & AI 검증 시퀀스

```
[Cursor] 기능 구현 완료
    ↓
[Cursor] npx tsc --noEmit       ← Gate 1
[Cursor] npx eslint src/        ← Gate 2
[Cursor] npx vitest run         ← Gate 3
    ↓
[Antigravity] Mission 실행      ← Gate 4 (브라우저 검증)
  - npm run dev 확인
  - 브라우저에서 기능 동작 확인
  - 스크린샷 저장
    ↓
    ┌─ 이슈 발견 시 ────────────────────────────────────────┐
    │ [Antigravity] 이슈 보고 (스크린샷 + 재현 경로)         │
    │ [Cursor] 수정                                          │
    │ [Cursor] tsc + lint + test 재통과                     │
    │ [Antigravity] 재검증                                   │
    └───────────────────────────────────────────────────────┘
    ↓
[Antigravity] npm run build     ← Gate 5
  - 빌드 성공 확인
  - 번들 크기 이상 여부 확인
    ↓
[인간] Vercel 배포 승인
    ↓
[Antigravity] Mission P6-C 실행 ← Gate 6 (배포 후 E2E)
  - Vercel URL에서 전체 플로우 검증
  - 모바일 뷰포트 확인
  - 콘솔 + 네트워크 오류 확인
  - walkthrough.md 업데이트
```

---

## 10. Regression 체크리스트

Cursor가 새 Phase를 완료한 후 **Antigravity가 기존 기능 깨짐을 확인한다.**

### Phase 3 완료 후 (Coffee 구현)
- [ ] `/` 랜딩 페이지 정상 렌더링
- [ ] `/coffee` 페이지 정상 렌더링

### Phase 4 완료 후 (Laundry 추가)
- [ ] `/coffee` → 계획 생성 여전히 동작
- [ ] `/laundry` → 경고 출력 동작
- [ ] `npx vitest run` 전체 통과

### Phase 5 완료 후 (Cooking 추가)
- [ ] `/coffee` → 계획 생성 여전히 동작
- [ ] `/laundry` → 경고 출력 여전히 동작
- [ ] `/cooking` → 인분 조정 동작
- [ ] `npx vitest run` 전체 통과
- [ ] `npx tsc --noEmit` 0 errors

### Phase 6 전체 Regression
- [ ] 3개 시나리오 전체 플로우 동작
- [ ] command interpreter fallback 동작
- [ ] 모바일 레이아웃 깨짐 없음
- [ ] `npm run build` 성공

---

## 11. 개발 시작 직전 체크리스트

```
□ Node.js v18+ 확인
□ .env.local 파일 생성 (.env.example 복사)
□ npm install 완료
□ npx tsc --noEmit → 0 errors
□ npm run dev → localhost:3000 접속 가능
□ Cursor에서 .cursor/rules/ 파일 로드 확인
□ AGENTS.md 경로 일치 확인 (c:\Users\lesj2\prac\project\tutola\)
□ docs/DEV_RISK_ANALYSIS.md 읽기 (Phase별 주의사항 숙지)
```


# JUDGING_CHECKLIST.md — Contest Judging Checklist

> 이 문서는 **차세대 교육 서비스 솔루션** 콘테스트의 심사 기준을 기반으로,
> 제출 전 자가 점검에 사용하는 체크리스트다.

---

## 심사 기준 요약

| 기준 | 비중 |
|------|------|
| 기술적 완성도 | 높음 |
| AI 활용 능력 및 효율성 | 높음 |
| 기획력 및 실무 적합성 | 높음 |
| 창의성 및 확장 가능성 | 중간 |

---

## 1. 기술적 완성도

### 1.1 TypeScript 품질

- [ ] `strict: true` 설정 확인
- [ ] `any` 타입 사용 없음 (`grep -r ": any" src/`)
- [ ] `noImplicitAny: true` 설정
- [ ] `npx tsc --noEmit` 통과 (0 errors)
- [ ] 모든 외부 입력에 Zod 검증 적용

### 1.2 Next.js 구조

- [ ] App Router 사용 (pages/ 없음)
- [ ] Server Component 우선 (불필요한 `'use client'` 없음)
- [ ] React Three Fiber 컴포넌트에 `dynamic({ ssr: false })` 적용
- [ ] `src/` 기반 폴더 구조 준수
- [ ] `export default` 사용 없음

### 1.3 Clean Code

- [ ] 파일당 하나의 주 책임
- [ ] magic string / magic number 없음 (`shared/constants/` 사용)
- [ ] domain 로직과 UI 로직 분리
- [ ] 함수명이 의도를 드러냄 (`buildX`, `toX`, `validateX`)

### 1.4 테스트

- [ ] `npx vitest run` 통과
- [ ] `buildCoffeePlan` 단위 테스트 존재
- [ ] `buildLaundryPlan` + `generateWarnings` 단위 테스트 존재
- [ ] `adjustServings` + `substituteIngredient` 단위 테스트 존재
- [ ] `commandInterpreter` 단위 테스트 존재

### 1.5 빌드 & 배포

- [ ] `npm run build` 성공
- [ ] Vercel 배포 링크 동작
- [ ] 브라우저 콘솔에 404 / JS 오류 없음

---

## 2. AI 활용 능력 및 효율성

### 2.1 AI 협업 문서 존재 여부

- [ ] `AGENTS.md` 루트에 존재
- [ ] `.cursor/rules/architecture.mdc` 존재
- [ ] `.cursor/rules/typescript.mdc` 존재
- [ ] `.cursor/rules/ui.mdc` 존재
- [ ] `.cursor/rules/testing.mdc` 존재
- [ ] `docs/AI_COLLAB_WORKFLOW.md` 존재
- [ ] `docs/PROMPT_STRATEGY.md` 존재
- [ ] `docs/AI_DOCS_INDEX.md` 존재

### 2.2 AI 협업 구조 증거

- [ ] Cursor 역할과 Antigravity 역할이 명확히 분리되어 문서화됨
- [ ] 품질 게이트가 명시되어 있음 (AI가 임의로 규칙을 어기지 못하도록)
- [ ] Antigravity 브라우저 검증 스크린샷 또는 recording 존재
- [ ] `task.md` 또는 `walkthrough.md` 등 AI 작업 흔적 문서 존재

### 2.3 AI 활용 효율성

- [ ] 프롬프트 전략이 문서화됨 (`PROMPT_STRATEGY.md`)
- [ ] AI가 생성한 코드에 구조적 일관성이 있음 (규칙 파일이 실제 코드에 반영됨)
- [ ] AI 출력이 항상 검증 단계를 거침 (Zod, tsc, lint, 브라우저)

---

## 3. 기획력 및 실무 적합성

### 3.1 교육 현장 적합성

- [ ] `docs/EDU_ALIGNMENT.md`에 교육 서비스 연결 논리 존재
- [ ] 교육 현장 혁신 (조건 맞춤 계획, Drill-Down, Warning) 구현됨
- [ ] 운영 행정 혁신 (ProgressEvent 기록) 구조가 코드에 반영됨
- [ ] 수강생 경험 혁신 (AI 코치 말투, 자연어 명령) 동작

### 3.2 비즈니스 모델 명확성

- [ ] B2C / B2B / B2B2C 모델이 문서에 설명됨
- [ ] 확장 로드맵이 존재함

### 3.3 PRD 완성도

- [ ] `docs/PRD.md` 또는 루트 `PRD.md` 존재
- [ ] 기능 요구사항이 명확히 정의됨
- [ ] Non-Goal이 명시됨
- [ ] MVP 성공 기준이 구체적으로 정의됨

---

## 4. 창의성 및 확장 가능성

### 4.1 창의적 요소

- [ ] 생활/취미 도메인을 교육 플랫폼으로 재해석한 접근이 설명됨
- [ ] 3D + planner + adaptive engine 혼합 구조가 차별점으로 제시됨
- [ ] AI 코치형 인터랙션이 기존 튜토리얼과 다른 점이 명확함

### 4.2 확장 가능성

- [ ] 공통 시나리오 엔진이 새 도메인 추가 시 재사용 가능한 구조
- [ ] AI Adapter가 추상화되어 LLM 교체 가능
- [ ] Course / Module / Cohort / AssessmentRecord 타입이 미래 확장을 대비해 설계됨

---

## 5. 데모 시연

### 5.1 기본 플로우

- [ ] 랜딩 → 시나리오 선택 → 시나리오 진입 플로우 동작
- [ ] Coffee: 조건 입력 → 계획 생성 → 3D 뷰 전환 → Drill-Down 동작
- [ ] Laundry: 조건 입력 → 계획 생성 → 경고 출력 동작
- [ ] Cooking: 인분 조정 → 재료 재계산 → 재료 대체 동작

### 5.2 AI 코치 기능

- [ ] 자연어 입력 → command 변환 → UI 상태 변경 동작
- [ ] fallback 처리 동작 (인식 불가 입력 시)

### 5.3 시연 안정성

- [ ] 시연 도중 JS 에러 없음
- [ ] 모바일/태블릿 레이아웃 깨짐 없음
- [ ] 배포 환경에서 3D 로딩 완료

---

## 6. 제출 직전 최종 점검

```
□ Vercel 배포 URL 동작 확인
□ GitHub 저장소 공개 설정 확인
□ README.md에 배포 링크 + 문서 링크 포함
□ docs/ 폴더 전체 커밋 확인
□ AGENTS.md + .cursor/rules/ 커밋 확인
□ 브라우저 스크린샷 / 데모 영상 준비
□ 발표 자료에 AI 협업 워크플로우 포함
□ 심사 제출 항목 체크리스트와 대조
```

---

## 점검 결과 기록

| 카테고리 | 상태 | 비고 |
|---------|------|------|
| 기술적 완성도 | ⬜ 미점검 | |
| AI 활용 능력 | ⬜ 미점검 | |
| 기획력/실무 | ⬜ 미점검 | |
| 창의성 | ⬜ 미점검 | |
| 데모 시연 | ⬜ 미점검 | |
| 최종 제출 | ⬜ 미점검 | |

> ✅ 완료 | ⚠️ 부분 완료 | ❌ 미완료 | ⬜ 미점검

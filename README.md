# TUTOLA

**Multi-Scenario Adaptive Skill Coaching Platform**
생활·취미 실습 시나리오를 기반으로 한 AI 코치형 교육 서비스

> 🎓 차세대 교육 서비스 솔루션 콘테스트 출품작

---

## 배포 링크

| 환경 | URL |
|------|-----|
| Production | `(Vercel 배포 후 업데이트)` |
| Preview | `(PR 배포 링크)` |

---

## 제품 소개

TUTOLA는 커피 브루잉, 세탁, 요리처럼 실생활에 밀착한 작업 시나리오를 소재로,
**학습자의 현재 조건에 맞는 실행 계획을 동적으로 생성하고 단계별 코칭을 제공하는 AI 기반 실습형 교육 플랫폼**이다.

### 핵심 기능

| 기능 | 설명 |
|------|------|
| **조건 맞춤 계획 생성** | 보유 도구·재료·환경에 따라 개인화된 실습 계획 |
| **단계별 Drill-Down** | 막힌 단계를 더 세밀한 하위 단계로 분해 |
| **AI 코치 채팅** | 자연어로 "이 단계 다시 설명해줘" → 즉각 응답 |
| **3D 시각화 (커피)** | 브루잉 과정의 3D 시점 전환으로 공간적 이해 |
| **경고 & 대체** | 잘못된 조합 사전 경고 + 재료/도구 대체 안내 |

### 지원 시나리오

- ☕ **Coffee Brewing** — 핸드드립 브루잉 단계 코칭 + 3D 뷰어
- 👕 **Laundry** — 세탁물 조건 기반 세탁 계획 + 옷감/오염도 맞춤 동적 경고 플랜
- 🍳 **Cooking** — 재료·인분·손질 상태 기반 AI 동적 조리 계획 (OpenAI + Claude 연동)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| 3D | React Three Fiber + drei |
| State | Zustand |
| Validation | Zod |
| AI Layer | Vercel AI SDK (OpenAI, Anthropic) |
| Database | Prisma + PostgreSQL |
| Deployment | Vercel |

---

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 아래 내용 필수 입력:
# DATABASE_URL="..."
# DIRECT_URL="..."
# OPENAI_API_KEY="..."
# ANTHROPIC_API_KEY="..."

# 개발 서버 실행
npm run dev

# 타입 검사
npx tsc --noEmit

# 테스트 실행
npx vitest run
```

---

## 프로젝트 구조

```
src/
  app/               ← Next.js App Router 라우트
  features/
    scenario-engine/ ← 공통 시나리오 엔진
    coffee/          ← 커피 브루잉 도메인
    laundry/         ← 세탁 도메인
    cooking/         ← 요리 도메인
  shared/            ← 공통 컴포넌트·유틸
  server/            ← 서버 전용 서비스·DB·AI 연동
```

---

## 문서

### 제품 & 기술

| 문서 | 설명 |
|------|------|
| [PRD.md](./docs/PRD.md) | 제품 요구사항 문서 |
| [SCHEMA.md](./docs/SCHEMA.md) | 도메인 타입 소스 오브 트루스 |
| [EDU_ALIGNMENT.md](./docs/EDU_ALIGNMENT.md) | 교육 서비스 연결 논리 및 비즈니스 모델 |

### AI 협업

| 문서 | 설명 |
|------|------|
| [AGENTS.md](./AGENTS.md) | Antigravity 영속 지침 |
| [AI_DOCS_INDEX.md](./docs/AI_DOCS_INDEX.md) | AI 협업 문서 전체 인덱스 |
| [AI_COLLAB_WORKFLOW.md](./docs/AI_COLLAB_WORKFLOW.md) | AI 역할 분담 및 협업 흐름 |
| [PROMPT_STRATEGY.md](./docs/PROMPT_STRATEGY.md) | Cursor·Antigravity 프롬프트 가이드 |
| [NEXT_STEPS_AI_INTEGRATION.md](./docs/NEXT_STEPS_AI_INTEGRATION.md) | AI 연동 이후 확장 계획 및 구조 |

### 품질 관리

| 문서 | 설명 |
|------|------|
| [JUDGING_CHECKLIST.md](./docs/JUDGING_CHECKLIST.md) | 심사 기준 자가 점검 체크리스트 |
| [.cursor/rules/](./cursor/rules/) | Cursor 작업 규칙 (architecture, typescript, ui, testing) |

---

## AI 협업 방식

이 프로젝트는 **Cursor**와 **Antigravity** 두 AI 도구를 구조적으로 활용해 개발했다.

```
인간 → PRD 작성, 기술 결정, 최종 검토
Cursor → 타입/로직/컴포넌트 구현, 리팩터링
Antigravity → 브라우저 검증, 배포, E2E 아티팩트 생성
```

자세한 내용: [AI_COLLAB_WORKFLOW.md](./docs/AI_COLLAB_WORKFLOW.md)

---

## 개발 Phase 진행 현황

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | Foundation (스캐폴딩, 타입, 설정) | ✅ |
| 2 | 공통 시나리오 엔진 | ✅ |
| 3 | Coffee 시나리오 + 3D 뷰어 | ✅ |
| 4 | Laundry 시나리오 | ✅ |
| 5 | Cooking 시나리오 + AI 파이프라인 연동 | ✅ |
| 6 | QA & 배포 | 🚧 |

---

## 라이선스

MIT

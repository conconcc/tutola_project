# AI_DOCS_INDEX.md — AI Collaboration Documents Index

> TUTOLA 프로젝트에서 AI 도구와의 협업 흔적을 남기기 위한 문서 세트 인덱스.
> 심사자와 팀원 모두 이 파일에서 시작해 원하는 문서로 이동할 수 있다.

---

## 문서 구조 한눈에 보기

```
tutola/
  AGENTS.md                          ← Antigravity 영속 지침
  .env.example                       ← 환경변수 템플릿
  .cursor/
    rules/
      architecture.mdc               ← Cursor: 폴더/레이어 경계
      typescript.mdc                 ← Cursor: TypeScript strict 규칙
      ui.mdc                         ← Cursor: 컴포넌트/3D/Tailwind 규칙
      testing.mdc                    ← Cursor: 테스트 대상 및 기준
  src/
    lib/
      promptLoader.ts                ← 서버 사이드 프롬프트 파일 로더
    prompts/
      ingredient-analyzer/
        v1.0.0.txt                   ← Claude Haiku 재료 분석 시스템 프롬프트
      adaptive-plan/
        v1.0.0.txt                   ← Claude Sonnet 적응형 플랜 시스템 프롬프트
  docs/
    PRD.md                           ← 제품 요구사항 문서
    SCHEMA.md                        ← 도메인 타입 소스 오브 트루스
    EDU_ALIGNMENT.md                 ← 교육 서비스 연결 논리
    AI_COLLAB_WORKFLOW.md            ← AI 협업 방식 및 역할 분담
    JUDGING_CHECKLIST.md             ← 심사 기준 자가 점검
    OPS_HANDOFF_CHECKLIST.md         ← 운영 핸드오프 체크리스트
    SECURITY_OWASP_CHECKLIST.md      ← OWASP 보안 체크리스트
    DEV_RISK_ANALYSIS.md             ← 개발 중 위험 요소 분석 및 선제 대응
    DB_RECOMMENDATION.md             ← DB 선택 추천 및 근거
    NEXT_STEPS_AI_INTEGRATION.md     ← AI 연동 다음 단계 로드맵
    Landing-Page-Search-Logic.md     ← 랜딩 페이지 검색 로직 설계
    Profile-Spec.md                  ← 프로필 페이지 명세
    antigravity-missions.md          ← Phase별 Antigravity 미션 명세
    PROMPT_STRATEGY.md               ← Cursor/Antigravity 프롬프트 가이드 (개발 AI용)
    PROMPT_STRATEGY_AI_INTEGRATION.md ← 서비스 내 AI 모델 프롬프트 전략 명세
    claude_prompt_architecture.md    ← Claude 2-Step 파이프라인 설계 참조 (※ Spring Boot 예시, Next.js 실제 구현과 다름)
    AI_DOCS_INDEX.md                 ← 이 파일 (인덱스)
```

---

## 문서별 목적 요약

| 문서 | 대상 독자 | 핵심 내용 |
|------|----------|----------|
| `AGENTS.md` | Antigravity | 프로젝트 컨텍스트, 미션 원칙, 검증 절차 |
| `architecture.mdc` | Cursor | 폴더 구조, 레이어 경계, 모듈 룰 |
| `typescript.mdc` | Cursor | any 금지, Zod 패턴, 타입 설계 |
| `ui.mdc` | Cursor | Server/Client 분리, Tailwind, R3F |
| `testing.mdc` | Cursor | 필수 테스트 대상, 커버리지 기준 |
| `PRD.md` | 전체 | 제품 목표, 기능 요구사항, Non-Goal |
| `SCHEMA.md` | 전체 | 도메인 타입, Zod 원칙, DTO 경계 |
| `EDU_ALIGNMENT.md` | 심사자, 기획자 | 교육 서비스 연결, 비즈니스 모델 |
| `AI_COLLAB_WORKFLOW.md` | 심사자, 팀원 | AI 역할 분담, 품질 게이트, 흐름 |
| `JUDGING_CHECKLIST.md` | 팀원 | 제출 전 자가 점검 |
| `PROMPT_STRATEGY.md` | 팀원, 심사자 | Cursor/Antigravity 지시 방식, 프롬프트 예시 |
| `PROMPT_STRATEGY_AI_INTEGRATION.md` | 팀원, 심사자 | 서비스 AI 모델(Haiku/Sonnet) 프롬프트 전략 |
| `claude_prompt_architecture.md` | 팀원 | 2-Step AI 파이프라인 설계 참조 (Spring Boot 예시) |
| `DEV_RISK_ANALYSIS.md` | 팀원 | 개발 위험 요소 및 선제 대응 방안 |
| `SECURITY_OWASP_CHECKLIST.md` | 팀원 | OWASP Top 10 보안 체크리스트 |

---

## 프롬프트 파일 위치 (런타임 사용)

> `src/prompts/`는 문서가 아닌 **런타임 AI 시스템 프롬프트** 파일 디렉토리입니다.

| 파일 | 사용 API | 모델 |
|------|---------|------|
| `src/prompts/ingredient-analyzer/v1.0.0.txt` | `POST /api/ingredients` | `claude-haiku-4-5-20251001` |
| `src/prompts/adaptive-plan/v1.0.0.txt` | `POST /api/plan` (cooking) | `claude-sonnet-4-6` |

버전 변경 시 `src/prompts/{name}/v{x}.{y}.{z}.txt` 형태로 추가하면 됩니다.

---

## 용도별 빠른 참조

### 개발을 시작할 때
1. `AGENTS.md` — Antigravity 작업 전 필독
2. `.cursor/rules/*.mdc` — Cursor 작업 전 자동 로드
3. `SCHEMA.md` — 타입 설계 시 참조

### 기능을 구현할 때
1. `SCHEMA.md` → 관련 타입 확인
2. `PROMPT_STRATEGY.md` → 적절한 프롬프트 선택
3. `AI_COLLAB_WORKFLOW.md` → 품질 게이트 확인

### 제출 전 점검할 때
1. `JUDGING_CHECKLIST.md` → 전체 체크리스트 순서대로
2. `EDU_ALIGNMENT.md` → 교육 서비스 논리 재확인
3. `AI_COLLAB_WORKFLOW.md` → AI 협업 흔적 확인

### 심사자가 보고 싶은 것
1. `AI_COLLAB_WORKFLOW.md` — AI와 어떻게 일했는지
2. `PROMPT_STRATEGY.md` + `PROMPT_STRATEGY_AI_INTEGRATION.md` — 프롬프트 전략
3. `EDU_ALIGNMENT.md` — 교육 서비스 논리
4. `SCHEMA.md` — 기술적 완성도의 증거

---

## 문서 최종 업데이트 기록

| 날짜 | 문서 | 변경 내용 |
|------|------|----------|
| 2026-04-09 | 전체 docs 세트 | 초기 생성 |
| 2026-04-13 | `AI_DOCS_INDEX.md` | 신규 파일 추가, 디렉토리 구조 실제 반영, src/prompts/ 섹션 추가 |
| 2026-04-13 | `claude_prompt_architecture.md` | Next.js 환경 주의사항 명기 |

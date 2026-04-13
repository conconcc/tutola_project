# PRD — TUTOLA
## Multi-Scenario Lifestyle & Hobby Coaching Platform

**문서 타입:** 개발용 실행 PRD  
**대상 도구:** Cursor / Antigravity  
**기술 스택:** Next.js (App Router) + TypeScript  

---

## 1. Product Summary

### 1.1 한 줄 정의
TUTOLA는 생활·취미 작업 시나리오(커피 브루잉, 빨래, 요리)를 사용자의 현재 상태와 보유 자원에 맞게 재구성하고, 단계별 계획과 시각 보조를 통해 실행을 돕는 멀티 시나리오 코칭 플랫폼이다.

### 1.2 제품 철학
이 제품은 "정답형 튜토리얼"이 아니다. 핵심은 아래 4가지다.

1. 상황 해석 (AI Ingredients)
2. 계획 재구성 (AI Adaptive Plan)
3. 단계 상세화 (Drill-Down / Real-time Hint)
4. 시각적 보조 (3D & Placeholders)

---

## 2. Product Goals

### 2.1 MVP 목표
- 하나의 공통 시나리오 엔진
- 커피 / 빨래 / 요리 3개 시나리오 지원
- 커피는 3D 시각화가 포함된 대표 데모
- 빨래와 요리는 계획 재구성 중심 + AI(OpenAI, Claude) 연동 데모
- 사용자 액션 기록 및 히스토리/프로필/탐색 탭 연동
- 웹에 배포 가능
- 클린 코드와 TypeScript strict 환경 준수 및 API 에러 폴백 처리

### 2.2 MVP 성공 기준
- [x] 사용자가 시나리오를 선택 및 탐색할 수 있다 (Discover/Search)
- [x] 사용자가 조건을 입력하면 시나리오별 맞춤형 계획이 동적으로 생성된다
- [x] 커피 시나리오에서 3D 시점 제어와 단계별 툴팁(Hint)이 렌더링된다
- [x] 빨래 시나리오에서 옷감 종류/무게에 따라 세제량과 세탁망 등 세탁 계획이 바뀐다
- [x] 요리 시나리오에서 요리 이름에 맞춘 AI 재료 분석과 사용자의 삭제/추가에 따른 동적 조리 플랜이 생성된다
- [x] 연습이 완료되면 템플릿 이름(커스텀) 저장 및 히스토리 연동이 가능하다
- [x] DB 연결 실패나 AI 키 부재 시에도 앱이 깨지지 않고 Mock 데이터를 반환한다 (완벽한 폴백)

---

## 3. Non-Goals (MVP)

- 로그인 / 회원가입 (현재 Mock User 사용)
- 결제 기능
- 비전 AI / 카메라 인식
- 음성 인식 (추후 Phase 3 확장 시 Gemini 보이스 챗봇으로 연동 예정)
- 모든 시나리오의 100% 3D 모델링 구현 (현재 공통 Placeholder 컴포넌트로 대응)

---

## 4. Core Scenarios

### 4.1 Scenario A — Coffee Brewing (대표 데모)
**입력:** 원두 종류(직접 입력), 물 양, 온도, 드리퍼 종류, 주전자 유무, 맛 강도  
**표현:** 3D viewer + 단계 패널 + 퀵 뷰 메뉴 + 핫스팟 툴팁  
**특징:** 3D 시점 전환(Front, Top, Side, Zoom), 단계별 맞춤 힌트, 도구 대체(주전자 유무) 안내

### 4.2 Scenario B — Laundry
**입력:** 옷 종류(텍스트 분석), 옷감, 세탁량(소/중/대), 오염도, 세탁기 종류  
**표현:** Placeholder 3D UI + 조건 맞춤 추천 플랜 패널 + 툴팁  
**특징:** 의류 키워드 분석(셔츠/니트/청바지)을 통한 애벌빨래 및 세탁망 추가, 무게별 세제량 안내

### 4.3 Scenario C — Cooking
**입력:** 요리 이름(자유 입력), 인분 수, 숙련도(초보/중수/고수) + **재료 커스텀(Ingredients 확인창)**  
**표현:** Placeholder 3D UI + AI Ingredients Checker + AI Adaptive Planner  
**특징:** OpenAI 활용 재료 리스트 추출(추가/삭제 반영), Claude 활용 순수 조리 과정 및 숙련도 맞춤형 AI 플랜 세분화

---

## 5. Functional Requirements

| ID | 기능 | Priority |
|----|------|----------|
| F-01 | 시나리오 탐색 및 검색 화면 (Discover/Search) | P0 |
| F-02 | 시나리오별 파라미터 입력 UI (Setup) | P0 |
| F-03 | AI Ingredients 추출 및 커스텀 로직 | P0 |
| F-04 | 공통 시나리오 엔진 및 AI Adaptive Plan 생성 | P0 |
| F-05 | 3D 모델 및 공통 Placeholder Fallback 처리 | P0 |
| F-06 | Practice 뷰 타이머 및 컨트롤 툴 (Prev/Next/Play) | P1 |
| F-07 | Coffee 3D Viewer 및 카메라 제어 (Camera View) | P0 |
| F-08 | Warning, Substitution 및 핫스팟 툴팁 안내 | P0 |
| F-09 | Practice 완료 모달 및 템플릿 저장 (History 연동) | P1 |
| F-10 | 프로필(Profile) 및 통계치(Total, Favorite) 요약 | P2 |

---

## 6. Technical Requirements

| 항목 | 결정 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS |
| 3D | React Three Fiber + drei |
| State | Zustand (시나리오, 히스토리 영속성) / React State |
| Validation | Zod |
| AI Layer | Vercel AI SDK (OpenAI gpt-4o-mini, Anthropic claude-3.5-sonnet) |
| Database | Prisma + PostgreSQL (Supabase/Neon Pooler 대응) |
| Deployment | Vercel |

---

## 7. Routing Structure

```
/                         → 홈 랜딩 / 통합 검색 바
/discover                 → 전체 시나리오 탐색 및 키워드/카테고리 필터링
/setup/[skillId]          → 시나리오별 파라미터 설정
/ingredients/[skillId]    → (요리 특화) AI 재료 추출 및 사용자 추가/삭제 확인
/plan/[skillId]           → (공통) AI 기반 맞춤 조리/세탁/브루잉 플랜 렌더링
/practice/[skillId]       → (공통) 실제 연습 타이머 / 3D 뷰어 / 동적 툴팁
/history                  → 내 연습 기록 리스트 및 북마크, 재시도(Retry)
/profile                  → 사용자 활동 요약 및 설정 메뉴
/api/scenarios            → (서버) 전체 시나리오 DB 폴백 조회
/api/search               → (서버) 검색어 기반 시나리오 매칭 API
/api/ingredients          → (서버/AI) 요리 이름 기반 OpenAI 재료 파싱 API
/api/plan                 → (서버/AI) Claude 기반 조리 단계 생성 API
```

---

## 8. Delivery Plan

| Phase | 내용 | 담당 | 진행 상황 |
|-------|------|------|----------|
| 1 | Foundation (스캐폴딩, 라우트, DB 설정) | Cursor | ✅ 완료 |
| 2 | 공통 시나리오 엔진 및 전역 스토어 | Cursor | ✅ 완료 |
| 3 | Coffee 시나리오 + 3D 제어 및 툴팁 | Cursor | ✅ 완료 |
| 4 | Laundry 시나리오 (무게/옷감 동적 연산) | Cursor | ✅ 완료 |
| 5 | Cooking 시나리오 + AI(OpenAI/Claude) 연동 파이프라인 | Cursor | ✅ 완료 |
| 6 | 통합 UI 완성 (History, Profile, Discover) 및 에러 방어 | Cursor | ✅ 완료 |
| 7 | QA & 배포 검증 (Antigravity Mission P6) | Antigravity | 🚧 대기 |

---

## 9. Acceptance Criteria

### Common & UI
- [x] Search Bar 및 Discover 탭에서 조건(비어있을 때 포함)에 맞춰 렌더링
- [x] History 탭에서 활성화 UI 및 시간/저장/Play 버튼 일렬 배치 적용
- [x] Profile 탭 통계치 정상 출력
- [x] 하단 BottomNav 대신 최상단 HeaderNav 적용

### Coffee
- [x] 3D scene 정상 로딩 및 로딩 중 Placeholder 대응
- [x] 햄버거 메뉴를 통한 top/front/side view 전환
- [x] 드리퍼 및 서버 핫스팟 클릭 시 툴팁(Hint) 출력
- [x] 원두 '직접 입력' 동적 인풋 및 주전자 유무에 따른 대체 단계 생성

### Laundry
- [x] 옷감 분석 (청바지, 니트, 셔츠 등 입력 시 분석)
- [x] 세탁망(Delicate), 애벌빨래(Pre-treat), 청바지 뒤집기 단계 동적 추가
- [x] 세탁량(Small/Med/Large)에 따른 세제량 및 총 예상 시간 재계산
- [x] 3D 에셋 대신 공통 Placeholder3D 컴포넌트 렌더링

### Cooking
- [x] 요리명, 인분, 숙련도 입력
- [x] OpenAI (`gpt-4o-mini`) API를 통해 깐깐한 JSON 재료 객체 반환
- [x] 재료 확인 화면에서 삭제/추가 반영 및 `sessionStorage` 임시 보관
- [x] Claude (`claude-3-5-sonnet`) API를 통해 플레이팅을 제외한 위험 방지 순수 스텝 동적 생성
- [x] API Key 누락 또는 서버 에러 시 즉시 임시(Mock) 데이터로 대응하여 화면 붕괴 방지

### Code Quality
- [x] Strict TypeScript 원칙 준수
- [x] Domain, Application, UI, Server API 레이어 분리
- [x] Zod 기반 엄격한 스키마 방어 및 Circuit Breaker 대비 `try-catch`

---

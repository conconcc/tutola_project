# TUTOLA: AI 연동 이후 넥스트 스텝 (Next Steps)

현재 백엔드 API (`/api/ingredients`, `/api/plan`) 설계 및 구현이 완료되었습니다. 
패키지 설치 및 환경 변수(`API KEY`) 세팅이 끝난 직후부터 진행해야 할 프론트엔드 및 시스템 통합 마일스톤을 재구성했습니다. (기존 PRD 및 Antigravity Missions 기준 반영)

---

## 🚀 Phase 1: 요리(Cooking) 시나리오 프론트엔드 AI 연동

### 1.1 `Ingredients` 확인 및 커스텀 페이지 신설
* **경로:** `src/app/ingredients/[skillId]/page.tsx` 생성
* **역할:** 
  * `setup`에서 넘어온 요리 이름(dishName)과 인분 수(servings)를 바탕으로 `/api/ingredients` (OpenAI) 호출.
  * 로딩 중일 때는 스켈레톤 UI 노출.
  * 응답받은 JSON 배열(마늘, 올리브오일 등)을 리스트로 렌더링.
  * **사용자 액션:** 없는 재료 체크해제(삭제), 추가하고 싶은 재료 텍스트 입력(추가).
  * 최종 확정 버튼 클릭 시 `/plan/cooking`으로 이동.

### 1.2 `Plan` 페이지 동적 연동 (Claude 3.5)
* **경로:** `src/app/plan/[skillId]/page.tsx` 수정
* **역할:**
  * 하드코딩된 `buildCookingPlan.ts` 로직 대신, 확정된 재료 리스트를 가지고 `/api/plan` (Claude) 호출.
  * 반환된 세분화된 조리 순서(초 단위 예상 시간 포함) 및 맞춤형 팁(Hint)을 UI 렌더링.

### 1.3 `antigravity-missions.md` (Phase 5) 검증
* 인분 수 조정 시 재료 양이 자동으로 재계산되는지 확인.
* 특정 재료 대체(삭제/추가) 시 조리 순서(Plan)에 변경된 내용이 반영되는지 E2E 테스트 진행.

---

## 🤖 Phase 2: 세탁(Laundry) 및 커피(Coffee) 시나리오 AI 확장

### 2.1 세탁(Laundry) 동적 플랜 AI화
* 현재 `buildLaundryPlan.ts`에 하드코딩된 '옷감 종류', '오염도' 기반의 조건문을 AI 로직으로 전환.
* 사용자가 "흰색 실크 블라우스에 김치 국물이 튀었어" 라고 입력하면, Claude 모델이 "주방세제로 애벌빨래 후 중성세제 망 세탁" 이라는 세밀한 플랜을 짜주도록 API 확장.

### 2.2 커피(Coffee) 팁 및 레시피 AI화
* 온도, 원두 종류(직접 입력 포함), 드리퍼에 따른 추출 방법 및 팁(Hint)을 AI가 동적으로 생성하도록 변경.

---

## 🎙️ Phase 3: 연습(Practice) 화면 실시간 헬퍼 연동 (Gemini 1.5 Flash)

### 3.1 음성/텍스트 기반 실시간 인터랙션 UI 추가
* **경로:** `src/app/practice/[skillId]/page.tsx` 수정
* **역할:** 
  * 하단 컨트롤러 옆에 "도움 요청(Help)" 버튼 또는 음성 인식(마이크) 버튼 추가.
  * Vercel AI SDK의 `useChat` 훅을 사용하여 Gemini 모델과 연결.
  * 연습이 시작될 때 현재의 '재료 상태'와 '조리 순서'를 Gemini의 System Context로 밀어넣어 맥락 유지.
  * 요리 도중 "마늘이 타는데 어떡해?" 라고 물어보면 0.5초 이내에 "불을 끄고 올리브오일을 더 부으세요!" 라고 답변하는 실시간 채팅 패널 구현.

---

## 🛡️ Phase 4: 최종 테스트 및 프로덕션 배포 (Regression & Build)

### 4.1 전체 에러 및 회귀(Regression) 테스트
* (Mission P6-A) 커피, 세탁, 요리 시나리오 통합 테스트 진행.
* Zod 스키마 파싱 에러, AI API Timeout(504), Circuit Breaker 등의 예외 상황에서 Placeholder나 Fallback 로직이 완벽하게 동작하는지 검증.

### 4.2 프로덕션 빌드 및 Vercel 배포
* (Mission P6-B, C) `npm run build` 통과 확인.
* Vercel 배포 후 모바일 뷰포트에서 레이아웃 붕괴 확인.
* 배포된 환경에서 OpenAI, Anthropic API 정상 연동 및 속도 체크.

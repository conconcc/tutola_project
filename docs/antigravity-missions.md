# antigravity-missions.md — Antigravity Mission Specs

> 각 Phase에서 Antigravity가 실행할 미션의 구체 명세서.
> 미션 실행 전 이 파일을 읽고 Goal / Scope / Success Criteria를 확인한다.

---

## Mission 실행 원칙

1. 미션은 하나의 목표만 가진다
2. 브라우저 검증 없이 미션 완료 불가
3. 스크린샷 또는 recording 없이 미션 완료 불가
4. 완료 후 `task.md`를 업데이트한다

---

## Mission P1 — Phase 1: Foundation 검증

**Goal:** Next.js 프로젝트가 정상 초기화되고 기본 라우트가 브라우저에서 렌더링된다

**Scope:** Phase 1 완료 후 1회 실행

**Steps:**
1. `npm run dev` 실행 확인
2. `npx tsc --noEmit` 실행 → 0 errors 확인
3. 브라우저에서 `http://localhost:3000` 접속
4. 랜딩 페이지 렌더링 확인 (시나리오 선택 화면)
5. `/coffee`, `/laundry`, `/cooking` 각 라우트 접속 → 404 아닌 것 확인
6. 브라우저 콘솔 오류 확인

**Success Criteria:**
- [x] `npm run dev` 성공
- [x] `tsc --noEmit` 0 errors
- [x] 랜딩 페이지 렌더링
- [x] 3개 라우트 접속 가능 (빈 페이지여도 가능)
- [x] 콘솔 오류 없음

**Artifacts:**
- `screenshots/p1_landing.webp`
- `screenshots/p1_routes.webp`

---

## Mission P2 — Phase 2: Engine 검증

**Goal:** 공통 시나리오 엔진의 타입과 Zod 스키마가 컴파일 통과하고, 단위 테스트가 통과한다

**Scope:** Phase 2 완료 후 1회 실행

**Steps:**
1. `npx tsc --noEmit` 실행
2. `npx vitest run` 실행
3. 테스트 결과 확인 (scenario-engine 관련 테스트)
4. `src/features/scenario-engine/domain/types.ts` 파일 존재 확인
5. `src/server/services/commandInterpreter.ts` 존재 확인
6. `src/server/services/aiAdapter.ts` 인터페이스 존재 확인

**Success Criteria:**
- [x] `tsc --noEmit` 0 errors
- [x] `vitest run` all pass
- [x] scenario-engine 타입 파일 존재
- [x] commandInterpreter 단위 테스트 존재 + 통과
- [x] aiAdapter 인터페이스 정의됨 (구현 없어도 가능)

**Artifacts:**
- `screenshots/p2_tsc_clean.webp`
- `screenshots/p2_vitest_pass.webp`

---

## Mission P3 — Phase 3: Coffee 시나리오 검증

**Goal:** `/coffee` 페이지의 핵심 기능이 브라우저에서 오류 없이 동작한다

**Scope:** Phase 3 완료 후 1회 실행

**Steps:**
1. `npm run dev` 실행 확인
2. 브라우저에서 `http://localhost:3000/setup/coffee` 접속
3. 페이지 렌더링 확인 (3D 뷰어 + 입력 폼)
4. 커피 파라미터 입력 후 계획 생성 확인
5. `top` 뷰 버튼 클릭 → 3D 카메라 이동 확인
6. `front` / `side` 뷰 전환 확인
7. Step 카드에서 drill-down 버튼 클릭 → 하위 단계 표시 확인
8. 주전자 없음 선택 시 substitution step 포함 확인
9. 브라우저 콘솔 오류 확인

**Success Criteria:**
- [x] 3D Canvas 렌더링 (빈 화면 없음)
- [x] 계획 생성 (Step 목록 표시)
- [x] top / front / side 뷰 전환 동작
- [x] Drill-Down 동작 (현재 생략/수정되었으나 툴팁으로 대체)
- [x] 주전자 없음 → substitution step 존재
- [x] 콘솔 오류 없음

**Artifacts:**
- `screenshots/p3_coffee_render.webp`
- `screenshots/p3_coffee_plan.webp`
- `screenshots/p3_coffee_view_top.webp`
- `screenshots/p3_coffee_drilldown.webp`
- `recordings/p3_coffee_flow.webp`

---

## Mission P4 — Phase 4: Laundry 시나리오 검증

**Goal:** `/laundry` 페이지에서 조건 변경 시 계획이 갱신되고 경고가 표시된다

**Scope:** Phase 4 완료 후 1회 실행

**Steps:**
1. 브라우저에서 `http://localhost:3000/setup/laundry` 접속
2. 기본 조건 입력 후 계획 생성 확인
3. 세탁물 입력 란에 '청바지' 혹은 '흰 셔츠' 설정 후 AI 플랜 갱신 확인
4. 재질을 `wool`로, 오염도를 `heavy`로 설정 → `FABRIC_DAMAGE_RISK` 경고 또는 애벌빨래, 세탁망 플랜 추가 확인
5. loadSize 변경 시 세제량 및 총 세탁 시간 갱신 확인
6. 브라우저 콘솔 오류 확인

**Success Criteria:**
- [x] 계획 생성 동작
- [x] 옷감 분석에 따른 맞춤형 경고 및 단계(세탁망 필수 등) 생성
- [x] 세탁량에 따른 세제 및 시간 갱신 동작
- [x] 조건 변경 시 계획 동적 재계산
- [x] 콘솔 오류 없음

**Artifacts:**
- `screenshots/p4_laundry_plan.webp`
- `screenshots/p4_laundry_warning_color.webp`
- `screenshots/p4_laundry_warning_fabric.webp`

---

## Mission P5 — Phase 5: Cooking 시나리오 + AI 연동 검증

**Goal:** `/cooking` 페이지에서 재료 커스텀 및 AI Adaptive Plan이 오류 없이 반영된다

**Scope:** Phase 5 완료 후 1회 실행

**Steps:**
1. 브라우저에서 `http://localhost:3000/setup/cooking` 접속
2. 요리 이름 입력 후 Ingredients 분석 화면(`http://localhost:3000/ingredients/cooking`) 접속 확인
3. OpenAI 기반 재료 리스트 및 수량 추출 렌더링 확인 (Mock 또는 실제 API)
4. 사용자가 특정 재료를 제거하거나 커스텀 재료 추가 후 최종 확정 동작 확인
5. Claude 모델 기반 AI Adaptive Plan 생성 및 세분화된 조리 스텝 표시 확인
6. 인분을 변경했을 때 예상 시간이나 재료량이 달라지는지 검증
7. 브라우저 콘솔 오류 확인

**Success Criteria:**
- [x] 요리 설정 화면 ➡ 재료 분석 ➡ 플랜 생성 흐름 정상 연동
- [x] API 통신 실패 및 Key 부재 시 Mock 데이터 Fallback 정상 동작
- [x] 재료 추가/삭제에 따른 동적 조리 계획 갱신
- [x] 콘솔 500 오류 미발생 및 정상 핸들링

**Artifacts:**
- `screenshots/p5_cooking_plan.webp`
- `screenshots/p5_cooking_servings_4.webp`
- `screenshots/p5_cooking_substitute.webp`

---

## Mission P6-A — Regression 점검

**Goal:** Phase 3~5 구현 후 기존 시나리오가 깨지지 않았는지 전체 확인

**Scope:** Phase 6 시작 전 1회 실행

**Steps:**
1. `/setup/coffee` → 기본 플로우 빠르게 확인
2. `/setup/laundry` → warning 출력 및 3D Placeholder 확인
3. `/setup/cooking` → 인분 조정 및 재료 분석 확인
4. `npx tsc --noEmit` 실행
5. `npx vitest run` 실행

**Success Criteria:**
- [ ] 3개 시나리오 모두 정상 동작
- [ ] tsc 0 errors
- [ ] vitest all pass

**Artifacts:**
- `screenshots/p6a_regression_coffee.webp`
- `screenshots/p6a_regression_laundry.webp`
- `screenshots/p6a_regression_cooking.webp`

---

## Mission P6-B — 배포 전 빌드 검증 (자동화)

**Goal:** Antigravity가 `npm run build`를 직접 실행하고, production 빌드가 성공한 후 로컬 production 서버에서 동작을 확인한다

**Scope:** Vercel 배포 직전 1회. Antigravity가 터미널에서 직접 실행한다.

**Steps:**
1. `npm run build` 실행
   - 성공 시 다음 단계
   - 실패 시: 에러 메시지 캡처 후 스택 트레이스를 포함한 스크린샷 저장. Cursor에게 이슈 보고 후 플로우 중단
2. 빌드 성공 후 `.next/` 디렉토리 생성 확인
3. `npm start` 실행 (production 서버 기동)
4. 브라우저에서 `http://localhost:3000` 접속
5. 랜딩 페이지 렌더링 확인
6. `/setup/coffee` 접속 후 3D 뷰어 로딩 완료 확인 (dynamic import 정상 동작 여부)
7. `/setup/laundry`, `/setup/cooking` 접속 확인
8. 브라우저 콘솔 오류 확인
9. 빌드 출력 (.next/ 사이즈) 확인
   - Three.js 번들이 크면 lazy load로 분리되어 있는지 정상 확인
10. `npm start` 콘솔 종료

**Success Criteria:**
- [ ] `npm run build` 성공 (exit code 0)
- [ ] `.next/` 디렉토리 생성됨
- [ ] production 서버에서 3개 시나리오 렌더링
- [ ] 3D 뷰어 dynamic import 및 Placeholder3D 정상 로딩
- [ ] 콘솔 오류 없음

**Artifacts:**
- `screenshots/p6b_build_success.webp`
- `screenshots/p6b_prod_landing.webp`
- `screenshots/p6b_prod_coffee.webp`

---

## Mission P6-C — Vercel 배포 후 E2E 검증

**Goal:** 배포된 Vercel URL에서 전체 사용자 플로우가 오류 없이 동작한다

**Scope:** Vercel 첫 배포 완료 후

**Steps:**
1. Vercel 배포 URL 접속
2. 랜딩 → 탐색(Discover) 검색 기능 작동 확인
3. 탐색 → 커피 설정 → 플랜 → 3D 연습 화면 동작 확인
4. 랜딩 → 빨래 설정 → 재질 및 오염도 변경 → 동적 플랜 갱신 및 Placeholder 노출 확인
5. 랜딩 → 요리 설정 → AI 재료 분석 화면 ➡ AI Adaptive Plan 동적 생성 확인
6. 연습(Practice) 완료 모달에서 'Save as New Template' 기능 및 히스토리(History) 탭 연동 확인
7. 모바일 뷰포트에서 레이아웃 확인 (DevTools)
8. 브라우저 콘솔 + 네트워크 탭 오류 확인

**Success Criteria:**
- [ ] 검색/탐색, 프로필, 히스토리, 시나리오 전 플로우 100% 오류 없이 동작
- [ ] AI Fallback 데이터 정상 연동
- [ ] 모바일 레이아웃 깨짐 없음
- [ ] 서버리스 API Timeout 또는 네트워크 연결 오류 완벽 핸들링

**Artifacts:**
- `recordings/p6c_e2e_coffee.webp`
- `recordings/p6c_e2e_laundry.webp`
- `recordings/p6c_e2e_cooking.webp`
- `screenshots/p6c_mobile_view.webp`
- `walkthrough.md` 업데이트

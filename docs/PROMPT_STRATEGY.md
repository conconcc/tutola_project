# PROMPT_STRATEGY.md — AI Prompt Strategy Guide

> Cursor와 Antigravity에 작업을 지시하는 방식에 대한 가이드.
> 이 문서는 "AI에게 어떻게 일을 시켰는지"를 보여주는 협업 역량 증거이기도 하다.

---

## 프롬프트 작성 5원칙

1. **의도를 명시** — "만들어줘"가 아니라 무엇을 왜 만드는지
2. **범위를 제한** — 한 번에 하나의 파일 또는 기능
3. **기준을 참조** — SCHEMA.md, AGENTS.md, rules 파일을 명시적으로 언급
4. **완료 기준을 포함** — 어떤 상태가 되어야 작업이 끝난 것인지
5. **실패 처리를 요구** — 오류/실패 케이스를 어떻게 처리할지

---

## 1. 구조 생성용 프롬프트 (Cursor)

### 폴더 구조 생성

```
  docs/SCHEMA.md와 AGENTS.md를 참고해서
  아래 폴더 구조를 생성해줘. 각 파일은 빈 파일로 만들어도 되고,
  파일 역할에 맞는 최소한의 타입 placeholder를 넣어줘.

  src/features/scenario-engine/
    domain/types.ts
    domain/constants.ts
    application/recalculateEngine.ts
    application/stepDrillDown.ts

  완료 기준:
  - npx tsc --noEmit 통과
  - 각 파일이 named export를 최소 1개 가짐
```

### 타입 스키마 생성

```
docs/SCHEMA.md의 "2. Common Domain Models" 섹션을 그대로 구현해줘.

파일: src/features/scenario-engine/domain/types.ts

요구사항:
- SCHEMA.md의 타입 정의를 정확히 따를 것
- export default 금지, named export만 사용
- any 타입 사용 금지
- Zod schema는 포함하지 말고 순수 TypeScript 타입만 작성

완료 기준:
- npx tsc --noEmit 통과
```

---

## 2. 도메인 구현용 프롬프트 (Cursor)

### Plan Builder 구현

```
src/features/coffee/application/buildCoffeePlan.ts를 구현해줘.

입력: CoffeeState (docs/SCHEMA.md의 4.1 섹션 참고)
출력: Step[] (docs/SCHEMA.md의 2.1 섹션 참고)

요구사항:
- kettleAvailable이 false면 대체 단계(kettle-substitute)를 포함
- flavorPreference가 'strong'이면 추출 시간 증가 단계 포함
- flavorPreference가 'light'이면 추출 시간 감소 단계 포함
- 각 Step은 id, title, description, status('pending'), hint를 포함
- 순수 함수로 작성 (side effect 없음)

완료 기준:
- npx tsc --noEmit 통과
- 함수가 named export로 export됨
- src/features/coffee/application/buildCoffeePlan.test.ts에 최소 3개 테스트 작성
```

### Warning Generator 구현

```
src/features/laundry/application/laundryWarnings.ts를 구현해줘.

입력: LaundryState
출력: Warning[] (docs/SCHEMA.md의 2.2 섹션 참고)

경고 규칙:
1. colorGroups에 'whites'와 'darks'가 동시에 있으면:
   → Warning { code: 'COLOR_BLEED_RISK', severity: 'critical' }
2. loadSize가 'large'이고 soilLevel이 'heavy'이면:
   → Warning { code: 'OVER_LOAD_RISK', severity: 'caution' }
3. fabricTypes에 'wool'이 있고 detergentType이 'standard'이면:
   → Warning { code: 'FABRIC_DAMAGE_RISK', severity: 'caution' }

완료 기준:
- npx tsc --noEmit 통과
- 각 경고 규칙에 대한 단위 테스트 존재
```

---

## 3. UI 구현용 프롬프트 (Cursor)

### 시나리오 선택 페이지

```
src/app/page.tsx를 구현해줘.
이 파일은 랜딩 페이지이자 시나리오 선택 화면이다.

요구사항:
- Server Component (use client 없음)
- 커피 / 빨래 / 요리 3개 카드를 보여줌
- 각 카드는 제목, 짧은 설명, 진입 버튼을 가짐
- 진입 버튼 클릭 시 /coffee, /laundry, /cooking으로 이동
- Tailwind CSS 사용, 다크 배경 기반 디자인
- 컴포넌트 크기: 100줄 이내

완료 기준:
- npm run dev 실행 후 브라우저에서 정상 렌더링
- 버튼 클릭 시 올바른 경로로 이동
```

### StepCard 컴포넌트

```
src/shared/components/StepCard/index.tsx를 구현해줘.

Props:
- step: Step (docs/SCHEMA.md의 2.1 참고)
- isActive: boolean
- onDrillDown: (stepId: string) => void

요구사항:
- 'use client' 지시어 포함 (이벤트 핸들러 있음)
- isActive일 때 시각적으로 강조
- substeps가 있을 때 drill-down 버튼 표시
- drill-down 버튼 클릭 시 onDrillDown(step.id) 호출
- 한국어 메시지는 컴포넌트 상단 messages const로 그루핑
- Tailwind CSS만 사용 (inline style 금지)

완료 기준:
- npx tsc --noEmit 통과
- StepCard.test.tsx에 drill-down 버튼 클릭 테스트 존재
```

### 3D 뷰어 컴포넌트

```
src/features/coffee/ui/CoffeeViewer/index.tsx를 구현해줘.

요구사항:
- 'use client' 지시어 포함
- React Three Fiber Canvas 사용
- cameraPresets.ts에서 { front, top, side, zoom } 프리셋 import
- currentView prop에 따라 카메라 위치 변경
- 드리퍼 / 컵은 simple geometry placeholder로 구현
  (GLTF 모델 추가는 나중에 교체 예정)
- OrbitControls 포함

cameraPresets.ts에 정의할 내용:
  export const CAMERA_PRESETS = {
    front: { position: [0, 1, 3], target: [0, 0, 0] },
    top: { position: [0, 4, 0], target: [0, 0, 0] },
    side: { position: [3, 1, 0], target: [0, 0, 0] },
    zoom: { position: [0, 0.5, 1.5], target: [0, 0, 0] },
  } as const;

완료 기준:
- npx tsc --noEmit 통과
- Canvas가 브라우저에서 렌더링됨
- top / front / side / zoom 전환이 동작함
```

---

## 4. 리팩터링용 프롬프트 (Cursor)

### any 제거

```
src/ 전체에서 any 타입을 찾아 제거해줘.

규칙:
- any → unknown + type guard로 교체
- Record<string, any> → Record<string, unknown>으로 교체
- (event: any) → 올바른 이벤트 타입으로 교체

완료 기준:
- npx tsc --noEmit 통과
- grep -rn ": any" src/ 결과가 0건
```

### 컴포넌트 분리

```
src/features/coffee/ui/CoffeePanel/index.tsx가 200줄을 초과한다.
아래 기준으로 분리해줘:

1. 단계 목록 관련 → StepListPanel.tsx
2. 퀵 액션 버튼 → QuickActionBar.tsx (이미 shared에 있으면 import)
3. 코치 메시지 → CoachMessage.tsx (이미 shared에 있으면 import)

분리 후 CoffeePanel/index.tsx는 이 세 컴포넌트를 조합하는 역할만 함.

완료 기준:
- npx tsc --noEmit 통과
- CoffeePanel/index.tsx 100줄 이내
- 기능 동일성 유지
```

---

## 5. Antigravity 미션 실행용 프롬프트

### Phase 완료 후 브라우저 검증 미션

```
Mission: Coffee 시나리오 브라우저 검증
Goal: /coffee 페이지의 핵심 기능이 브라우저에서 정상 동작하는지 확인한다

Steps:
1. AGENTS.md와 task.md를 읽는다
2. npm run dev가 실행 중인지 확인, 아니면 실행한다
3. 브라우저에서 http://localhost:3000/coffee로 이동한다
4. 다음을 순서대로 검증한다:
   a. 페이지가 오류 없이 렌더링됨
   b. 커피 파라미터 입력 폼이 보임
   c. 폼 제출 후 Step 목록이 생성됨
   d. "top" 뷰 버튼 클릭 시 3D 뷰가 변경됨
   e. 특정 Step의 drill-down 버튼 클릭 시 하위 단계가 표시됨
5. 각 단계의 스크린샷을 저장한다
6. 브라우저 콘솔에 오류가 없는지 확인한다
7. task.md를 업데이트한다

Success Criteria:
- [ ] 페이지 렌더링 성공
- [ ] 계획 생성 동작
- [ ] 3D 뷰 전환 동작
- [ ] Drill-Down 동작
- [ ] 콘솔 에러 없음

Artifacts:
- screenshot: coffee_render.webp
- screenshot: coffee_plan_generated.webp
- screenshot: coffee_view_top.webp
- screenshot: coffee_drilldown.webp
```

---

## 6. 브라우저 검증 종합 미션 프롬프트 (Phase 6)

```
Mission: TUTOLA E2E 브라우저 검증
Goal: 전체 사용자 플로우가 배포 환경에서 오류 없이 동작하는지 확인한다

Target URL: [Vercel 배포 URL]

검증할 플로우:
1. 랜딩 페이지 → 커피 선택 → 커피 플로우 완주
2. 랜딩 페이지 → 빨래 선택 → 조건 변경 → 경고 확인
3. 랜딩 페이지 → 요리 선택 → 인분 조정 → 재료 재계산 확인
4. 자연어 입력 ("위에서 보여줘") → 뷰 전환 확인

각 플로우에서:
- 스크린샷 저장
- 브라우저 콘솔 오류 기록
- 네트워크 오류 기록

최종 아티팩트:
- 각 시나리오 스크린샷 세트
- walkthrough.md 업데이트 (결과 요약)
- 발견된 이슈 목록
```

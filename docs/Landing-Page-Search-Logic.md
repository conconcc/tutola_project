# 💡 Project: Precision Guide "The Detail" - Logic & UI Spec

## 1. 핵심 컨셉
사용자가 자연어로 상황을 입력하면, 미리 정의된 가이드 데이터와 **유사도(Keyword & Context Match)**를 비교하여 최적의 '정밀 조립도 가이드'를 추천하는 인터랙티브 인터페이스.

## 2. 데이터 구조 (Data Schema)
AI가 데이터 형식을 오해하지 않도록 `Zod` 기반의 스키마를 상정합니다.

```typescript
const GuideSchema = z.object({
  id: z.string(),
  title: z.string(), // 가이드 명칭
  description: z.string(), // 요약 설명
  category: z.enum(['LIFESTYLE', 'HOBBY', 'ACTIVE', 'CRAFT', 'OUTDOOR']),
  tags: z.array(z.string()), // 유사도 매칭용 키워드
  scenarios: z.array(z.string()), // 매칭될 수 있는 상황 문장 (예: "내일 면접이야", "결혼식 가야해")
  difficulty: z.enum(['EASY', 'NORMAL', 'HARD']),
  precisionLevel: z.string().default("조립도 수준 (Zoom-in 지원)"),
  thumbnailUrl: z.string() // 설계도/도면 느낌의 이미지
});
```

## 3. 검색 및 유사도 로직 (Logic)
AI 엔진(LLM) 대신 가볍고 빠른 **Client-side 매칭**을 사용합니다.

- **Library 추천:** `fuse.js` (가벼운 퍼지 검색 라이브러리)
- **매칭 가중치:**
    1.  `title` (가장 높음)
    2.  `tags` (중간)
    3.  `scenarios` (문맥 매칭용)
- **작동 방식:**
    - 사용자가 입력한 문장을 단어 단위로 토큰화.
    - 불용어(은, 는, 이, 가, 하고, 싶어 등) 제거.
    - 남은 핵심 키워드와 `GuideLibrary` 데이터 비교 후 점수(Score) 부여.

## 4. UI/UX 구성 요소 (Main Screen)

### [A] 인터랙티브 검색바 (Hero Section)
- **UI:** 화면 정중앙에 거대한 Input 창.
- **Vibe:** 입력 시 배경에 은은한 파티클이나 확대/축소 애니메이션.
- **Placeholder:** `"나는 지금 [넥타이]를 [단단하게] 매고 싶어"` (대괄호 부분은 타이핑 애니메이션 처리)

### [B] 실시간 추천 태그 (Context Tags)
- 검색창 하단에 사용자가 자주 찾거나 현재 트렌드인 시나리오를 태그로 노출.
- 예: `#면접준비` `#첫캠핑` `#프라모델입문` `#선물포장`
- 클릭 시 해당 키워드로 즉시 유사도 매칭 실행.

### [C] 결과 카드 (Result Display)
- **인지 개선:** 단순 목록이 아닌 **'가장 높은 점수의 결과'** 하나를 중앙에 크게 강조.
- **확대 인지:** 카드 이미지에 마우스를 올리면 루페(돋보기) 효과를 주어 "정밀 가이드"임을 강조.
- **CTA 버튼:** `"정밀 조립도 보기 (360° 지원)"`

## 5. 커서(Cursor)에게 줄 프롬프트 (Prompt)

> **"위의 `logic.md` 내용을 바탕으로 다음을 구현해줘:"**
>
> 1. `data/guides.ts` 파일에 6개 이상의 샘플 데이터를 만들어줘. (넥타이, 캠핑 매듭, 리본 묶기 등 포함)
> 2. `fuse.js`를 사용해서 사용자의 입력값과 `tags`, `scenarios`를 비교하는 `useSearch` 커스텀 훅을 만들어줘.
> 3. 메인 화면은 `framer-motion`을 사용해서 아주 부드럽고 고급스럽게 만들어줘. 검색창에 글자를 칠 때마다 하단 추천 카드가 유기적으로 변해야 해.
> 4. 전체적인 디자인 톤은 '다크 모드' 기반에 '설계도(Blueprint)' 느낌의 가느다란 선과 정교한 타이포그래피를 사용해줘.

-
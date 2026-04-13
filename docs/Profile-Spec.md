# TUTOLA Profile UI/UX Design Specification

**문서 목적:** Figma 링크 기반 프로필 화면 UI 및 컨셉/테마 분석, 향후 UI 생성 시 가이드라인으로 활용

## 1. Design Concept & Theme (컨셉 및 테마)
* **Warm Minimalism (따뜻한 미니멀리즘):**
  * 배경색: 전역 배경은 기존 설정과 동일하게 따뜻한 베이지 톤 (`bg-[#F5F2F0]`)을 유지하여 눈의 피로도를 낮추고 감성적인 무드를 연출합니다.
  * 레이아웃: 여백(Padding/Margin)을 넓게 가져가며, 요소들을 둥근 곡선(`rounded-2xl` ~ `rounded-3xl`)으로 처리하여 부드러운 인상을 줍니다.
* **Typography:** 
  * 헤딩 및 주요 강조 텍스트: `Plus Jakarta Sans`를 사용하여 모던하고 세련된 느낌 유지.
  * 정보 텍스트: `text-foreground/50` 또는 `text-foreground/60` 등의 반투명 색상을 사용하여 시각적 계층 구조(Visual Hierarchy)를 명확히 분리.
* **Color Palette:**
  * Primary (Brand): 따뜻한 오렌지 브라운 톤 (기존 앱 전반의 Brand 컬러).
  * Surface: `bg-white` 카드로 영역 분리. 테두리는 `border-border/30` 등 매우 옅은 선형태로 경계만 살짝 보여줍니다.

## 2. Layout Structure (레이아웃 구조)

### 2.1. Header (상단 헤더)
* 프로필 화면 상단은 `TUTOLA` 로고 혹은 "My Profile"이라는 큼직하고 볼드한 텍스트 렌더링.
* (선택적) 우측 상단 톱니바퀴(Settings) 아이콘 배치로 시스템 설정 진입점 제공.

### 2.2. User Info Card (유저 정보 요약)
* 화면 최상단에 위치하는 유저 프로필 카드.
* **Avatar:** 원형 프로필 이미지(또는 이니셜 아바타).
* **Information:** 유저 이름(Nickname), 이메일 주소, 가입일 등.
* **Edit Button:** 우측에 작은 "Edit Profile" 아웃라인 버튼 배치.

### 2.3. Statistics / Achievements (통계 및 성과 달성)
* 사용자의 활동을 독려하기 위한 대시보드 형태의 Grid 컨테이너.
* 2~3개의 카드로 분할되어 렌더링:
  * 총 연습 횟수 (Total Practices)
  * 가장 많이 연습한 카테고리 (Favorite Category - 예: COFFEE)
  * 누적 연습 시간 (Total Hours)
* 각 카드는 숫자를 크게 강조(`text-3xl font-bold text-brand`)하고, 아래에 작은 라벨 텍스트가 붙는 형태.

### 2.4. Preferences & Settings (사용자 선호도 및 설정)
* 리스트 형태의 메뉴(List Item)로 구성. 클릭 가능하게 Hover 효과(`hover:bg-foreground/[0.02]`) 적용.
* 항목 구성:
  * **Language (언어 설정):** 한국어/영어 스위치
  * **Notifications (알림 설정):** 푸시 알림 ON/OFF 토글
  * **App Theme (테마 설정):** Light / Dark (향후 확장 대비)
* 각 리스트 아이템의 좌측에는 아이콘(Lucide React), 우측에는 현재 설정값 및 ChevronRight 아이콘.

## 3. UI Component Details (UI 컴포넌트 디테일)

* **Cards (카드 UI):**
  ```tsx
  <div className="p-6 bg-white rounded-3xl border border-border/30 shadow-sm">
    {/* 내용 */}
  </div>
  ```
* **List Item (리스트 아이템):**
  ```tsx
  <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-border/20 hover:border-brand/30 hover:shadow-sm transition-all mb-3 group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-brand/10 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <span className="font-medium text-foreground">Menu Name</span>
    </div>
    <ChevronRight className="text-foreground/30" />
  </button>
  ```

## 4. Interaction & Motion (인터랙션 및 모션)
* `framer-motion` (또는 `motion/react`)을 이용한 부드러운 진입 효과.
* 전체 페이지 진입 시: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
* 카드 및 리스트 아이템들은 `staggerChildren`을 이용하여 순차적으로 떠오르는 효과(Cascade)를 적용하면 몰입감 상승.

## 5. Next Steps (다음 작업 제안)
1. `src/app/profile/page.tsx` 생성 및 위 레이아웃 기반 마크업 뼈대 작성.
2. User 상태를 전역 스토어(Zustand 등)로 관리하도록 확장 (현재는 목업 데이터 사용).
3. 다크모드/언어설정 등 실제 기능과의 연동.

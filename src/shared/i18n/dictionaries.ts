export const dictionaries = {
  en: {
    nav: {
      home: "Home",
      discover: "Discover",
      history: "History",
      profile: "Profile"
    },
    landing: {
      title: "Where shall we begin?",
      subtitle: "Choose a scenario or search for a specific skill you'd like to master today.",
      searchPlaceholder: "Search for 'coffee brewing', 'laundry'...",
      searchButton: "Search",
      recentPractices: "Recent Practices",
      coffeeTitle: "Coffee Brewing",
      laundryTitle: "Laundry Basics",
      cookingTitle: "Cooking Standard"
    },
    setup: {
      saveButton: "Save to Library",
      scenarioSettings: "Scenario Settings",
      scenarioDesc: "Adjust the parameters to generate your personalized practice plan.",
      brewParams: "Brew Parameters",
      strength: "Strength",
      temperature: "Temperature",
      kettle: "Gooseneck Kettle",
      ratio: "Ratio",
      grindSize: "Grind Size",
      adaptivePlan: "Adaptive Plan",
      startPractice: "Start Practice",
      tasteHints: {
        balanced: "Based on your selection, we've optimized the water temperature and pour ratio for a balanced flavor profile.",
        strong: "A higher temperature with strong extraction setting will produce a rich body with prominent bitterness and dark chocolate notes.",
        light: "A lower temperature setting will highlight the beans' natural acidity and floral/fruity notes for a cleaner cup."
      }
    },
    practice: {
      stepOf: "Step {current} of {total}",
      substitutionNotice: "Substitution Notice",
      substitutionDesc: "You selected no gooseneck kettle. A substitution step is added to the plan.",
      substituteBadge: "Substitute",
      targetWater: "Target Water",
      duration: "Duration",
      showDetails: "Show detailed steps",
      hideDetails: "Hide details",
      greatJob: "Great Job!",
      practiceComplete: "Your practice is complete. Well done!",
      resume: "Resume",
      pause: "Pause",
      viewHistory: "View History"
    },
    common: {
      comingSoon: "Coming Soon",
      comingSoonDesc: "This feature is currently under development."
    }
  },
  ko: {
    nav: {
      home: "홈",
      discover: "탐색",
      history: "기록",
      profile: "프로필"
    },
    landing: {
      title: "오늘은 어떤 연습을 해볼까요?",
      subtitle: "시나리오를 선택하거나 마스터하고 싶은 기술을 지금 검색해보세요.",
      searchPlaceholder: "'드립 커피', '섬세한 세탁' 등을 검색해보세요...",
      searchButton: "검색",
      recentPractices: "최근 연습한 시나리오",
      coffeeTitle: "커피 브루잉",
      laundryTitle: "기본 세탁",
      cookingTitle: "표준 레시피 요리"
    },
    setup: {
      saveButton: "라이브러리에 저장",
      scenarioSettings: "시나리오 설정",
      scenarioDesc: "파라미터 조정을 통해 나만의 맞춤 연습 계획을 완성하세요.",
      brewParams: "추출 파라미터",
      strength: "강도",
      temperature: "물 온도",
      kettle: "구스넥 주전자 보유",
      ratio: "비율",
      grindSize: "분쇄도",
      adaptivePlan: "맞춤형 추출 계획",
      startPractice: "연습 시작하기",
      tasteHints: {
        balanced: "현재 설정은 균형 잡힌 맛을 내기 위해 물 온도와 추출 비율이 가장 이상적으로 맞춰져 있습니다.",
        strong: "높은 온도와 강한 추출은 묵직한 바디감과 쌉쌀한 초콜릿 풍미를 끌어올리는 데 적합합니다.",
        light: "낮은 온도에서의 가벼운 추출은 원두 본연의 화사한 산미와 과일향을 살려 깔끔한 한 잔을 만듭니다."
      }
    },
    practice: {
      stepOf: "총 {total}단계 중 {current}단계",
      substitutionNotice: "대체 도구 안내",
      substitutionDesc: "주전자가 없으므로 물붓기를 보완할 수 있는 대체 단계를 계획에 추가했습니다.",
      substituteBadge: "대체됨",
      targetWater: "목표 물양",
      duration: "소요 시간",
      showDetails: "세부 단계 보기",
      hideDetails: "숨기기",
      greatJob: "수고하셨습니다!",
      practiceComplete: "성공적으로 모든 연습 단계를 마쳤습니다. 훌륭해요!",
      resume: "시작",
      pause: "일시정지",
      viewHistory: "나의 기록 보기"
    },
    common: {
      comingSoon: "준비 중입니다",
      comingSoonDesc: "해당 기능은 현재 개발 중에 있습니다."
    }
  }
};

export type Language = 'en' | 'ko';
export type Dictionary = typeof dictionaries.en;

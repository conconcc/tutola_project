import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PracticeScenarios...');

  const scenarios = [
    {
      scenarioKey: 'coffee',
      titleKo: '커피 브루잉',
      titleEn: 'Coffee Brewing',
      category: 'COFFEE',
      keywords: '커피, 브루잉, 핸드드립, 원두, 에스프레소, coffee, brewing, 카페, 홈카페',
    },
    {
      scenarioKey: 'laundry',
      titleKo: '기본 세탁',
      titleEn: 'Laundry Basics',
      category: 'HOME CARE',
      keywords: '세탁, 빨래, 의류, 옷, 건조기, laundry, 세제, 섬유유연제, 워시, wash',
    },
    {
      scenarioKey: 'cooking',
      titleKo: '표준 레시피 요리',
      titleEn: 'Cooking Standard',
      category: 'KITCHEN',
      keywords: '요리, 밥, 찌개, 반찬, 레시피, cooking, kitchen, 식사, 주방',
    },
  ];

  for (const scenario of scenarios) {
    await prisma.practiceScenario.upsert({
      where: { scenarioKey: scenario.scenarioKey },
      update: scenario,
      create: scenario,
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

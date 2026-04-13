import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prismaClient';

const FALLBACK_SCENARIOS = [
  {
    scenarioKey: 'coffee',
    titleKo: '나만의 아침 커피',
    titleEn: 'My Morning Coffee',
    category: 'COFFEE',
    keywords: '커피,핸드드립,브루잉,추출,바리스타,원두',
  },
  {
    scenarioKey: 'laundry',
    titleKo: '니트/스웨터 세탁',
    titleEn: 'Knit & Sweater Wash',
    category: 'HOME CARE',
    keywords: '세탁,빨래,니트,스웨터,울,세제,세탁기',
  },
  {
    scenarioKey: 'cooking',
    titleKo: '완벽한 스테이크',
    titleEn: 'Perfect Steak',
    category: 'KITCHEN',
    keywords: '요리,스테이크,고기,구이,레시피,조리',
  },
];

export async function GET(): Promise<Response> {
  try {
    let results = await prisma.practiceScenario.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (results.length === 0) {
      await prisma.practiceScenario.createMany({
        data: FALLBACK_SCENARIOS,
        skipDuplicates: true,
      });
      results = await prisma.practiceScenario.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[Scenarios API Error]', error);
    const fallbackResults = FALLBACK_SCENARIOS.map((s, i) => ({
      id: String(i + 1),
      ...s,
      createdAt: new Date(),
    }));
    return NextResponse.json({ results: fallbackResults });
  }
}

import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

const FALLBACK_SCENARIOS = [
  { id: '1', scenarioKey: 'coffee', titleKo: '나만의 아침 커피', titleEn: 'My Morning Coffee', category: 'COFFEE', keywords: '커피, 핸드드립, 원두, 모닝커피, v60' },
  { id: '2', scenarioKey: 'laundry', titleKo: '니트/스웨터 세탁', titleEn: 'Knit & Sweater Wash', category: 'HOME CARE', keywords: '세탁, 빨래, 니트, 스웨터, 울세탁' },
  { id: '3', scenarioKey: 'cooking', titleKo: '완벽한 스테이크', titleEn: 'Perfect Steak', category: 'KITCHEN', keywords: '요리, 스테이크, 고기, 저녁, 레시피' }
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const query = q.trim();

  try {
    const results = await prisma.practiceScenario.findMany({
      where: {
        OR: [
          { titleKo: { contains: query, mode: 'insensitive' } },
          { titleEn: { contains: query, mode: 'insensitive' } },
          { keywords: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[Search API Error]', error);
    // DB connection failure or Prisma initialization failure
    // Filter fallback scenarios based on query
    const qLower = query.toLowerCase();
    const fallbackResults = FALLBACK_SCENARIOS.filter(s => 
      s.titleKo.toLowerCase().includes(qLower) || 
      s.titleEn.toLowerCase().includes(qLower) || 
      s.keywords.toLowerCase().includes(qLower)
    );
    return NextResponse.json({ results: fallbackResults.slice(0, 5) });
  }
}

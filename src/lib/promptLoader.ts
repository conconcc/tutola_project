import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * src/prompts/{name}/{version}.txt 파일을 읽어 문자열로 반환합니다.
 * Next.js 서버 런타임 전용 — 클라이언트 컴포넌트에서 호출 불가.
 *
 * @param name    - 프롬프트 디렉토리 이름 (예: 'ingredient-analyzer', 'adaptive-plan')
 * @param version - 버전 문자열 (예: 'v1.0.0')
 */
export function loadPrompt(name: string, version: string): string {
  const filePath = join(process.cwd(), 'src', 'prompts', name, `${version}.txt`);
  return readFileSync(filePath, 'utf-8');
}

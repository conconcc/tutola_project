# DB_RECOMMENDATION.md

## 결론 (권장 조합)
- **Primary DB**: PostgreSQL (Supabase or Neon)
- **ORM**: Prisma
- **Rate Limit / Fast Counter**: Upstash Redis
- **Session Store (확장 시)**: Redis(짧은 세션) + Postgres(감사/장기 기록)

현재 코드 기준으로는 메모리 스토어 fallback이 있고, 운영 전환 시 위 조합이 가장 안정적입니다.

## 왜 이 조합인가
- PostgreSQL:
  - 시나리오/플랜/이벤트 이력 같은 관계형 데이터에 강함
  - 트랜잭션/인덱스/JSONB 활용 가능
- Prisma:
  - TypeScript strict 환경에서 스키마-타입 일관성 유지
  - 마이그레이션 체계 확립 쉬움
- Upstash Redis:
  - 서버리스/엣지 환경에서 rate limit 카운터 구현이 간단
  - 세션 TTL 관리에 적합

## 현재 구현과 연결 포인트
- 세션:
  - 현재 `src/server/security/sessionStore.ts`는 in-memory
  - 차후 `SessionStore` 인터페이스 유지한 채 Redis/Postgres adapter로 치환 가능
- Rate Limit:
  - 현재 `src/server/security/rateLimiter.ts`는
    - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` 있으면 Redis 사용
    - 없으면 in-memory fallback
- 보안 로그:
  - `SECURITY_LOG_WEBHOOK_URL` 설정 시 외부 sink 전송
  - 추후 Postgres 테이블(`security_events`) 적재로 확장 가능

## 최소 운영 환경변수 제안
- `API_PROVIDER_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SECURITY_LOG_WEBHOOK_URL`
- `DATABASE_URL` (Postgres)

## 다음 단계 (DB 확정 후)
1. Prisma 도입 + `security_events`, `sessions`, `interpret_requests` 모델 정의
2. `sessionStore`를 DB/Redis 기반 구현으로 교체
3. `/api/interpret` 요청/응답 감사 로그를 비식별 형태로 저장
4. 배포 환경에서 rate-limit/로그 대시보드 연결

## 현재 반영 상태
- Prisma 스키마 초안 생성: `prisma/schema.prisma`
- Prisma 클라이언트 래퍼: `src/server/db/prismaClient.ts`
- 보안 이벤트 DB 저장 경로 추가: `src/server/security/securityEventRepository.ts`
- 운영 체크리스트: `docs/OPS_HANDOFF_CHECKLIST.md`

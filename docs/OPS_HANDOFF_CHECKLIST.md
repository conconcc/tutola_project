# OPS_HANDOFF_CHECKLIST.md

이 문서는 "개발 완료 후 사용자가 직접 연결/설정해야 하는 항목"을 추적하기 위한 운영 체크리스트입니다.  
작업할 때마다 체크 상태를 갱신하고, 메모를 남겨 주세요.

---

## 1) 인프라 선택/생성

- [ ] PostgreSQL 인스턴스 생성 (Supabase/Neon 중 선택)
- [ ] Upstash Redis 인스턴스 생성
- [ ] 보안 로그 수집 Webhook 엔드포인트 준비 (선택)

메모:
- DB 벤더:
- Redis 리전:
- Webhook 도구:

---

## 2) 환경변수 설정

`.env.local`에 아래 값 채우기:

- [ ] `API_PROVIDER_API_KEY`
- [ ] `DATABASE_URL`
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`
- [ ] `SECURITY_LOG_WEBHOOK_URL` (선택)

메모:
- 적용 일시:
- 확인자:

---

## 3) DB 초기화 (Prisma)

- [ ] `npm run prisma:generate`
- [ ] `npm run prisma:migrate:dev -- --name init-security-core`
- [ ] `npx tsc --noEmit`
- [ ] `npm run test`

메모:
- migration 결과:
- 실패 시 에러:

---

## 4) API 동작 검증

### Session 발급 API
- [ ] `POST /api/auth/session` 호출 성공 (200)
- [ ] `sessionId` 반환 확인

### Interpret API
- [ ] `x-session-id` 포함 시 `POST /api/interpret` 성공
- [ ] 세션 누락 시 `401 AUTH_REQUIRED`
- [ ] 잘못된 세션 시 `403 INVALID_SESSION`
- [ ] 과도 요청 시 `429 RATE_LIMITED`

메모:
- 테스트 툴(Postman/curl):
- 결과 요약:

---

## 5) 보안 로그 검증

- [ ] 콘솔 JSON 로그 출력 확인 (`requestId`, `event`, `statusCode`)
- [ ] DB에 `SecurityEvent` 레코드 적재 확인 (`DATABASE_URL` 설정 시)
- [ ] Webhook 수신 로그 확인 (`SECURITY_LOG_WEBHOOK_URL` 설정 시)

메모:
- 누락 이벤트:
- 보완 필요:

---

## 6) 이후 주기 점검 항목 (주 1회 권장)

- [ ] `npm audit` 결과 확인 및 조치
- [ ] 테스트 회귀 확인 (`npm run test`)
- [ ] 에러코드 사용 현황 점검 (신규 코드 필요한지 검토)
- [ ] rate limit 기준(분당 30회) 적절성 재검토

메모:
- 점검일:
- 조치사항:

---

## 변경 이력

- YYYY-MM-DD:
  - 변경 내용:
  - 담당자:

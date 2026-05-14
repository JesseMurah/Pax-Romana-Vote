# Codebase Cleanup — Full Refactor Design

**Date:** 2026-05-14
**Branch:** dev
**Scope:** Full refactor — security sweep, architecture decomposition, schema cleanup, tests
**Environment:** Pre-production (breaking changes permitted)

---

## Approach: Layered (3 sequential commits)

1. Security & surface sweep + schema cleanup
2. Architecture decomposition
3. Tests

Each commit is independently reviewable. If a regression occurs, the commit history isolates it.

---

## Section 1 — Security, Surface Sweep & Schema Cleanup

### Root scripts (delete)
- `hash-password.js` — hardcoded password, no place in the repo
- `test-smtp.js` — hardcoded personal email, debug-only script

### Security fix
- `src/modules/auth/strategies/jwt.strategy.ts` — remove `console.log('JWT_SECRET:', secret)` entirely

### Replace all `console.log` with NestJS `Logger`
Each affected class gets `private readonly logger = new Logger(ClassName.name)`.

Affected files:
- `src/app.module.ts`
- `src/app.service.ts`
- `src/throttler.guard.ts`
- `src/modules/auth/strategies/jwt.strategy.ts`
- `src/modules/nominations/nominations.controller.ts`
- `src/modules/nominations/services/nomination.service.ts`
- `src/modules/notifications/notification.service.ts`
- `src/modules/voting/voting.service.ts` (the `console.error` in anomaly detection)

### Dead code removal
- Commented-out `NotificationService` import + constructor param in `nomination.service.ts`
- Commented-out email method block in `notification.service.ts`
- `// inkVerified: true` orphan comment in `voting.service.ts`

### Consolidate `ec-consensus.service.ts`
- Delete `src/modules/admin/services/ec-consensus.service.ts`
- Update all imports in `admin/` that referenced it to point to `src/modules/common/utils/ec-consensus.service.ts`

### Prisma schema cleanup

**Remove redundant dual-relations:**
Strip the unnamed `User?` + `userId?` fields from:
- `Nomination`
- `EcReview`
- `NominatorVerification`
- `GuarantorVerification`

Remove the corresponding unnamed back-relations from `User` (`Nomination[]`, `EcReview[]`).
Only named relations (`"Aspirant"`, `"Reviewer"`) remain.

**Camelcase all relation field names:**
Rename PascalCase relation fields to camelCase across all models:
- `User` → `user`
- `Nomination` → `nomination`
- `EcReview` → `ecReview`
- `VotingSession` → `votingSession`
- `AuditLog` → `auditLog`
- etc.

Update all app code that references these Prisma field names.

**Refactor `VerificationToken`:**
Replace the two optional unique FKs:
```prisma
// Before
nominatorVerificationId String? @unique
guarantorVerificationId String? @unique
```
With a single polymorphic FK:
```prisma
// After
enum VerificationTargetType {
  NOMINATOR
  GUARANTOR
}
verificationId   String                 @unique
verificationType VerificationTargetType
```
Update app code that resolves tokens to use `verificationType` to determine which model to query.

**Fresh migration:**
Generate `prisma migrate dev --name init_clean` after all schema changes are applied.

---

## Section 2 — Architecture Decomposition

### Decompose `voting.service.ts` (1,431 lines → 4 files)

**`src/modules/voting/services/otp.service.ts`**
Responsibility: Arkesel OTP API integration
Methods: `generateOtp`, `verifyOtp`
Dependencies: `HttpService`, `ConfigService`, `PrismaService`, `CacheService`, `RealTimeService`

**`src/modules/voting/services/vote-submission.service.ts`**
Responsibility: Core voter journey
Methods: `getBallot`, `submitVote`, `validateSession`
Dependencies: `PrismaService`, `CacheService`, `RealTimeService`, `VotingStatsService`, `AnomalyDetectionService`, `ConfigService`

**`src/modules/voting/services/voting-admin.service.ts`**
Responsibility: Admin-only operations
Methods: `pauseVoting`, `resumeVoting`, `getActiveSessions`, `exportVotingData`, `getVotingAnalytics`, `getSystemHealth`, `getAnomalies`
Private helpers: `generateCSVExport`, `groupVotesByHour`, `checkCacheHealth`
Dependencies: `PrismaService`, `CacheService`, `RealTimeService`, `VotingStatsService`, `AnomalyDetectionService`

**`src/modules/voting/voting.service.ts`** (thin facade)
Responsibility: Public/stats layer
Methods: `getVotingStats`, `getPublicDashboardData`, `getVotingTimeline`, `refreshAndBroadcastStats`, `getRealtimeConnectionInfo`, `broadcastMessage`, `getPositionStats`, `getVotingVelocity`
Dependencies: `PrismaService`, `VotingStatsService`, `RealTimeService`

All four services registered in `voting.module.ts`. Controller updated to inject the correct service per endpoint group.

### Clean up `notification.service.ts` (501 lines)

Sub-services already exist in `src/modules/notifications/service/`:
- `email.service.ts`
- `mnotify-sms.service.ts`
- `notification-queue.service.ts`
- `admin-notifications.service.ts`
- `deadline-reminders.service.ts`

Action: Move any channel-specific logic (email composition, SMS formatting, queue management) still living in `notification.service.ts` into its correct sub-service. Reduce `notification.service.ts` to a clean orchestrator that delegates.

### Naming standardization

All app code referencing old PascalCase Prisma relation fields updated to camelCase (aligned with schema cleanup in Section 1). No service file renames needed — existing names already follow NestJS conventions.

---

## Section 3 — Tests

**Strategy:** Unit tests with Jest. External dependencies mocked (`PrismaService`, `CacheService`, `HttpService`, `RealTimeService`, etc.).

### New test files

| File | Coverage |
|---|---|
| `voting/services/otp.service.spec.ts` | OTP generation (happy path, API failure, already-voted guard); OTP verification (invalid OTP, email mismatch, session creation) |
| `voting/services/vote-submission.service.spec.ts` | Ballot retrieval (cache hit, cache miss); vote submission (session validation, transaction, real-time broadcast); session validation (expired, already voted) |
| `voting/services/voting-admin.service.spec.ts` | Pause/resume voting; active sessions query; export (JSON + CSV paths); anomaly detection delegation; system health check |
| `voting/voting.service.spec.ts` | Stats fallback logic; public dashboard filtering; timeline query |
| `notifications/notification.service.spec.ts` | Orchestrator routes to correct sub-service per notification type |
| `common/utils/ec-consensus.service.spec.ts` | Consensus calculation (quorum met, quorum not met, edge cases) |

### Existing test files
Updated where refactoring changes imports or method signatures, otherwise left as-is:
- `notifications/notifications.controller.spec.ts`
- `notifications/notifications.service.spec.ts`
- `db/db.service.spec.ts`
- `src/app.controller.spec.ts`

### Coverage target
All public methods on the 4 new voting services and the consolidated `ec-consensus.service` have at least one happy-path and one failure-path test.

---

## Out of Scope
- No endpoint or DTO renames (API contract preserved)
- No changes to `Programme` or `Subgroup` models (actively used)
- No changes to `real-time/` module internals
- No new features

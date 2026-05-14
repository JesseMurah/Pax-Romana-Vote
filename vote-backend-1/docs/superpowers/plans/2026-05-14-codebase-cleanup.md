# Codebase Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full refactor of the vote-backend-1 NestJS codebase — security sweep, schema cleanup, service decomposition, and test coverage.

**Architecture:** Three sequential commits: (1) security/surface/schema, (2) architecture decomposition, (3) tests. Each commit is independently deployable and reviewable.

**Tech Stack:** NestJS, Prisma (PostgreSQL), Jest, TypeScript

**Spec:** `docs/superpowers/specs/2026-05-14-codebase-cleanup-design.md`

---

## Phase 1 — Security, Surface Sweep & Schema Cleanup

---

### Task 1: Fix .gitignore and untrack dist/

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Replace .gitignore with standard NestJS exclusions**

```
# compiled output
dist/
build/

# Node
node_modules/
npm-debug.log*

# env files
.env
.env.*
!.env.example
prisma/.env

# uploads
uploads/

# OS
.DS_Store
.DS_Store?
```

- [ ] **Step 2: Untrack already-committed dist/ files**

```bash
git rm -r --cached dist/
```

Expected: many `rm 'dist/...'` lines

- [ ] **Step 3: Stage and commit**

```bash
git add .gitignore
git commit -m "chore: fix .gitignore and untrack dist/"
```

---

### Task 2: Delete root debug scripts

**Files:**
- Delete: `hash-password.js`
- Delete: `test-smtp.js`

- [ ] **Step 1: Delete both files**

```bash
git rm hash-password.js test-smtp.js
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove root debug scripts with hardcoded credentials"
```

---

### Task 3: Remove JWT_SECRET console.log

**Files:**
- Modify: `src/modules/auth/strategies/jwt.strategy.ts`

- [ ] **Step 1: Remove the debug log**

In `jwt.strategy.ts`, find and remove line 22:
```typescript
console.log('JWT_SECRET:', secret); // Debug log
```

The constructor should end at the closing `super({...})` brace.

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit
```

Expected: no errors on this file

---

### Task 4: Logger migration — app core files

**Files:**
- Modify: `src/app.module.ts`
- Modify: `src/app.service.ts`
- Modify: `src/throttler.guard.ts`

- [ ] **Step 1: Update app.module.ts**

Replace the entire file:
```typescript
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { NominationModule } from './modules/nominations/nomination.module';
import { AdminModule } from './modules/admin/admin.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { DbModule } from '../db';
import { CustomThrottlerGuard } from './throttler.guard';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ResultsModule } from './modules/results/results.module';
import { RealTimeModule } from './modules/real-time/real-time.module';
import { CacheModule } from './modules/caches/cache.module';
import { VotingModule } from './modules/voting/voting.module';
import { SupabaseModule } from './modules/supabase';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
        ScheduleModule.forRoot(),
        AuthModule,
        UsersModule,
        NotificationsModule,
        NominationModule,
        AdminModule,
        FileUploadModule,
        DbModule,
        CandidatesModule,
        ResultsModule,
        RealTimeModule,
        CacheModule,
        VotingModule,
        SupabaseModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    ],
})
export class AppModule {
    private readonly logger = new Logger(AppModule.name);

    constructor() {
        this.logger.log('AppModule initialized');
    }
}
```

- [ ] **Step 2: Update app.service.ts**

Replace the constructor:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(private configService: ConfigService) {
        this.logger.log('AppService initialized');
    }
    // ... rest of file unchanged
```

- [ ] **Step 3: Update throttler.guard.ts**

Replace the entire file (no logging needed in a guard):
```typescript
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends NestThrottlerGuard {
    constructor() {
        // @ts-ignore
        super();
    }
}
```

---

### Task 5: Logger migration — nomination.service.ts

**Files:**
- Modify: `src/modules/nominations/services/nomination.service.ts`

- [ ] **Step 1: Update imports — add Logger, remove commented import**

Replace lines 1-11:
```typescript
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../db';
import { DeadlineService } from '../../common/utils/deadline.service';
import { CreateNominationDto } from '../dto/create-nomination.dto';
import { NominationStatus, Candidate_Position, UserRole } from '@prisma/client/index';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../../users/users.service';
import { CloudinaryService } from '../../file-upload/services/cloudinary.service';
import { IUser } from '../../users/interfaces/user.interface';
```

- [ ] **Step 2: Add logger, remove commented constructor param, remove console.log**

Replace the class declaration through end of constructor:
```typescript
@Injectable()
export class NominationService {
    private readonly logger = new Logger(NominationService.name);

    constructor(
        public prisma: PrismaService,
        private deadlineService: DeadlineService,
        public usersService: UsersService,
        private cloudinaryService: CloudinaryService,
    ) {}
```

- [ ] **Step 3: Replace the console.log block (lines ~186–193) with logger**

Find this block in `createNomination`:
```typescript
        console.log('=== NOMINATION CREATED - MANUAL EMAIL NEEDED ===');
        console.log('Nominator Email:', nomination.nominatorVerification!.email);
        console.log('Nominator Token:', nominatorToken);
        console.log('Guarantor Emails and Tokens:');
        nomination.guarantorVerifications.forEach((guarantor, index) => {
            console.log(`  - ${guarantor.email}: ${guarantorTokens[index]}`);
        });
        console.log('===============================================');
```

Replace with:
```typescript
        this.logger.warn('Nomination created — manual email required', {
            nominatorEmail: nomination.nominatorVerification!.email,
            guarantorEmails: nomination.guarantorVerifications.map((g, i) => ({
                email: g.email,
                token: guarantorTokens[i],
            })),
        });
```

- [ ] **Step 4: Verify no remaining console.log calls**

```bash
grep -n "console\." src/modules/nominations/services/nomination.service.ts
```

Expected: no output

---

### Task 6: Logger migration — nominations.controller.ts

**Files:**
- Modify: `src/modules/nominations/nominations.controller.ts`

- [ ] **Step 1: Find all console.log instances**

```bash
grep -n "console\." src/modules/nominations/nominations.controller.ts
```

Note each line number.

- [ ] **Step 2: Replace all console.log with logger calls**

The controller already has a `Logger` injected (check the existing class). If not, add:
```typescript
private readonly logger = new Logger(NominationsController.name);
```

For each `console.log(...)` found, replace with `this.logger.log(...)`.
For each `console.error(...)`, replace with `this.logger.error(...)`.
For each `console.warn(...)`, replace with `this.logger.warn(...)`.

- [ ] **Step 3: Verify**

```bash
grep -n "console\." src/modules/nominations/nominations.controller.ts
```

Expected: no output

---

### Task 7: Remove dead code + Logger fix in notification.service.ts

**Files:**
- Modify: `src/modules/notifications/notification.service.ts`

- [ ] **Step 1: Remove constructor console.log (line 24)**

Find and remove:
```typescript
        console.log('Instantiating NotificationService');
```

- [ ] **Step 2: Replace console.error in getTemplate (line ~43)**

Find:
```typescript
            console.error(`Template not found: ${templatePath}`);
```

Replace with:
```typescript
            this.logger.error(`Template not found: ${templatePath}`);
```

- [ ] **Step 3: Delete the commented-out sendNominatorVerificationEmail block (lines ~93–118)**

Remove the entire block:
```typescript
    // async sendNominatorVerificationEmail(data: {
    //     nomination: { nomineeName: string; nomineePosition: string };
    //     nominatorName: string;
    //     nominatorEmail: string;
    //     token: string;
    // }) {
    //     try {
    //         ...
    //     }
    // }
```

- [ ] **Step 4: Move getTemplate + getTemplatePath to EmailService**

In `src/modules/notifications/service/email.service.ts`, add the two private methods from `notification.service.ts`:
```typescript
    private getTemplatePath(templateName: string): string {
        if (process.env.NODE_ENV === 'development') {
            return path.join(process.cwd(), 'src', 'modules', 'notifications', 'templates', 'email', templateName);
        }
        return path.join(process.cwd(), 'dist', 'src', 'modules', 'notifications', 'templates', 'email', templateName);
    }

    async getTemplate(templateName: string): Promise<string> {
        const templatePath = this.getTemplatePath(templateName);
        try {
            return await fs.promises.readFile(templatePath, 'utf8');
        } catch (error) {
            this.logger.error(`Template not found: ${templatePath}`);
            throw new Error(`Template ${templateName} not found`);
        }
    }
```

Add to imports at top of email.service.ts:
```typescript
import * as path from 'node:path';
import * as fs from 'node:fs';
```

Then remove `getTemplate` and `getTemplatePath` from `notification.service.ts`, and remove the `path`/`fs` imports from that file.

- [ ] **Step 5: Verify**

```bash
grep -n "console\." src/modules/notifications/notification.service.ts
```

Expected: no output

---

### Task 8: Consolidate ec-consensus.service.ts

**Files:**
- Delete: `src/modules/admin/services/ec-consensus.service.ts`
- Modify: files in `src/modules/admin/` that import from the admin copy

The canonical service is `src/modules/common/utils/ec-consensus.service.ts`. The admin copy has one extra method (`canMemberVote`) that the common copy does not. Merge it first.

- [ ] **Step 1: Add canMemberVote to the common service**

In `src/modules/common/utils/ec-consensus.service.ts`, add this method after the imports, before `checkConsensus`:
```typescript
    async canMemberVote(reviewerId: string, nominationId: string): Promise<boolean> {
        const existingReview = await this.prisma.ecReview.findUnique({
            where: { nominationId_reviewerId: { nominationId, reviewerId } },
        });
        return !existingReview;
    }
```

Also add `getAllConsensusStatuses` from the admin copy if it's missing (the common copy already has it).

- [ ] **Step 2: Update all admin imports**

```bash
grep -rn "admin/services/ec-consensus" src/modules/admin/ --include="*.ts"
```

For each file found, change:
```typescript
import { EcConsensusService } from '../services/ec-consensus.service';
// or
import { EcConsensusService } from './ec-consensus.service';
```
to:
```typescript
import { EcConsensusService } from '../../common/utils/ec-consensus.service';
```

- [ ] **Step 3: Update admin.module.ts**

```bash
grep -n "EcConsensusService\|ec-consensus" src/modules/admin/admin.module.ts
```

Replace the import path for `EcConsensusService` to point to `../../common/utils/ec-consensus.service`.

- [ ] **Step 4: Delete the admin copy**

```bash
git rm src/modules/admin/services/ec-consensus.service.ts
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to EcConsensusService

---

### Task 9: Update Prisma schema — remove redundant relations

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Replace the User model**

Find and replace the `User` model:
```prisma
model User {
  id                    String          @id @default(uuid())
  name                  String
  email                 String          @unique
  phone                 String?         @unique
  password              String?
  role                  UserRole        @default(VOTER)
  programme             String?
  level                 String?
  subgroup              String?
  college               String?
  phoneVerified         Boolean         @default(false)
  emailVerifiedAt       DateTime?
  emailVerified         Boolean         @default(false)
  isActive              Boolean         @default(true)
  hasVoted              Boolean         @default(false)
  lastLoginAt           DateTime?
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  nominations           Nomination[]    @relation("Aspirant")
  ecReviews             EcReview[]      @relation("Reviewer")
  votingSessions        VotingSession[]
  auditLogs             AuditLog[]
  subgroupRef           Subgroup?       @relation(fields: [subgroupId], references: [id])
  subgroupId            String?
}
```

- [ ] **Step 2: Replace the Nomination model**

Find and replace the `Nomination` model:
```prisma
model Nomination {
  id                     String                  @id @default(cuid())
  aspirantId             String
  aspirant               User                    @relation("Aspirant", fields: [aspirantId], references: [id])
  nomineeName            String
  nomineeEmail           String
  nomineeContact         String
  nomineePosition        Candidate_Position
  photoUrl               String?
  photoPublicId          String?
  status                 NominationStatus        @default(PENDING)
  nomineeCollege         String
  nomineeDepartment      String
  nomineeDateOfBirth     DateTime
  nomineeHostel          String
  nomineeRoom            String
  nomineeSex             String
  nomineeCwa             String
  nomineeProgramme       String
  nomineeLevel           String
  nomineeParish          String
  nomineeNationality     String
  nomineeRegion          String
  nomineeSubgroups       String[]
  nomineeEducation       String[]
  hasLeadershipPosition  Boolean
  leadershipPositions    String[]
  hasServedCommittee     Boolean
  committees             String[]
  skills                 String[]
  visionForOffice        String[]
  knowledgeAboutOffice   String[]
  approvalCount          Int                     @default(0)
  rejectionCount         Int                     @default(0)
  reviewedAt             DateTime?
  rejectionReason        String?
  nominatorVerification  NominatorVerification?
  guarantorVerifications GuarantorVerification[]
  ecReviews              EcReview[]
  candidate              Candidate?
  createdAt              DateTime                @default(now())
  updatedAt              DateTime                @updatedAt
  subgroupRef            Subgroup?               @relation(fields: [subgroupId], references: [id])
  subgroupId             String?
}
```

- [ ] **Step 3: Replace NominatorVerification, GuarantorVerification, EcReview models**

Replace `NominatorVerification`:
```prisma
model NominatorVerification {
  id                String             @id @default(cuid())
  nominationId      String             @unique
  nomination        Nomination         @relation(fields: [nominationId], references: [id])
  name              String
  email             String
  contact           String
  programme         String
  level             String
  subgroup          String
  status            String             @default("PENDING")
  comments          String?
  verifiedAt        DateTime?
  declinedAt        DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}
```

Replace `GuarantorVerification`:
```prisma
model GuarantorVerification {
  id           String     @id @default(cuid())
  nominationId String
  nomination   Nomination @relation(fields: [nominationId], references: [id])
  name         String
  email        String
  contact      String
  programme    String
  subgroup     String
  status       String     @default("PENDING")
  comments     String?
  verifiedAt   DateTime?
  declinedAt   DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

Replace `EcReview`:
```prisma
model EcReview {
  id           String     @id @default(cuid())
  nominationId String
  nomination   Nomination @relation(fields: [nominationId], references: [id])
  reviewerId   String
  reviewer     User       @relation("Reviewer", fields: [reviewerId], references: [id])
  approved     Boolean
  comments     String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([nominationId, reviewerId])
}
```

- [ ] **Step 4: Validate schema**

```bash
npx prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`

---

### Task 10: Update Prisma schema — refactor VerificationToken

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add VerificationTargetType enum**

Add after the `TokenType` enum:
```prisma
enum VerificationTargetType {
  NOMINATOR
  GUARANTOR
}
```

- [ ] **Step 2: Replace the VerificationToken model**

```prisma
model VerificationToken {
  id               String                 @id @default(cuid())
  token            String                 @unique
  type             TokenType
  email            String?
  phone            String?
  expiresAt        DateTime
  used             Boolean                @default(false)
  createdAt        DateTime               @default(now())
  verificationId   String
  verificationType VerificationTargetType
}
```

- [ ] **Step 3: Validate schema**

```bash
npx prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`

---

### Task 11: Update app code for schema changes

**Files:**
- Modify: `src/modules/nominations/services/nomination.service.ts`
- Modify: `src/modules/nominations/services/nominator-verification.service.ts`

- [ ] **Step 1: Update token creation in nomination.service.ts**

Find the two token creation blocks (~lines 162–179) and replace:

Nominator token:
```typescript
        await this.prisma.verificationToken.create({
            data: {
                token: nominatorToken,
                type: 'NOMINATOR_VERIFICATION',
                email: nomination.nominatorVerification!.email,
                expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
                verificationId: nomination.nominatorVerification!.id,
                verificationType: 'NOMINATOR',
            },
        });
```

Guarantor tokens:
```typescript
        await this.prisma.verificationToken.createMany({
            data: guarantorTokens.map((token, index) => ({
                token,
                type: 'GUARANTOR_VERIFICATION',
                email: nomination.guarantorVerifications[index].email,
                expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
                verificationId: nomination.guarantorVerifications[index].id,
                verificationType: 'GUARANTOR' as const,
            })),
        });
```

- [ ] **Step 2: Update getPendingVerifications in nomination.service.ts**

Replace the entire `getPendingVerifications` method:
```typescript
    async getPendingVerifications() {
        const pendingTokens = await this.prisma.verificationToken.findMany({
            where: { expiresAt: { gt: new Date() }, used: false },
        });

        return Promise.all(
            pendingTokens.map(async (token) => {
                if (token.verificationType === 'NOMINATOR') {
                    const verification = await this.prisma.nominatorVerification.findUnique({
                        where: { id: token.verificationId },
                        include: {
                            nomination: { select: { nomineeName: true, nomineePosition: true } },
                        },
                    });
                    return { ...token, nominatorVerification: verification, guarantorVerification: null };
                } else {
                    const verification = await this.prisma.guarantorVerification.findUnique({
                        where: { id: token.verificationId },
                        include: {
                            nomination: { select: { nomineeName: true, nomineePosition: true } },
                        },
                    });
                    return { ...token, nominatorVerification: null, guarantorVerification: verification };
                }
            }),
        );
    }
```

- [ ] **Step 3: Update verifyNominator in nominator-verification.service.ts**

Replace the token query in `verifyNominator` (lines 18–33):
```typescript
        const tokenRecord = await this.prisma.verificationToken.findUnique({
            where: { token: verificationToken },
        });

        if (!tokenRecord || tokenRecord.verificationType !== 'NOMINATOR') {
            throw new BadRequestException('Invalid verification token');
        }

        if (tokenRecord.expiresAt < new Date()) {
            throw new BadRequestException('Verification token has expired');
        }

        const nominatorVerification = await this.prisma.nominatorVerification.findUnique({
            where: { id: tokenRecord.verificationId },
            include: {
                nomination: {
                    include: {
                        aspirant: true,
                        nominatorVerification: true,
                        guarantorVerifications: true,
                    },
                },
            },
        });

        if (!nominatorVerification) {
            throw new BadRequestException('Invalid verification token');
        }
```

Then replace the `if (!verificationRecord || !verificationRecord.nominatorVerification)` check with:
```typescript
        if (!nominatorVerification) {
            throw new BadRequestException('Invalid verification token');
        }
```

And update remaining references: `verificationRecord.nominatorVerification` → `nominatorVerification`, `verificationRecord.expiresAt` → `tokenRecord.expiresAt`.

- [ ] **Step 4: Update getVerificationDetails in nominator-verification.service.ts**

Replace the query in `getVerificationDetails` (lines 79–113):
```typescript
        const tokenRecord = await this.prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!tokenRecord || tokenRecord.verificationType !== 'NOMINATOR') {
            throw new BadRequestException('Invalid verification token');
        }

        const nominatorVerification = await this.prisma.nominatorVerification.findUnique({
            where: { id: tokenRecord.verificationId },
            include: {
                nomination: {
                    include: {
                        aspirant: { select: { id: true, name: true, phone: true, email: true } },
                        nominatorVerification: { select: { name: true, status: true, verifiedAt: true } },
                        guarantorVerifications: { select: { name: true, status: true, verifiedAt: true } },
                    },
                },
            },
        });

        if (!nominatorVerification) {
            throw new BadRequestException('Invalid verification token');
        }

        const isExpired = tokenRecord.expiresAt < new Date();
        if (isExpired) {
            throw new BadRequestException('Verification token has expired');
        }

        return {
            nomination: nominatorVerification.nomination,
            nominatorName: nominatorVerification.name,
            nominatorEmail: nominatorVerification.email,
            tokenType: TokenType.NOMINATOR_VERIFICATION,
            isExpired,
            isAlreadyVerified: nominatorVerification.status !== VerificationStatus.PENDING,
            verificationStatus: nominatorVerification.status,
        };
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Fix any remaining type errors from schema field renames (e.g., `.VotingSession` → `.votingSessions`, `.AuditLog` → `.auditLogs`).

---

### Task 12: Generate fresh migration and Commit 1

- [ ] **Step 1: Generate migration**

```bash
npx prisma migrate dev --name init_clean
```

Expected: Migration created and applied. Prisma Client regenerated.

- [ ] **Step 2: Verify app starts**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit Phase 1**

```bash
git add -A
git commit -m "refactor: security sweep, Logger migration, schema cleanup

- Fix .gitignore, untrack dist/
- Remove JWT_SECRET console.log (security)
- Delete root debug scripts with hardcoded credentials
- Replace all console.log with NestJS Logger across 8 files
- Remove dead commented code in nomination and notification services
- Consolidate EcConsensusService to common/utils
- Remove redundant dual User relations from Nomination, EcReview,
  NominatorVerification, GuarantorVerification
- Rename PascalCase Prisma relation fields to camelCase
- Refactor VerificationToken to polymorphic FK (verificationId + verificationType)
- Update all app code to match new schema"
```

---

## Phase 2 — Architecture Decomposition

---

### Task 13: Create OtpService

**Files:**
- Create: `src/modules/voting/services/otp.service.ts`

- [ ] **Step 1: Create the services subdirectory and file**

```bash
mkdir -p src/modules/voting/services
```

Create `src/modules/voting/services/otp.service.ts`:
```typescript
import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHash } from 'crypto';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';
import { SseEventType } from '../../real-time/enums/sse-event-types.enum';
import { GenerateOtpDto } from '../dto/generate-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly realTimeService: RealTimeService,
    ) {}

    async generateOtp(dto: GenerateOtpDto): Promise<any> {
        const { phoneNumber, name, email } = dto;

        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser?.hasVoted) {
            throw new ConflictException('You have already voted in this election');
        }

        const apiKey = this.configService.get('ARKESEL_API_KEY');
        if (!apiKey) {
            throw new BadRequestException('SMS service is not configured');
        }

        const data = {
            expiry: 5,
            length: 6,
            medium: 'sms',
            message: 'Your Pax Romana KNUST voting OTP is %otp_code%. Valid for 5 minutes.',
            number: phoneNumber,
            sender_id: 'VotingApp',
            type: 'numeric',
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post('https://sms.arkesel.com/api/otp/generate', data, {
                    headers: { 'api-key': apiKey },
                }),
            );

            if (response.data.code === '1000') {
                await this.cacheService.setSmsCode(phoneNumber, JSON.stringify({
                    name,
                    email,
                    timestamp: Date.now(),
                    status: 'PENDING',
                }));

                this.realTimeService.broadcastToAdmins({
                    type: SseEventType.SYSTEM_STATUS,
                    data: {
                        action: 'OTP_GENERATED',
                        phoneNumber: phoneNumber.slice(-4),
                        email: email.split('@')[0] + '@***',
                        timestamp: new Date(),
                    },
                    timestamp: new Date(),
                });

                return {
                    message: 'OTP sent successfully to ' + phoneNumber,
                    ussd_code: response.data.ussd_code,
                    expiresIn: '5 minutes',
                };
            } else {
                throw new BadRequestException(`Failed to generate OTP: ${response.data.message}`);
            }
        } catch (error) {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'OTP_GENERATION_FAILED',
                    phoneNumber: phoneNumber.slice(-4),
                    error: error.message,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            if (error.response?.status === 401) {
                throw new BadRequestException('SMS service authentication failed');
            }
            throw new BadRequestException(`Error generating OTP: ${error.message}`);
        }
    }

    async verifyOtp(dto: VerifyOtpDto): Promise<any> {
        const { phoneNumber, otp, email } = dto;

        const apiKey = this.configService.get('ARKESEL_API_KEY');
        const data = { number: phoneNumber, otp };

        try {
            const response = await firstValueFrom(
                this.httpService.post('https://sms.arkesel.com/api/otp/verify', data, {
                    headers: { 'api-key': apiKey },
                }),
            );

            if (response.data.code !== '1000') {
                this.realTimeService.broadcastToAdmins({
                    type: SseEventType.SYSTEM_STATUS,
                    data: {
                        action: 'OTP_VERIFICATION_FAILED',
                        phoneNumber: phoneNumber.slice(-4),
                        reason: 'Invalid or expired OTP',
                        timestamp: new Date(),
                    },
                    timestamp: new Date(),
                });
                throw new BadRequestException('Invalid or expired OTP');
            }

            const cachedData = await this.cacheService.getSmsCode(phoneNumber);
            if (!cachedData) {
                throw new NotFoundException('OTP session not found or expired');
            }

            const otpData = JSON.parse(cachedData);
            if (otpData.email !== email) {
                throw new BadRequestException('Email mismatch with OTP request');
            }

            const phoneHash = createHash('sha256').update(phoneNumber).digest('hex');

            let user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        name: otpData.name,
                        email,
                        phone: phoneNumber,
                        phoneVerified: true,
                        role: 'VOTER',
                    },
                });
            } else if (user.hasVoted) {
                throw new ConflictException('You have already voted in this election');
            }

            const sessionId = createHash('sha256')
                .update(`${phoneNumber}_${Date.now()}_${Math.random()}`)
                .digest('hex');

            const votingSession = await this.prisma.votingSession.create({
                data: {
                    sessionId,
                    voterHash: phoneHash,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                },
            });

            await this.cacheService.setVotingSession(phoneHash, {
                sessionId,
                userId: user.id,
                email: user.email,
                name: user.name,
                createdAt: votingSession.createdAt,
                voterHash: '',
                currentStep: 0,
                isValid: false,
            });

            await this.cacheService.clearSmsCode(phoneNumber);

            const connectionStats = this.realTimeService.getConnectionStats();
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'VOTER_LOGIN_SUCCESS',
                    voterName: user.name.split(' ')[0] + ' ***',
                    sessionId: sessionId.slice(0, 8) + '***',
                    activeVotingSessions: connectionStats.totalConnections + 1,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            return {
                message: 'OTP verified successfully',
                sessionId,
                voter: { name: user.name, email: user.email },
                expiresAt: votingSession.expiresAt,
            };
        } catch (error) {
            throw new BadRequestException(`Error verifying OTP: ${error.message}`);
        }
    }
}
```

---

### Task 14: Create VoteSubmissionService

**Files:**
- Create: `src/modules/voting/services/vote-submission.service.ts`

- [ ] **Step 1: Create the file**

Create `src/modules/voting/services/vote-submission.service.ts`:
```typescript
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';
import { VotingStatsService } from '../../real-time/services/voting-stats.service';
import { AnomalyDetectionService } from '../../real-time/services/anomaly-detection.service';
import { SseEventType } from '../../real-time/enums/sse-event-types.enum';
import { UserRole } from '@prisma/client';
import { SubmitVoteDto } from '../dto/submit-vote.dto';

@Injectable()
export class VoteSubmissionService {
    private readonly logger = new Logger(VoteSubmissionService.name);
    private readonly encryptionKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly realTimeService: RealTimeService,
        private readonly votingStatsService: VotingStatsService,
        private readonly anomalyDetectionService: AnomalyDetectionService,
    ) {
        this.encryptionKey =
            this.configService.get('VOTE_ENCRYPTION_KEY') ||
            '3041a8efad5e974cc27bc09cf57c8ad8555f80958f4c1d27b7f4d68d5b3c8de6';
    }

    async getBallot(): Promise<any> {
        const cachedBallot = await this.cacheService.getBallot();
        if (cachedBallot) return cachedBallot;

        const candidates = await this.prisma.candidate.findMany({
            where: { isActive: true },
            include: {
                nomination: {
                    select: {
                        nomineeCollege: true,
                        nomineeDepartment: true,
                        nomineeProgramme: true,
                        nomineeLevel: true,
                        visionForOffice: true,
                    },
                },
            },
            orderBy: [{ position: 'asc' }, { candidateNumber: 'asc' }],
        });

        const ballot = candidates.reduce((acc, candidate) => {
            const position = candidate.position;
            if (!acc[position]) acc[position] = [];
            acc[position].push({
                id: candidate.id,
                name: candidate.name,
                candidateNumber: candidate.candidateNumber,
                photoUrl: candidate.photoUrl,
                biography: candidate.biography,
                college: candidate.nomination?.nomineeCollege,
                department: candidate.nomination?.nomineeDepartment,
                programme: candidate.nomination?.nomineeProgramme,
                level: candidate.nomination?.nomineeLevel,
                vision: candidate.nomination?.visionForOffice,
            });
            return acc;
        }, {});

        const ballotResponse = {
            ballot,
            totalPositions: Object.keys(ballot).length,
            totalCandidates: candidates.length,
            instructions: [
                'Vote for ONE candidate per position',
                "You can skip positions you don't want to vote for",
                'Review your selections before submitting',
                'Once submitted, your vote cannot be changed',
            ],
        };

        await this.cacheService.setBallot(ballotResponse);
        return ballotResponse;
    }

    async validateSession(sessionId: string): Promise<any> {
        const session = await this.prisma.votingSession.findUnique({
            where: { sessionId },
            include: { user: true },
        });

        if (!session) {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: { action: 'INVALID_SESSION_ACCESS', sessionId: sessionId.slice(0, 8) + '***', timestamp: new Date() },
                timestamp: new Date(),
            });
            throw new NotFoundException('Session not found');
        }

        if (session.expiresAt < new Date()) {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: { action: 'EXPIRED_SESSION_ACCESS', sessionId: sessionId.slice(0, 8) + '***', userId: session.user.id, timestamp: new Date() },
                timestamp: new Date(),
            });
            throw new ForbiddenException('Session expired');
        }

        if (session.user.hasVoted) {
            throw new ConflictException('User has already voted');
        }

        return {
            valid: true,
            user: { name: session.user.name, email: session.user.email },
            expiresAt: session.expiresAt,
            timeRemaining: Math.max(0, session.expiresAt.getTime() - Date.now()),
        };
    }

    async submitVote(dto: SubmitVoteDto): Promise<any> {
        const { sessionId, votes } = dto;

        const session = await this.prisma.votingSession.findUnique({
            where: { sessionId },
            include: { user: true },
        });

        if (!session) throw new NotFoundException('Invalid voting session');
        if (session.expiresAt < new Date()) throw new ForbiddenException('Voting session has expired');
        if (session.user.hasVoted) throw new ConflictException('You have already submitted your vote');

        const candidateIds = Object.values(votes);
        const validCandidates = await this.prisma.candidate.findMany({
            where: { id: { in: candidateIds }, isActive: true },
        });

        if (validCandidates.length !== candidateIds.length) {
            throw new BadRequestException('One or more selected candidates are invalid');
        }

        try {
            const encryptedVote = CryptoJS.AES.encrypt(
                JSON.stringify(votes),
                this.encryptionKey,
            ).toString();

            const result = await this.prisma.$transaction(async (tx) => {
                const vote = await tx.vote.create({
                    data: { encryptedVote, voterHash: session.voterHash, sessionId: session.id },
                });
                await tx.user.update({ where: { id: session.userId }, data: { hasVoted: true } });
                await tx.votingSession.update({
                    where: { id: session.id },
                    data: { status: 'COMPLETED', endTime: new Date() },
                });
                for (const candidateId of candidateIds) {
                    await tx.candidate.update({
                        where: { id: candidateId },
                        data: { voteCount: { increment: 1 } },
                    });
                }
                return vote;
            });

            await this.votingStatsService.clearStatsCache();
            const updatedStats = await this.votingStatsService.getVotingProgress();

            this.realTimeService.broadcast({
                type: SseEventType.VOTING_PROGRESS,
                data: { totalVotes: updatedStats.totalVotes, turnoutPercentage: updatedStats.turnoutPercentage, lastUpdated: new Date() },
                timestamp: new Date(),
            });

            this.realTimeService.broadcastToAdmins({
                type: SseEventType.POSITION_UPDATE,
                data: {
                    voteEvent: {
                        voteId: result.id,
                        timestamp: result.createdAt,
                        positionsVoted: Object.keys(votes).length,
                        voterHash: session.voterHash.slice(0, 8) + '***',
                    },
                    updatedStatistics: updatedStats,
                    velocityData: await this.votingStatsService.getVotingVelocity(),
                },
                timestamp: new Date(),
            });

            for (const position of Object.keys(votes)) {
                const positionStats = await this.votingStatsService.getPositionStats(position as any);
                this.realTimeService.broadcastToAdmins({
                    type: SseEventType.POSITION_UPDATE,
                    data: { position, stats: positionStats, lastVoteTime: new Date() },
                    timestamp: new Date(),
                });
            }

            if (await this.anomalyDetectionService.shouldRunDetection()) {
                try {
                    const anomalies = await this.anomalyDetectionService.detectAnomalies();
                    if (anomalies.length > 0) {
                        this.realTimeService.broadcastToRole({
                            type: SseEventType.ANOMALY_ALERT,
                            data: { anomalies, triggeredBy: 'VOTE_SUBMISSION', voteId: result.id },
                            timestamp: new Date(),
                        }, UserRole.SUPER_ADMIN);
                    }
                } catch (anomalyError) {
                    this.logger.error('Anomaly detection failed', anomalyError);
                }
            }

            const connectionStats = this.realTimeService.getConnectionStats();
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'VOTE_SUBMITTED_SUCCESS',
                    totalVotes: updatedStats.totalVotes,
                    turnoutPercentage: updatedStats.turnoutPercentage,
                    activeConnections: connectionStats.totalConnections,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            await this.cacheService.deleteVotingSession(session.voterHash);
            await this.prisma.auditLog.create({
                data: {
                    action: 'VOTE_SUBMITTED',
                    entity: 'Vote',
                    entityId: result.id,
                    userId: session.userId,
                    newValues: { positions: Object.keys(votes).length, timestamp: new Date() },
                },
            });

            return {
                message: 'Vote submitted successfully',
                voteId: result.id,
                timestamp: result.createdAt,
                positionsVoted: Object.keys(votes).length,
                instructions: [
                    'Your vote has been securely recorded',
                    'Please proceed to the ink verification station',
                    'Thank you for participating in the election',
                ],
            };
        } catch (error) {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: { action: 'VOTE_SUBMISSION_FAILED', sessionId: sessionId.slice(0, 8) + '***', error: error.message, timestamp: new Date() },
                timestamp: new Date(),
            });
            throw new BadRequestException(`Error submitting vote: ${error.message}`);
        }
    }
}
```

---

### Task 15: Create VotingAdminService

**Files:**
- Create: `src/modules/voting/services/voting-admin.service.ts`

- [ ] **Step 1: Create the file**

Create `src/modules/voting/services/voting-admin.service.ts`:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';
import { VotingStatsService } from '../../real-time/services/voting-stats.service';
import { AnomalyDetectionService } from '../../real-time/services/anomaly-detection.service';
import { SseEventType } from '../../real-time/enums/sse-event-types.enum';
import { Candidate_Position } from '@prisma/client';
import * as csvWriter from 'csv-writer';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class VotingAdminService {
    private readonly logger = new Logger(VotingAdminService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly realTimeService: RealTimeService,
        private readonly votingStatsService: VotingStatsService,
        private readonly anomalyDetectionService: AnomalyDetectionService,
    ) {}

    async pauseVoting(reason: string, pausedBy: string): Promise<void> {
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSED' },
            update: { value: 'true', updatedAt: new Date() },
            create: { key: 'VOTING_PAUSED', value: 'true', type: 'boolean' },
        });
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSE_REASON' },
            update: { value: reason, updatedAt: new Date() },
            create: { key: 'VOTING_PAUSE_REASON', value: reason, type: 'string' },
        });
        await this.prisma.auditLog.create({
            data: { action: 'VOTING_PAUSED', entity: 'System', newValues: { reason, pausedBy, timestamp: new Date() } },
        });
        this.realTimeService.broadcast({
            type: SseEventType.SYSTEM_STATUS,
            data: { status: 'VOTING_PAUSED', reason, pausedBy, message: 'Voting has been temporarily paused by administrators', timestamp: new Date() },
            timestamp: new Date(),
        });
    }

    async resumeVoting(reason: string, resumedBy: string): Promise<void> {
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_PAUSED' },
            update: { value: 'false', updatedAt: new Date() },
            create: { key: 'VOTING_PAUSED', value: 'false', type: 'boolean' },
        });
        await this.prisma.systemConfig.upsert({
            where: { key: 'VOTING_RESUME_REASON' },
            update: { value: reason, updatedAt: new Date() },
            create: { key: 'VOTING_RESUME_REASON', value: reason, type: 'string' },
        });
        await this.prisma.auditLog.create({
            data: { action: 'VOTING_RESUMED', entity: 'System', newValues: { reason, resumedBy, timestamp: new Date() } },
        });
        this.realTimeService.broadcast({
            type: SseEventType.SYSTEM_STATUS,
            data: { status: 'VOTING_RESUMED', reason, resumedBy, message: 'Voting has been resumed', timestamp: new Date() },
            timestamp: new Date(),
        });
    }

    async getActiveSessions(): Promise<any> {
        const now = new Date();
        const sessions = await this.prisma.votingSession.findMany({
            where: { status: 'ACTIVE', expiresAt: { gt: now } },
            select: {
                id: true, sessionId: true, voterHash: true, status: true, startTime: true, expiresAt: true,
                user: { select: { name: true, email: true, hasVoted: true } },
            },
            orderBy: { startTime: 'desc' },
        });
        return {
            activeSessions: sessions.map((s) => ({
                sessionId: s.sessionId.slice(0, 8) + '***',
                voterHash: s.voterHash.slice(0, 8) + '***',
                voterName: s.user.name.split(' ')[0] + ' ***',
                status: s.status,
                startTime: s.startTime,
                expiresAt: s.expiresAt,
                timeRemaining: Math.max(0, s.expiresAt.getTime() - now.getTime()),
                hasVoted: s.user.hasVoted,
            })),
            totalActive: sessions.length,
            lastUpdated: now,
        };
    }

    async getAnomalies(): Promise<any> {
        return this.anomalyDetectionService.detectAnomalies();
    }

    async getSystemHealth(): Promise<any> {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

        return this.prisma.$transaction(async (tx) => {
            const recentVotes = await tx.vote.count({ where: { createdAt: { gte: oneMinuteAgo }, isValid: true } });
            const activeSessions = await tx.votingSession.count({ where: { status: 'ACTIVE', expiresAt: { gt: now } } });
            const failedVotes = await tx.vote.count({ where: { createdAt: { gte: fiveMinutesAgo }, isValid: false } });
            const cacheHealthy = await this.checkCacheHealth();
            return {
                database: { connected: true, responseTime: 'Good' },
                voting: { recentActivity: recentVotes, activeSessions, failedVotes },
                cache: { healthy: cacheHealthy, status: cacheHealthy ? 'Connected' : 'Disconnected' },
                realTime: { connections: this.realTimeService.getConnectionStats() },
                overall: 'HEALTHY',
                lastChecked: now,
            };
        });
    }

    async getVotingAnalytics(options: { timeframe: string; position?: Candidate_Position; requestedBy: string }): Promise<any> {
        const { timeframe, position, requestedBy } = options;
        const now = new Date();
        let startDate: Date;

        switch (timeframe) {
            case 'hour': startDate = new Date(now.getTime() - 60 * 60 * 1000); break;
            case 'day': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
            default: startDate = new Date(0);
        }

        const analytics = await this.prisma.$transaction(async (tx) => {
            const voteTimeline = await tx.vote.findMany({
                where: { createdAt: { gte: startDate }, isValid: true },
                select: { createdAt: true, voterHash: true },
                orderBy: { createdAt: 'asc' },
            });
            const hourlyBreakdown = this.groupVotesByHour(voteTimeline);
            const positionData = position
                ? await this.votingStatsService.getPositionStats(position)
                : null;
            const velocity = await this.votingStatsService.getVotingVelocity();
            const activeSessions = await tx.votingSession.count({ where: { status: 'ACTIVE', expiresAt: { gt: now } } });
            return { timeframe, dateRange: { from: startDate, to: now }, totalVotes: voteTimeline.length, hourlyBreakdown, velocity, activeSessions, positionData, requestedBy, generatedAt: now };
        });

        await this.prisma.auditLog.create({
            data: { action: 'ANALYTICS_REQUESTED', entity: 'VotingAnalytics', newValues: { timeframe, position: position || null, requestedBy } },
        });

        return analytics;
    }

    async exportVotingData(options: { format: string; includePersonalData: boolean; exportedBy: string }): Promise<any> {
        const { format, includePersonalData, exportedBy } = options;

        await this.prisma.auditLog.create({
            data: { action: 'DATA_EXPORT_REQUESTED', entity: 'VotingData', newValues: { format, includePersonalData, exportedBy, timestamp: new Date() } },
        });

        const exportData = await this.prisma.$transaction(async (tx) => {
            const stats = await this.votingStatsService.getVotingProgress();
            const votes = await tx.vote.findMany({
                where: { isValid: true },
                select: { id: true, encryptedVote: includePersonalData, voterHash: true, submissionTime: true, createdAt: true },
                orderBy: { createdAt: 'asc' },
            });
            const candidates = await tx.candidate.findMany({
                where: { isActive: true },
                include: { nomination: { select: { nomineeCollege: true, nomineeDepartment: true, nomineeProgramme: true, nomineeLevel: true } } },
                orderBy: [{ position: 'asc' }, { candidateNumber: 'asc' }],
            });
            const userStats = await tx.user.groupBy({ by: ['role', 'hasVoted'], _count: { id: true } });
            return {
                exportInfo: { generatedBy: exportedBy, generatedAt: new Date(), format, includesPersonalData: includePersonalData, totalRecords: { votes: votes.length, candidates: candidates.length, users: userStats.reduce((s, x) => s + x._count.id, 0) } },
                votingStatistics: stats,
                votes: includePersonalData ? votes : votes.map((v) => ({ id: v.id, voterHash: v.voterHash.slice(0, 8) + '***', submissionTime: v.submissionTime, createdAt: v.createdAt })),
                candidates,
                userStatistics: userStats,
            };
        });

        if (format === 'csv') return this.generateCSVExport(exportData);
        return exportData;
    }

    private groupVotesByHour(votes: Array<{ createdAt: Date }>): Array<{ hour: Date; count: number }> {
        const grouped = new Map<string, number>();
        votes.forEach((vote) => {
            const hour = new Date(vote.createdAt);
            hour.setMinutes(0, 0, 0);
            const key = hour.toISOString();
            grouped.set(key, (grouped.get(key) || 0) + 1);
        });
        return Array.from(grouped.entries())
            .map(([h, count]) => ({ hour: new Date(h), count }))
            .sort((a, b) => a.hour.getTime() - b.hour.getTime());
    }

    private async checkCacheHealth(): Promise<boolean> {
        try {
            const testKey = 'health_check_' + Date.now();
            await this.cacheService.set(testKey, 'test', 1);
            const retrieved = await this.cacheService.get(testKey);
            await this.cacheService.del(testKey);
            return retrieved === 'test';
        } catch {
            return false;
        }
    }

    private async generateCSVExport(data: any): Promise<any> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportDir = join(process.cwd(), 'exports');
        await fs.mkdir(exportDir, { recursive: true });
        const files: string[] = [];

        const summaryPath = join(exportDir, `voting-summary-${timestamp}.csv`);
        await csvWriter.createObjectCsvWriter({
            path: summaryPath,
            header: [{ id: 'metric', title: 'Metric' }, { id: 'value', title: 'Value' }, { id: 'description', title: 'Description' }],
        }).writeRecords([
            { metric: 'Total Votes', value: data.votingStatistics.totalVotes, description: 'Total valid votes cast' },
            { metric: 'Turnout Percentage', value: `${data.votingStatistics.turnoutPercentage}%`, description: 'Percentage of eligible voters who voted' },
            { metric: 'Export Generated By', value: data.exportInfo.generatedBy, description: 'User who generated this export' },
            { metric: 'Export Generated At', value: data.exportInfo.generatedAt.toISOString(), description: 'Timestamp of export' },
        ]);
        files.push(summaryPath);

        const candidatesPath = join(exportDir, `candidates-${timestamp}.csv`);
        await csvWriter.createObjectCsvWriter({
            path: candidatesPath,
            header: [
                { id: 'name', title: 'Candidate Name' }, { id: 'position', title: 'Position' },
                { id: 'candidateNumber', title: 'Candidate Number' }, { id: 'voteCount', title: 'Vote Count' },
                { id: 'college', title: 'College' }, { id: 'department', title: 'Department' },
            ],
        }).writeRecords(data.candidates.map((c) => ({
            name: c.name, position: c.position, candidateNumber: c.candidateNumber, voteCount: c.voteCount,
            college: c.nomination?.nomineeCollege || 'N/A', department: c.nomination?.nomineeDepartment || 'N/A',
        })));
        files.push(candidatesPath);

        return {
            format: 'csv',
            files: files.map((p) => ({ name: p.split('/').pop(), path: p })),
            summary: { totalFiles: files.length, generatedAt: new Date(), includesPersonalData: data.exportInfo.includesPersonalData, exportedBy: data.exportInfo.generatedBy },
        };
    }
}
```

---

### Task 16: Refactor VotingService to thin facade

**Files:**
- Modify: `src/modules/voting/voting.service.ts`

- [ ] **Step 1: Replace voting.service.ts entirely**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../db';
import { VotingStatsService } from '../real-time/services/voting-stats.service';
import { RealTimeService } from '../real-time/services/real-time.service';
import { SseEventType } from '../real-time/enums/sse-event-types.enum';
import { Candidate_Position, UserRole } from '@prisma/client';

@Injectable()
export class VotingService {
    private readonly logger = new Logger(VotingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly votingStatsService: VotingStatsService,
        private readonly realTimeService: RealTimeService,
    ) {}

    async getVotingStats(): Promise<any> {
        try {
            const realtimeStats = await this.votingStatsService.getVotingProgress();
            const velocityData = await this.votingStatsService.getVotingVelocity();
            return { ...realtimeStats, velocity: velocityData, systemInfo: { cacheEnabled: true, realTimeEnabled: true, lastRefresh: new Date() } };
        } catch {
            return this.prisma.$transaction(async (tx) => {
                const totalVoters = await tx.user.count({ where: { role: 'VOTER' } });
                const votedCount = await tx.user.count({ where: { role: 'VOTER', hasVoted: true } });
                const totalVotes = await tx.vote.count();
                const candidateStats = await tx.candidate.findMany({
                    select: { id: true, name: true, position: true, voteCount: true },
                    orderBy: [{ position: 'asc' }, { voteCount: 'desc' }],
                });
                return { totalVoters, votedCount, totalVotes, turnoutPercentage: totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0, candidateStats };
            });
        }
    }

    async getVotingTimeline(): Promise<any> {
        const timeline = await this.prisma.electionTimeline.findMany({ orderBy: { startDate: 'asc' } });
        const now = new Date();
        const currentPhase = timeline.find((p) => p.startDate <= now && p.endDate >= now && p.isActive);
        return {
            timeline: timeline.map((p) => ({
                phase: p.phase, startDate: p.startDate, endDate: p.endDate, isActive: p.isActive,
                isCurrent: p.id === currentPhase?.id,
                status: p.endDate < now ? 'COMPLETED' : p.startDate > now ? 'UPCOMING' : 'ACTIVE',
            })),
            currentPhase: currentPhase?.phase || 'UNKNOWN',
            nextPhase: timeline.find((p) => p.startDate > now),
            lastUpdated: now,
        };
    }

    async getPublicDashboardData(): Promise<any> {
        const stats = await this.votingStatsService.getVotingProgress();
        return {
            totalVotes: stats.totalVotes,
            turnoutPercentage: stats.turnoutPercentage,
            positionSummary: stats.positionStats.map((p) => ({ position: p.position, totalVotes: p.totalVotes, candidateCount: p.candidates.length })),
            votingStatus: await this.getVotingStats(),
            lastUpdated: stats.lastUpdated,
            systemStatus: 'ACTIVE',
        };
    }

    async refreshAndBroadcastStats(): Promise<void> {
        try {
            await this.votingStatsService.clearStatsCache();
            const updatedStats = await this.votingStatsService.getVotingProgress();
            this.realTimeService.broadcast({ type: SseEventType.VOTING_PROGRESS, data: updatedStats, timestamp: new Date() });
            this.realTimeService.broadcastToAdmins({ type: SseEventType.SYSTEM_STATUS, data: { action: 'MANUAL_STATS_REFRESH', statistics: updatedStats, timestamp: new Date() }, timestamp: new Date() });
        } catch (error) {
            this.realTimeService.broadcastToAdmins({ type: SseEventType.SYSTEM_STATUS, data: { action: 'STATS_REFRESH_FAILED', error: error.message, timestamp: new Date() }, timestamp: new Date() });
        }
    }

    async getRealtimeConnectionInfo(): Promise<any> {
        return {
            connections: this.realTimeService.getConnectionStats(),
            votingProgress: await this.votingStatsService.getVotingProgress(),
            systemStatus: 'HEALTHY',
            lastUpdated: new Date(),
        };
    }

    async broadcastMessage(message: string, role: UserRole, type: SseEventType = SseEventType.SYSTEM_STATUS): Promise<void> {
        this.realTimeService.broadcastToRole({ type, data: { message, timestamp: new Date(), source: 'VOTING_SERVICE' }, timestamp: new Date() }, role);
    }

    async getPositionStats(position: Candidate_Position): Promise<any> {
        return this.votingStatsService.getPositionStats(position);
    }

    async getVotingVelocity(): Promise<any> {
        return this.votingStatsService.getVotingVelocity();
    }
}
```

---

### Task 17: Update VotingModule and VotingController

**Files:**
- Modify: `src/modules/voting/voting.module.ts`
- Modify: `src/modules/voting/voting.controller.ts`

- [ ] **Step 1: Update voting.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '../caches/cache.module';
import { DbModule } from '../../../db';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';
import { OtpService } from './services/otp.service';
import { VoteSubmissionService } from './services/vote-submission.service';
import { VotingAdminService } from './services/voting-admin.service';
import { RealTimeModule } from '../real-time/real-time.module';
import { ResultsModule } from '../results/results.module';

@Module({
    imports: [HttpModule, DbModule, CacheModule, RealTimeModule, ResultsModule],
    controllers: [VotingController],
    providers: [VotingService, OtpService, VoteSubmissionService, VotingAdminService],
    exports: [VotingService, OtpService, VoteSubmissionService, VotingAdminService],
})
export class VotingModule {}
```

- [ ] **Step 2: Update voting.controller.ts constructor and method calls**

Update the constructor:
```typescript
constructor(
    private readonly votingService: VotingService,
    private readonly otpService: OtpService,
    private readonly voteSubmissionService: VoteSubmissionService,
    private readonly votingAdminService: VotingAdminService,
) {}
```

Add imports at the top:
```typescript
import { OtpService } from './services/otp.service';
import { VoteSubmissionService } from './services/vote-submission.service';
import { VotingAdminService } from './services/voting-admin.service';
```

Update method calls:
- `this.votingService.generateOtp(dto)` → `this.otpService.generateOtp(dto)`
- `this.votingService.verifyOtp(dto)` → `this.otpService.verifyOtp(dto)`
- `this.votingService.getBallot()` → `this.voteSubmissionService.getBallot()`
- `this.votingService.submitVote(dto)` → `this.voteSubmissionService.submitVote(dto)`
- `this.votingService.validateSession(sessionId)` → `this.voteSubmissionService.validateSession(sessionId)`
- `this.votingService.getVotingAnalytics(...)` → `this.votingAdminService.getVotingAnalytics(...)`
- `this.votingService.getSystemHealth()` → `this.votingAdminService.getSystemHealth()`
- `this.votingService.getAnomalies()` → `this.votingAdminService.getAnomalies()`
- `this.votingService.pauseVoting(...)` → `this.votingAdminService.pauseVoting(...)`
- `this.votingService.resumeVoting(...)` → `this.votingAdminService.resumeVoting(...)`
- `this.votingService.getActiveSessions()` → `this.votingAdminService.getActiveSessions()`
- `this.votingService.exportVotingData(...)` → `this.votingAdminService.exportVotingData(...)`

Leave on `votingService`: `getVotingStats`, `getPositionStats`, `getRealtimeConnectionInfo`, `refreshAndBroadcastStats`, `broadcastMessage`, `getVotingVelocity`, `getVotingTimeline`, `getPublicDashboardData`

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit Phase 2**

```bash
git add -A
git commit -m "refactor: decompose voting service into focused sub-services

- Extract OtpService (OTP generation and verification with Arkesel)
- Extract VoteSubmissionService (ballot, vote submission, session validation)
- Extract VotingAdminService (pause/resume, sessions, export, analytics, health)
- Reduce VotingService to thin facade (stats, timeline, realtime, dashboard)
- Update VotingModule to register all 4 services
- Update VotingController to inject correct service per endpoint group
- Move template helpers to EmailService"
```

---

## Phase 3 — Tests

> **NestJS provider token pattern (applies to all test files below):**
> NestJS DI resolves providers by class reference, not string. Every `{ provide: 'ClassName', useValue: mock }` in the tasks below must be replaced with the actual imported class:
> ```typescript
> import { PrismaService } from '../../../../db';
> import { CacheService } from '../../caches/cache.service';
> import { RealTimeService } from '../../real-time/services/real-time.service';
> import { VotingStatsService } from '../../real-time/services/voting-stats.service';
> import { AnomalyDetectionService } from '../../real-time/services/anomaly-detection.service';
> import { MnotifySmsService } from './service/mnotify-sms.service';
> import { EmailService } from './service/email.service';
> import { NotificationQueueService } from './service/notification-queue.service';
> import { AdminNotificationsService } from './service/admin-notifications.service';
> // Then use the class as the token:
> { provide: PrismaService, useValue: mockPrisma }
> ```
> Add the relevant imports to each test file and swap the string tokens for class references.

---

### Task 18: Tests for OtpService

**Files:**
- Create: `src/modules/voting/services/otp.service.spec.ts`

- [ ] **Step 1: Write the test file**

Create `src/modules/voting/services/otp.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

const mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    votingSession: { create: jest.fn() },
};
const mockCacheService = {
    setSmsCode: jest.fn(),
    getSmsCode: jest.fn(),
    clearSmsCode: jest.fn(),
    setVotingSession: jest.fn(),
};
const mockRealTimeService = { broadcastToAdmins: jest.fn(), getConnectionStats: jest.fn().mockReturnValue({ totalConnections: 0 }) };
const mockHttpService = { post: jest.fn() };
const mockConfigService = { get: jest.fn() };

describe('OtpService', () => {
    let service: OtpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OtpService,
                { provide: 'PrismaService', useValue: mockPrisma },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: HttpService, useValue: mockHttpService },
                { provide: 'CacheService', useValue: mockCacheService },
                { provide: 'RealTimeService', useValue: mockRealTimeService },
            ],
        }).compile();
        service = module.get<OtpService>(OtpService);
        jest.clearAllMocks();
    });

    describe('generateOtp', () => {
        const dto = { phoneNumber: '0551234567', name: 'Test User', email: 'test@knust.edu.gh' };

        it('sends OTP when user has not voted', async () => {
            mockConfigService.get.mockReturnValue('test-api-key');
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000', ussd_code: '*920*10#' } }));
            mockCacheService.setSmsCode.mockResolvedValue(undefined);

            const result = await service.generateOtp(dto);

            expect(result.message).toContain('OTP sent successfully');
            expect(result.expiresIn).toBe('5 minutes');
            expect(mockCacheService.setSmsCode).toHaveBeenCalledWith(dto.phoneNumber, expect.any(String));
        });

        it('throws ConflictException when user has already voted', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ hasVoted: true });

            await expect(service.generateOtp(dto)).rejects.toThrow(ConflictException);
        });

        it('throws BadRequestException when API key is missing', async () => {
            mockConfigService.get.mockReturnValue(undefined);
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(service.generateOtp(dto)).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException when Arkesel returns non-1000 code', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockHttpService.post.mockReturnValue(of({ data: { code: '1001', message: 'Invalid number' } }));

            await expect(service.generateOtp(dto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('verifyOtp', () => {
        const dto = { phoneNumber: '0551234567', otp: '123456', email: 'test@knust.edu.gh' };

        it('creates session for new user on valid OTP', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000' } }));
            mockCacheService.getSmsCode.mockResolvedValue(JSON.stringify({ name: 'Test User', email: dto.email }));
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({ id: 'u1', name: 'Test User', email: dto.email });
            mockPrisma.votingSession.create.mockResolvedValue({ id: 's1', createdAt: new Date(), expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
            mockCacheService.setVotingSession.mockResolvedValue(undefined);
            mockCacheService.clearSmsCode.mockResolvedValue(undefined);

            const result = await service.verifyOtp(dto);

            expect(result.message).toBe('OTP verified successfully');
            expect(result).toHaveProperty('sessionId');
        });

        it('throws BadRequestException for invalid OTP', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1002' } }));

            await expect(service.verifyOtp(dto)).rejects.toThrow(BadRequestException);
        });

        it('throws NotFoundException when OTP session cache is missing', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000' } }));
            mockCacheService.getSmsCode.mockResolvedValue(null);

            await expect(service.verifyOtp(dto)).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException when email does not match cached OTP data', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000' } }));
            mockCacheService.getSmsCode.mockResolvedValue(JSON.stringify({ email: 'other@knust.edu.gh' }));

            await expect(service.verifyOtp(dto)).rejects.toThrow(BadRequestException);
        });
    });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest src/modules/voting/services/otp.service.spec.ts --no-coverage
```

Expected: all tests pass

---

### Task 19: Tests for VoteSubmissionService

**Files:**
- Create: `src/modules/voting/services/vote-submission.service.spec.ts`

- [ ] **Step 1: Write the test file**

Create `src/modules/voting/services/vote-submission.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { VoteSubmissionService } from './vote-submission.service';
import { ConfigService } from '@nestjs/config';

const mockPrisma = {
    candidate: { findMany: jest.fn(), update: jest.fn() },
    votingSession: { findUnique: jest.fn(), update: jest.fn() },
    vote: { create: jest.fn() },
    user: { update: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn(),
};
const mockCacheService = {
    getBallot: jest.fn(),
    setBallot: jest.fn(),
    deleteVotingSession: jest.fn(),
};
const mockRealTimeService = {
    broadcast: jest.fn(),
    broadcastToAdmins: jest.fn(),
    broadcastToRole: jest.fn(),
    getConnectionStats: jest.fn().mockReturnValue({ totalConnections: 0 }),
};
const mockVotingStatsService = {
    clearStatsCache: jest.fn(),
    getVotingProgress: jest.fn(),
    getVotingVelocity: jest.fn(),
    getPositionStats: jest.fn(),
};
const mockAnomalyService = { shouldRunDetection: jest.fn().mockResolvedValue(false) };
const mockConfigService = { get: jest.fn().mockReturnValue('test-encryption-key') };

describe('VoteSubmissionService', () => {
    let service: VoteSubmissionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VoteSubmissionService,
                { provide: 'PrismaService', useValue: mockPrisma },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: 'CacheService', useValue: mockCacheService },
                { provide: 'RealTimeService', useValue: mockRealTimeService },
                { provide: 'VotingStatsService', useValue: mockVotingStatsService },
                { provide: 'AnomalyDetectionService', useValue: mockAnomalyService },
            ],
        }).compile();
        service = module.get<VoteSubmissionService>(VoteSubmissionService);
        jest.clearAllMocks();
    });

    describe('getBallot', () => {
        it('returns cached ballot if available', async () => {
            const cached = { ballot: { PRESIDENT: [] }, totalPositions: 1 };
            mockCacheService.getBallot.mockResolvedValue(cached);

            const result = await service.getBallot();

            expect(result).toEqual(cached);
            expect(mockPrisma.candidate.findMany).not.toHaveBeenCalled();
        });

        it('queries DB and caches ballot on cache miss', async () => {
            mockCacheService.getBallot.mockResolvedValue(null);
            mockPrisma.candidate.findMany.mockResolvedValue([
                { id: 'c1', name: 'Alice', position: 'PRESIDENT', candidateNumber: 1, photoUrl: null, biography: null, nomination: {} },
            ]);
            mockCacheService.setBallot.mockResolvedValue(undefined);

            const result = await service.getBallot();

            expect(result).toHaveProperty('ballot');
            expect(mockCacheService.setBallot).toHaveBeenCalled();
        });
    });

    describe('validateSession', () => {
        it('returns valid session info for active session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                sessionId: 'sess1',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                user: { name: 'Bob', email: 'bob@test.com', hasVoted: false },
            });

            const result = await service.validateSession('sess1');

            expect(result.valid).toBe(true);
        });

        it('throws NotFoundException for unknown session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue(null);
            await expect(service.validateSession('bad-session')).rejects.toThrow(NotFoundException);
        });

        it('throws ForbiddenException for expired session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                sessionId: 'sess1',
                expiresAt: new Date(Date.now() - 1000),
                user: { id: 'u1' },
            });
            await expect(service.validateSession('sess1')).rejects.toThrow(ForbiddenException);
        });

        it('throws ConflictException when user already voted', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                sessionId: 'sess1',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                user: { name: 'Bob', email: 'bob@test.com', hasVoted: true },
            });
            await expect(service.validateSession('sess1')).rejects.toThrow(ConflictException);
        });
    });

    describe('submitVote', () => {
        const dto = { sessionId: 'sess1', votes: { PRESIDENT: 'c1' } };

        it('throws NotFoundException for unknown session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue(null);
            await expect(service.submitVote(dto)).rejects.toThrow(NotFoundException);
        });

        it('throws ForbiddenException for expired session', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                expiresAt: new Date(Date.now() - 1000),
                user: { hasVoted: false },
            });
            await expect(service.submitVote(dto)).rejects.toThrow(ForbiddenException);
        });

        it('throws ConflictException when user already voted', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                user: { hasVoted: true },
            });
            await expect(service.submitVote(dto)).rejects.toThrow(ConflictException);
        });

        it('throws BadRequestException for invalid candidate', async () => {
            mockPrisma.votingSession.findUnique.mockResolvedValue({
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                user: { hasVoted: false },
                voterHash: 'hash1',
            });
            mockPrisma.candidate.findMany.mockResolvedValue([]); // no valid candidates

            await expect(service.submitVote(dto)).rejects.toThrow(BadRequestException);
        });
    });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest src/modules/voting/services/vote-submission.service.spec.ts --no-coverage
```

Expected: all tests pass

---

### Task 20: Tests for VotingAdminService

**Files:**
- Create: `src/modules/voting/services/voting-admin.service.spec.ts`

- [ ] **Step 1: Write the test file**

Create `src/modules/voting/services/voting-admin.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { VotingAdminService } from './voting-admin.service';

const mockPrisma = {
    systemConfig: { upsert: jest.fn() },
    auditLog: { create: jest.fn() },
    votingSession: { findMany: jest.fn(), count: jest.fn() },
    vote: { findMany: jest.fn(), count: jest.fn() },
    candidate: { findMany: jest.fn() },
    user: { groupBy: jest.fn() },
    $transaction: jest.fn().mockImplementation((fn) => fn(mockPrisma)),
};
const mockCacheService = { set: jest.fn(), get: jest.fn(), del: jest.fn() };
const mockRealTimeService = { broadcast: jest.fn(), broadcastToAdmins: jest.fn(), getConnectionStats: jest.fn().mockReturnValue({ totalConnections: 2 }) };
const mockVotingStatsService = { getVotingProgress: jest.fn(), getVotingVelocity: jest.fn(), getPositionStats: jest.fn() };
const mockAnomalyService = { detectAnomalies: jest.fn() };

describe('VotingAdminService', () => {
    let service: VotingAdminService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotingAdminService,
                { provide: 'PrismaService', useValue: mockPrisma },
                { provide: 'CacheService', useValue: mockCacheService },
                { provide: 'RealTimeService', useValue: mockRealTimeService },
                { provide: 'VotingStatsService', useValue: mockVotingStatsService },
                { provide: 'AnomalyDetectionService', useValue: mockAnomalyService },
            ],
        }).compile();
        service = module.get<VotingAdminService>(VotingAdminService);
        jest.clearAllMocks();
    });

    describe('pauseVoting', () => {
        it('upserts VOTING_PAUSED config, logs audit, and broadcasts pause', async () => {
            mockPrisma.systemConfig.upsert.mockResolvedValue({});
            mockPrisma.auditLog.create.mockResolvedValue({});

            await service.pauseVoting('Suspicious activity', 'admin@test.com');

            expect(mockPrisma.systemConfig.upsert).toHaveBeenCalledWith(
                expect.objectContaining({ where: { key: 'VOTING_PAUSED' } }),
            );
            expect(mockRealTimeService.broadcast).toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ status: 'VOTING_PAUSED' }) }),
            );
        });
    });

    describe('resumeVoting', () => {
        it('upserts VOTING_PAUSED=false and broadcasts resume', async () => {
            mockPrisma.systemConfig.upsert.mockResolvedValue({});
            mockPrisma.auditLog.create.mockResolvedValue({});

            await service.resumeVoting('Issue resolved', 'admin@test.com');

            expect(mockPrisma.systemConfig.upsert).toHaveBeenCalledWith(
                expect.objectContaining({ update: expect.objectContaining({ value: 'false' }) }),
            );
            expect(mockRealTimeService.broadcast).toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ status: 'VOTING_RESUMED' }) }),
            );
        });
    });

    describe('getActiveSessions', () => {
        it('returns masked session data', async () => {
            mockPrisma.votingSession.findMany.mockResolvedValue([
                {
                    id: 's1', sessionId: 'abc123456789', voterHash: 'hash12345678',
                    status: 'ACTIVE', startTime: new Date(), expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                    user: { name: 'John Doe', email: 'john@test.com', hasVoted: false },
                },
            ]);

            const result = await service.getActiveSessions();

            expect(result.totalActive).toBe(1);
            expect(result.activeSessions[0].sessionId).toMatch(/\*\*\*$/);
            expect(result.activeSessions[0].voterName).toMatch(/\*\*\*$/);
        });
    });

    describe('getSystemHealth', () => {
        it('returns health object with all expected keys', async () => {
            mockPrisma.vote.count.mockResolvedValue(5);
            mockPrisma.votingSession.count.mockResolvedValue(2);
            mockCacheService.set.mockResolvedValue(undefined);
            mockCacheService.get.mockResolvedValue('test');
            mockCacheService.del.mockResolvedValue(undefined);

            const result = await service.getSystemHealth();

            expect(result).toHaveProperty('database');
            expect(result).toHaveProperty('voting');
            expect(result).toHaveProperty('cache');
            expect(result).toHaveProperty('realTime');
            expect(result.overall).toBe('HEALTHY');
        });
    });

    describe('getAnomalies', () => {
        it('delegates to anomaly detection service', async () => {
            mockAnomalyService.detectAnomalies.mockResolvedValue([{ type: 'BURST', count: 50 }]);

            const result = await service.getAnomalies();

            expect(mockAnomalyService.detectAnomalies).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });
    });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest src/modules/voting/services/voting-admin.service.spec.ts --no-coverage
```

Expected: all tests pass

---

### Task 21: Tests for VotingService (facade)

**Files:**
- Create: `src/modules/voting/voting.service.spec.ts` (replace any existing)

- [ ] **Step 1: Write the test file**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { VotingService } from './voting.service';

const mockPrisma = {
    user: { count: jest.fn() },
    vote: { count: jest.fn() },
    candidate: { findMany: jest.fn() },
    electionTimeline: { findMany: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation((fn) => fn(mockPrisma)),
};
const mockVotingStatsService = {
    getVotingProgress: jest.fn(),
    getVotingVelocity: jest.fn(),
    getPositionStats: jest.fn(),
    clearStatsCache: jest.fn(),
};
const mockRealTimeService = {
    broadcast: jest.fn(),
    broadcastToAdmins: jest.fn(),
    broadcastToRole: jest.fn(),
    getConnectionStats: jest.fn().mockReturnValue({ totalConnections: 1 }),
};

describe('VotingService', () => {
    let service: VotingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotingService,
                { provide: 'PrismaService', useValue: mockPrisma },
                { provide: 'VotingStatsService', useValue: mockVotingStatsService },
                { provide: 'RealTimeService', useValue: mockRealTimeService },
            ],
        }).compile();
        service = module.get<VotingService>(VotingService);
        jest.clearAllMocks();
    });

    describe('getVotingStats', () => {
        it('returns realtime stats when service succeeds', async () => {
            const stats = { totalVotes: 100, turnoutPercentage: 55 };
            mockVotingStatsService.getVotingProgress.mockResolvedValue(stats);
            mockVotingStatsService.getVotingVelocity.mockResolvedValue({ votesPerMinute: 2 });

            const result = await service.getVotingStats();

            expect(result.totalVotes).toBe(100);
            expect(result.systemInfo.realTimeEnabled).toBe(true);
        });

        it('falls back to DB query when realtime service throws', async () => {
            mockVotingStatsService.getVotingProgress.mockRejectedValue(new Error('Redis down'));
            mockPrisma.user.count.mockResolvedValue(200);
            mockPrisma.vote.count.mockResolvedValue(100);
            mockPrisma.candidate.findMany.mockResolvedValue([]);

            const result = await service.getVotingStats();

            expect(result).toHaveProperty('totalVoters');
        });
    });

    describe('getVotingTimeline', () => {
        it('marks current phase correctly', async () => {
            const now = new Date();
            const past = new Date(now.getTime() - 60 * 60 * 1000);
            const future = new Date(now.getTime() + 60 * 60 * 1000);
            mockPrisma.electionTimeline.findMany.mockResolvedValue([
                { id: '1', phase: 'NOMINATIONS', startDate: past, endDate: future, isActive: true },
            ]);

            const result = await service.getVotingTimeline();

            expect(result.currentPhase).toBe('NOMINATIONS');
        });
    });

    describe('refreshAndBroadcastStats', () => {
        it('clears cache, fetches stats, and broadcasts', async () => {
            mockVotingStatsService.clearStatsCache.mockResolvedValue(undefined);
            mockVotingStatsService.getVotingProgress.mockResolvedValue({ totalVotes: 10 });

            await service.refreshAndBroadcastStats();

            expect(mockVotingStatsService.clearStatsCache).toHaveBeenCalled();
            expect(mockRealTimeService.broadcast).toHaveBeenCalled();
            expect(mockRealTimeService.broadcastToAdmins).toHaveBeenCalled();
        });
    });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest src/modules/voting/voting.service.spec.ts --no-coverage
```

Expected: all tests pass

---

### Task 22: Tests for NotificationService

**Files:**
- Create: `src/modules/notifications/notification.service.spec.ts` (replace existing)

- [ ] **Step 1: Write the test file**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';

const mockSmsService = { sendSms: jest.fn(), sendVerificationCode: jest.fn(), sendNominationStatusUpdate: jest.fn() };
const mockEmailService = { sendEmail: jest.fn(), sendNominationStatusEmail: jest.fn(), sendAdminNotificationEmail: jest.fn(), sendVerificationCompleteEmail: jest.fn() };
const mockPrisma = { user: { findMany: jest.fn(), findUnique: jest.fn() }, nomination: { findUnique: jest.fn() } };
const mockQueueService = {};
const mockAdminNotificationsService = { notifyNominationReady: jest.fn(), notifyEcMemberOfDecision: jest.fn() };

describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                { provide: 'MnotifySmsService', useValue: mockSmsService },
                { provide: 'EmailService', useValue: mockEmailService },
                { provide: 'PrismaService', useValue: mockPrisma },
                { provide: 'NotificationQueueService', useValue: mockQueueService },
                { provide: 'AdminNotificationsService', useValue: mockAdminNotificationsService },
            ],
        }).compile();
        service = module.get<NotificationService>(NotificationService);
        jest.clearAllMocks();
    });

    describe('sendSms', () => {
        it('returns true on success', async () => {
            mockSmsService.sendSms.mockResolvedValue({ success: true });
            const result = await service.sendSms('0551234567', 'Test message');
            expect(result).toBe(true);
        });

        it('throws on SMS failure', async () => {
            mockSmsService.sendSms.mockResolvedValue({ success: false, error: 'Network error' });
            await expect(service.sendSms('0551234567', 'Test')).rejects.toThrow('Failed to send SMS');
        });
    });

    describe('sendEmail', () => {
        it('returns true on success', async () => {
            mockEmailService.sendEmail.mockResolvedValue({ success: true });
            const result = await service.sendEmail('a@b.com', 'Subject', '<p>Body</p>');
            expect(result).toBe(true);
        });

        it('returns false on email failure', async () => {
            mockEmailService.sendEmail.mockRejectedValue(new Error('SMTP error'));
            const result = await service.sendEmail('a@b.com', 'Subject', '<p>Body</p>');
            expect(result).toBe(false);
        });
    });

    describe('notifyAdminsOfNewNomination', () => {
        it('sends email to all active admins', async () => {
            mockPrisma.user.findMany.mockResolvedValue([{ email: 'admin@test.com' }]);
            mockEmailService.sendAdminNotificationEmail.mockResolvedValue(true);

            await service.notifyAdminsOfNewNomination({
                nominationId: 'n1', nomineeName: 'Alice', position: 'PRESIDENT', createdAt: new Date(),
            });

            expect(mockEmailService.sendAdminNotificationEmail).toHaveBeenCalledWith(
                ['admin@test.com'],
                expect.stringContaining('Alice'),
                expect.any(Object),
            );
        });
    });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest src/modules/notifications/notification.service.spec.ts --no-coverage
```

Expected: all tests pass

---

### Task 23: Tests for EcConsensusService

**Files:**
- Create: `src/modules/common/utils/ec-consensus.service.spec.ts`

- [ ] **Step 1: Write the test file**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EcConsensusService } from './ec-consensus.service';

const mockPrisma = {
    ecReview: { findMany: jest.fn(), findUnique: jest.fn() },
    user: { count: jest.fn() },
    nomination: { findMany: jest.fn() },
};

describe('EcConsensusService', () => {
    let service: EcConsensusService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EcConsensusService,
                { provide: 'PrismaService', useValue: mockPrisma },
            ],
        }).compile();
        service = module.get<EcConsensusService>(EcConsensusService);
        jest.clearAllMocks();
    });

    describe('checkConsensus', () => {
        it('returns APPROVE decision when 2/3 majority approves', async () => {
            mockPrisma.ecReview.findMany.mockResolvedValue([
                { approved: true, reviewer: { role: 'EC_MEMBER', isActive: true } },
                { approved: true, reviewer: { role: 'EC_MEMBER', isActive: true } },
                { approved: false, reviewer: { role: 'EC_MEMBER', isActive: true } },
            ]);
            mockPrisma.user.count.mockResolvedValue(3); // 3 EC members, need ceil(2) = 2

            const result = await service.checkConsensus('nom1');

            expect(result.isConsensusReached).toBe(true);
            expect(result.finalDecision).toBe('APPROVE');
            expect(result.approvals).toBe(2);
        });

        it('returns REJECT decision when 2/3 majority rejects', async () => {
            mockPrisma.ecReview.findMany.mockResolvedValue([
                { approved: false, reviewer: {} },
                { approved: false, reviewer: {} },
            ]);
            mockPrisma.user.count.mockResolvedValue(3);

            const result = await service.checkConsensus('nom1');

            expect(result.finalDecision).toBe('REJECT');
        });

        it('returns no decision when consensus not reached', async () => {
            mockPrisma.ecReview.findMany.mockResolvedValue([
                { approved: true, reviewer: {} },
            ]);
            mockPrisma.user.count.mockResolvedValue(5); // need ceil(10/3) = 4, only 1 approval

            const result = await service.checkConsensus('nom1');

            expect(result.isConsensusReached).toBe(false);
            expect(result.finalDecision).toBeNull();
        });

        it('returns pending=0 when all members have voted', async () => {
            mockPrisma.ecReview.findMany.mockResolvedValue([
                { approved: true, reviewer: {} },
                { approved: true, reviewer: {} },
            ]);
            mockPrisma.user.count.mockResolvedValue(2);

            const result = await service.checkConsensus('nom1');

            expect(result.pending).toBe(0);
        });
    });

    describe('canMemberVote', () => {
        it('returns true when member has not yet voted', async () => {
            mockPrisma.ecReview.findUnique.mockResolvedValue(null);
            const result = await service.canMemberVote('reviewer1', 'nom1');
            expect(result).toBe(true);
        });

        it('returns false when member already voted', async () => {
            mockPrisma.ecReview.findUnique.mockResolvedValue({ id: 'r1', approved: true });
            const result = await service.canMemberVote('reviewer1', 'nom1');
            expect(result).toBe(false);
        });
    });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest src/modules/common/utils/ec-consensus.service.spec.ts --no-coverage
```

Expected: all tests pass

- [ ] **Step 3: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass

- [ ] **Step 4: Commit Phase 3**

```bash
git add -A
git commit -m "test: add unit tests for refactored services

- OtpService: OTP generation/verification happy paths and failure cases
- VoteSubmissionService: ballot cache, session validation, vote submission
- VotingAdminService: pause/resume, sessions, health, anomaly delegation
- VotingService: realtime stats, fallback query, timeline, broadcast
- NotificationService: SMS/email routing, failure handling
- EcConsensusService: quorum calculation, canMemberVote"
```

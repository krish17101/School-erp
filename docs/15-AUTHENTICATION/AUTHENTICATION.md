# School ERP — Authentication Module Design

**Version:** 1.0
**Status:** Approved
**Phase:** 1 — Project Foundation
**Document Type:** Module Design Specification

---

# 1. Purpose

This document defines the complete design of the Authentication module for the School ERP platform.

It covers:

- Architecture and folder structure
- Database schema additions
- JWT access token and refresh token flow
- Role-Based Access Control (RBAC)
- All API endpoints with request/response contracts
- Zod validation schemas
- DTO definitions
- Backend middleware chain
- Frontend context and route guard design
- Sequence diagrams for all major flows
- Security considerations
- Audit logging strategy
- Testing strategy

Every developer and AI coding assistant must read this document before implementing any part of Phase 1.

---

# 2. Approved Decisions (Phase 1)

The following decisions were approved by the project owner before this design was created.

| Decision | Choice |
|---|---|
| Folder structure | Per-module (e.g., `auth/auth.controller.ts`) |
| Token strategy | JWT Access Token + JWT Refresh Token |
| Token storage (frontend) | In-memory (access) + `httpOnly` cookie (refresh) |
| Refresh token persistence | Stored in `refresh_token` database table |
| Default roles | All 8 roles seeded in Phase 1 |
| Audit logging | Active from Day 1 for all auth and user management actions |
| Route guards | React component-based protected routes using React Router v7 |
| Auth state management | React Context + TanStack Query |
| White-label branding | Deferred — temporary static branding in Phase 1 |
| AcademicYear dependency | None — auth module is completely standalone |

---

# 3. Module Overview

The Authentication module is responsible for:

1. Verifying user identity (login)
2. Issuing and rotating JWT tokens
3. Invalidating sessions (logout)
4. Protecting all subsequent API endpoints via middleware
5. Enforcing Role-Based Access Control on every request
6. Tracking login history
7. Audit logging all security-relevant actions
8. User management (create, update, deactivate) — admin only

The module is **completely independent** of AcademicYear, StudentModule, and all other Phase 2+ modules.

---

# 4. Architecture

## 4.1 Backend Layer Flow

```
HTTP Request
     │
     ▼
┌──────────────────────────────────────────────┐
│  Express Middleware Stack (existing)          │
│  requestContext → helmet → cors → json        │
│  → apiRateLimiter                             │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  Auth Router  /api/v1/auth/*                 │
│  authRateLimiter (stricter limit)             │
│  validateRequest(schema)                      │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  Auth Controller                             │
│  Receives request, calls service, sends      │
│  response. Zero business logic.              │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  Auth Service                                │
│  All business logic:                         │
│  - credential verification                   │
│  - token generation                          │
│  - session creation / revocation             │
│  - audit log writes                          │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  Auth Repository                             │
│  All Prisma operations only.                 │
│  No validation. No business logic.           │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  PostgreSQL via Prisma ORM                   │
└──────────────────────────────────────────────┘
```

## 4.2 Protected Route Flow

```
HTTP Request (authenticated)
     │
     ▼
authenticate middleware
  ├── Extract Bearer token from Authorization header
  ├── Verify JWT signature using JWT_SECRET
  ├── Decode payload: { userId, roleId, roleName }
  ├── Attach to request.currentUser
  └── Call next() or throw 401
     │
     ▼
authorize(...permissions) middleware
  ├── Load user permissions from DB (or in-request cache)
  ├── Check all required permissions are present
  └── Call next() or throw 403
     │
     ▼
Route Handler (controller)
```

---

# 5. Folder Structure

All authentication code lives in the per-module structure as approved.

```
backend/src/modules/auth/
├── auth.controller.ts          ← HTTP only. Calls service, returns responses.
├── auth.service.ts             ← Business logic: tokens, validation, audit.
├── auth.repository.ts          ← Prisma queries only.
├── auth.routes.ts              ← Route definitions, middleware application.
├── auth.validator.ts           ← All Zod schemas for this module.
├── auth.dto.ts                 ← Input/Output TypeScript interfaces.
├── auth.types.ts               ← Internal types (JwtPayload, etc.).
└── auth.test.ts                ← Vitest + Supertest tests.

backend/src/modules/users/
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
├── users.routes.ts
├── users.validator.ts
├── users.dto.ts
├── users.types.ts
└── users.test.ts

backend/src/middlewares/
├── authenticate.middleware.ts  ← NEW: JWT verification, attaches currentUser
├── authorize.middleware.ts     ← NEW: RBAC permission enforcement
├── error-handler.middleware.ts ← EXISTING (unchanged)
├── not-found.middleware.ts     ← EXISTING (unchanged)
├── rate-limit.middleware.ts    ← EXISTING (unchanged)
├── request-context.middleware.ts ← EXISTING (unchanged)
└── validate-request.middleware.ts ← EXISTING (unchanged)

backend/src/types/
└── express.d.ts                ← EXTEND with currentUser on Request

backend/seed/
└── seed.ts                     ← Seeds roles, permissions, and Super Admin user

frontend/src/modules/auth/
├── contexts/
│   └── AuthContext.tsx          ← React Context: current user, loading state
├── hooks/
│   ├── useAuth.ts               ← Consumes AuthContext
│   ├── useLogin.ts              ← TanStack Query mutation for login
│   └── useLogout.ts             ← TanStack Query mutation for logout
├── components/
│   └── ProtectedRoute.tsx       ← Route guard component
├── pages/
│   └── LoginPage.tsx            ← Login UI
├── services/
│   └── auth.api.ts              ← API calls: login, logout, refresh, me
└── types/
    └── auth.types.ts            ← Frontend auth type definitions
```

---

# 6. Database Schema

## 6.1 New Tables Required

### Table: `refresh_token`

Stores active refresh tokens. Enables server-side logout and token revocation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default uuid() | Primary key |
| `user_id` | UUID | FK → user(id), NOT NULL | Token owner |
| `token_hash` | VARCHAR(500) | NOT NULL, UNIQUE | SHA-256 hash of the raw token |
| `expires_at` | TIMESTAMP | NOT NULL | Absolute expiry time |
| `is_revoked` | BOOLEAN | default false | Revoked on logout |
| `ip_address` | VARCHAR(100) | nullable | IP at time of creation |
| `user_agent` | TEXT | nullable | Browser/client info |
| `created_at` | TIMESTAMP | default now() | Creation time |

**Indexes:**
- `@@index([user_id])` — find all tokens for a user (logout all devices)
- `@@index([expires_at])` — clean up expired tokens
- `@@unique([token_hash])` — fast lookup on validation

**Business Rules:**
- A refresh token is stored as a SHA-256 hash, never in plain text.
- On logout: set `is_revoked = true` for the specific token.
- On logout-all-devices: set `is_revoked = true` for all tokens of the user.
- Expired and revoked tokens are cleaned up by a scheduled job.
- Maximum of 5 active refresh tokens per user (configurable).

---

### Table: `login_history`

Tracks every login attempt (success and failure) for security audit purposes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default uuid() | Primary key |
| `user_id` | UUID | FK → user(id), nullable, SET NULL | User (null if user not found) |
| `attempted_username` | VARCHAR(150) | NOT NULL | Username or email entered |
| `success` | BOOLEAN | NOT NULL | Login succeeded or failed |
| `failure_reason` | VARCHAR(100) | nullable | Reason for failure |
| `ip_address` | VARCHAR(100) | nullable | Remote IP |
| `user_agent` | TEXT | nullable | Browser/client info |
| `created_at` | TIMESTAMP | default now() | Attempt time |

**Indexes:**
- `@@index([user_id])` — user login history
- `@@index([created_at])` — time-range queries
- `@@index([ip_address])` — brute-force detection

**Business Rules:**
- Every login attempt — successful or failed — is recorded.
- Records are immutable (no updates, no deletes).
- After 5 consecutive failed attempts from the same account within 15 minutes, the account is locked (`account_status = LOCKED`).

---

## 6.2 Existing Tables Used

### Table: `user` (already in schema.prisma)

Used as-is. The following fields are central to authentication:

| Field | Purpose |
|---|---|
| `id` | JWT subject (`sub`) |
| `username` | Login identifier |
| `email` | Alternative login identifier |
| `password_hash` | bcrypt hash (cost factor 12) |
| `role_id` | Determines permissions |
| `account_status` | ACTIVE / LOCKED / DISABLED |
| `last_login` | Updated on every successful login |
| `is_active` | Soft-delete support |
| `is_deleted` | Soft-delete flag |

---

### Table: `role` (already in schema.prisma)

Seeded with all 8 default system roles during Phase 1.

### Table: `permission` (already in schema.prisma)

Seeded with all Phase 1 permissions during setup.

### Table: `role_permission` (already in schema.prisma)

Maps roles to their permissions.

### Table: `audit_log` (already in schema.prisma)

Every critical auth action writes a record here.

---

## 6.3 System Roles (Seed Data)

All 8 roles are seeded as `is_system_role = true`. System roles cannot be deleted.

| Role Name | Description | is_system_role |
|---|---|---|
| `Super Admin` | Full system control | true |
| `Principal` | Read-only academic oversight | true |
| `Admin` | Daily school administration | true |
| `Accounts` | Financial management only | true |
| `Teacher` | Assigned classes and subjects | true |
| `Parent` | View own children's records | true |
| `Student` | View own academic info | true |
| `Alumni` | Read-only historical records | true |

---

## 6.4 Phase 1 Permissions (Seed Data)

Permissions use the format `module.action`. All seeded with `is_active = true`.

### User Management Module

| Permission Name | Module | Description |
|---|---|---|
| `user.view` | user | View user accounts |
| `user.create` | user | Create new user accounts |
| `user.update` | user | Update user information |
| `user.delete` | user | Soft-delete user accounts |
| `user.changeRole` | user | Change a user's role |
| `user.resetPassword` | user | Force-reset a user's password |
| `user.lock` | user | Lock/unlock user accounts |

### Role Management Module

| Permission Name | Module | Description |
|---|---|---|
| `role.view` | role | View all roles and their permissions |
| `role.manage` | role | Create/update roles and assign permissions |

### Audit Log Module

| Permission Name | Module | Description |
|---|---|---|
| `audit.view` | audit | View audit logs |

---

## 6.5 Default Role-Permission Mapping (Seed Data)

| Role | Permissions Granted |
|---|---|
| Super Admin | ALL permissions |
| Admin | `user.view`, `user.create`, `user.update`, `user.resetPassword` |
| Principal | `user.view`, `audit.view` |
| Accounts | (none in Phase 1) |
| Teacher | (none in Phase 1) |
| Parent | (none in Phase 1) |
| Student | (none in Phase 1) |
| Alumni | (none in Phase 1) |

---

# 7. API Design

All endpoints are under `/api/v1/`.

## 7.1 Authentication Endpoints

### POST /api/v1/auth/login

**Purpose:** Authenticate a user and issue tokens.
**Authentication required:** No
**Rate limit:** Strict (20 requests per 15 minutes per IP)

**Request Body:**
```json
{
  "identifier": "admin@school.com",
  "password": "SecurePassword123!"
}
```

`identifier` accepts either a username or email address.

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "superadmin",
      "email": "admin@school.com",
      "role": {
        "id": "...",
        "roleName": "Super Admin"
      },
      "permissions": ["user.view", "user.create", "role.view", "role.manage"]
    }
  }
}
```

The **refresh token** is sent as an `httpOnly`, `Secure`, `SameSite=Strict` cookie named `refresh_token`. It is never included in the response body.

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | VAL_001 | Missing or invalid request fields |
| 401 | AUTH_001 | Invalid credentials |
| 403 | AUTH_004 | Account locked |
| 403 | AUTH_005 | Account disabled |
| 429 | SYS_001 | Rate limit exceeded |

---

### POST /api/v1/auth/logout

**Purpose:** Revoke the current refresh token. Invalidates the session.
**Authentication required:** Yes (access token) — best-effort

**Request Body:** None

**Cookie required:** `refresh_token` cookie must be present.

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

**Behaviour:**
- The refresh token is marked `is_revoked = true` in the database.
- The `refresh_token` cookie is cleared (set with `Max-Age=0`).
- This endpoint succeeds even if the token is already revoked or expired (idempotent).
- An audit log record is written.

---

### POST /api/v1/auth/refresh-token

**Purpose:** Exchange a valid refresh token for a new access token.
**Authentication required:** No
**Cookie required:** `refresh_token` httpOnly cookie

**Request Body:** None

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

A new `refresh_token` cookie is set (token rotation).

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 401 | AUTH_002 | Cookie missing, token expired, or token revoked |
| 403 | AUTH_004 | Account locked or disabled |

**Behaviour:**
- The old refresh token is revoked.
- A new refresh token is issued and stored.
- The user's permissions are re-read from DB (captures role changes).

---

### GET /api/v1/auth/me

**Purpose:** Return the current authenticated user's profile and permissions.
**Authentication required:** Yes

**Request Body:** None

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "superadmin",
    "email": "admin@school.com",
    "isEmailVerified": false,
    "lastLogin": "2026-07-26T15:30:00.000Z",
    "accountStatus": "ACTIVE",
    "role": {
      "id": "...",
      "roleName": "Super Admin"
    },
    "permissions": ["user.view", "user.create", "user.update", "user.delete", "role.view", "role.manage", "audit.view"]
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 401 | AUTH_002 | Missing or invalid access token |

---

### PUT /api/v1/auth/change-password

**Purpose:** Change the authenticated user's own password.
**Authentication required:** Yes

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456@",
  "confirmPassword": "NewPassword456@"
}
```

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": null
}
```

**Behaviour:**
- Verifies `currentPassword` against stored bcrypt hash.
- Validates `newPassword` against password policy.
- `newPassword` must match `confirmPassword`.
- Revokes all existing refresh tokens for this user (forces re-login on all devices).
- Writes an audit log.

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | VAL_001 | Passwords do not match or policy not met |
| 401 | AUTH_001 | Current password incorrect |
| 401 | AUTH_002 | Not authenticated |

---

## 7.2 User Management Endpoints

### GET /api/v1/users

**Purpose:** List all user accounts.
**Authentication required:** Yes
**Permission required:** `user.view`

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Records per page (max 100) |
| `search` | string | — | Search by username or email |
| `roleId` | UUID | — | Filter by role |
| `status` | string | — | Filter by account_status (ACTIVE/LOCKED/DISABLED) |
| `sort` | string | `createdAt` | Field to sort by |
| `order` | string | `desc` | asc or desc |

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "data": [
    {
      "id": "...",
      "username": "admin_user",
      "email": "admin@school.com",
      "accountStatus": "ACTIVE",
      "isEmailVerified": false,
      "lastLogin": "2026-07-26T10:00:00.000Z",
      "role": {
        "id": "...",
        "roleName": "Admin"
      },
      "createdAt": "2026-07-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET /api/v1/users/:id

**Purpose:** Get a single user's full profile.
**Authentication required:** Yes
**Permission required:** `user.view`

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "id": "...",
    "username": "teacher01",
    "email": "teacher01@school.com",
    "accountStatus": "ACTIVE",
    "isEmailVerified": false,
    "lastLogin": "2026-07-26T08:00:00.000Z",
    "role": {
      "id": "...",
      "roleName": "Teacher"
    },
    "createdAt": "2026-07-01T00:00:00.000Z",
    "updatedAt": "2026-07-20T12:00:00.000Z"
  }
}
```

---

### POST /api/v1/users

**Purpose:** Create a new user account.
**Authentication required:** Yes
**Permission required:** `user.create`

**Request Body:**
```json
{
  "username": "teacher01",
  "email": "teacher01@school.com",
  "password": "InitialPassword123!",
  "roleId": "uuid-of-teacher-role"
}
```

**Success Response — 201 Created:**
```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "id": "...",
    "username": "teacher01",
    "email": "teacher01@school.com",
    "accountStatus": "ACTIVE",
    "role": {
      "id": "...",
      "roleName": "Teacher"
    },
    "createdAt": "2026-07-26T21:00:00.000Z"
  }
}
```

**Behaviour:**
- Password is hashed with bcrypt (cost factor 12) before storage.
- The password is never returned or logged.
- An audit log is written.
- Username and email uniqueness is enforced.

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | VAL_001 | Validation failure |
| 409 | DB_001 | Username or email already exists |

---

### PUT /api/v1/users/:id

**Purpose:** Update a user's username, email, or role.
**Authentication required:** Yes
**Permission required:** `user.update`

**Request Body (all fields optional):**
```json
{
  "username": "new_username",
  "email": "newemail@school.com",
  "roleId": "uuid-of-new-role"
}
```

**Constraints:**
- A Super Admin cannot change their own role.
- At least one field must be provided.

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "id": "...",
    "username": "new_username",
    "email": "newemail@school.com",
    "role": {
      "id": "...",
      "roleName": "Admin"
    }
  }
}
```

---

### DELETE /api/v1/users/:id

**Purpose:** Soft-delete a user account (`is_deleted = true`, `is_active = false`).
**Authentication required:** Yes
**Permission required:** `user.delete`

**Constraints:**
- A user cannot delete their own account.
- The last Super Admin account cannot be deleted.

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "User deactivated successfully.",
  "data": null
}
```

---

### PUT /api/v1/users/:id/status

**Purpose:** Lock or unlock a user account.
**Authentication required:** Yes
**Permission required:** `user.lock`

**Request Body:**
```json
{
  "accountStatus": "LOCKED",
  "reason": "Multiple failed login attempts reported by staff."
}
```

`accountStatus` must be `ACTIVE` or `LOCKED`. (DISABLED is set through soft-delete only.)

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Account status updated successfully.",
  "data": null
}
```

---

### PUT /api/v1/users/:id/reset-password

**Purpose:** Admin forces a password reset for a user.
**Authentication required:** Yes
**Permission required:** `user.resetPassword`

**Request Body:**
```json
{
  "newPassword": "TemporaryPassword789#",
  "requireChangeOnNextLogin": true
}
```

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": null
}
```

**Behaviour:**
- All existing refresh tokens for the target user are revoked.
- An audit log is written including who performed the reset.
- The password is never returned or logged.

---

## 7.3 Role Endpoints

### GET /api/v1/roles

**Purpose:** List all roles with their permissions.
**Authentication required:** Yes
**Permission required:** `role.view`

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Roles retrieved successfully.",
  "data": [
    {
      "id": "...",
      "roleName": "Super Admin",
      "description": "Full system control.",
      "isSystemRole": true,
      "isActive": true,
      "permissions": [
        { "id": "...", "permissionName": "user.view", "moduleName": "user" },
        { "id": "...", "permissionName": "user.create", "moduleName": "user" }
      ]
    }
  ]
}
```

---

### GET /api/v1/roles/:id

**Purpose:** Get a single role with its permissions.
**Authentication required:** Yes
**Permission required:** `role.view`

---

## 7.4 Audit Log Endpoints

### GET /api/v1/audit-logs

**Purpose:** List audit log records with filtering.
**Authentication required:** Yes
**Permission required:** `audit.view`

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `module` | string | Filter by module (e.g., `auth`, `user`) |
| `action` | string | Filter by action (e.g., `LOGIN`, `CREATE_USER`) |
| `userId` | UUID | Filter by actor user |
| `from` | ISO date | Start of date range |
| `to` | ISO date | End of date range |
| `page` | integer | Page number |
| `pageSize` | integer | Records per page |

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully.",
  "data": [
    {
      "id": "...",
      "module": "auth",
      "action": "LOGIN",
      "user": { "id": "...", "username": "superadmin" },
      "recordId": null,
      "oldValue": null,
      "newValue": null,
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-07-26T09:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1234,
    "totalPages": 62
  }
}
```

---

# 8. JWT Token Design

## 8.1 Access Token

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Secret | `JWT_SECRET` env variable (min 32 chars) |
| Lifetime | 15 minutes |
| Stored in | Memory only (never persisted to DB or localStorage) |
| Sent via | `Authorization: Bearer <token>` header |

**Payload:**
```json
{
  "sub": "user-uuid",
  "roleId": "role-uuid",
  "roleName": "Super Admin",
  "iat": 1722000000,
  "exp": 1722000900
}
```

**Payload notes:**
- `sub`: The user UUID. Used to fetch the user record.
- `roleId` / `roleName`: Included for convenience — permissions are still loaded fresh from DB on each protected request during Phase 1.
- Permissions are **not** embedded in the JWT to ensure permission changes take effect without waiting for token expiry.

## 8.2 Refresh Token

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Secret | `REFRESH_TOKEN_SECRET` env variable (min 32 chars, different from JWT_SECRET) |
| Lifetime | 7 days |
| Stored DB-side | SHA-256 hash of the token stored in `refresh_token` table |
| Sent via | `httpOnly`, `Secure`, `SameSite=Strict` cookie named `refresh_token` |
| Max per user | 5 active tokens (oldest removed if exceeded) |

**Payload:**
```json
{
  "sub": "user-uuid",
  "jti": "unique-token-id",
  "iat": 1722000000,
  "exp": 1722604800
}
```

`jti` is a `randomUUID()` included to make each token unique, even for the same user.

## 8.3 Token Rotation

On every successful `/auth/refresh-token` call:

1. The incoming refresh token is verified against the stored hash.
2. The old record is marked `is_revoked = true`.
3. A new refresh token is generated, hashed, and stored.
4. A new access token is generated.
5. The new `refresh_token` cookie is set.

This is **refresh token rotation**. If a stolen refresh token is used after it has already been rotated, the revoked-token detection will trigger and all tokens for that user will be revoked.

---

# 9. RBAC Design

## 9.1 Permission Check Flow

```
Request arrives at protected route
         │
         ▼
authenticate middleware
  - Verifies access token
  - Attaches currentUser to request
         │
         ▼
authorize('permission.name') middleware
  - Loads permissions from DB for currentUser.roleId
  - Checks if required permission is in the set
  - Passes or throws 403
         │
         ▼
Controller
```

## 9.2 Middleware Signatures

```typescript
// Verifies JWT, attaches user to request
export const authenticate: RequestHandler

// Checks one or more permissions (AND logic — all must be present)
export function authorize(...permissions: string[]): RequestHandler
```

## 9.3 Permission Loading Strategy (Phase 1)

In Phase 1, permissions are loaded from the database on every protected request using the `roleId` from the JWT. A simple Prisma query fetches all permissions for that role.

This is simple and correct. Caching will be added in Phase 17 (Performance Optimization).

## 9.4 Express Request Augmentation

The `express.d.ts` type declaration is extended to include `currentUser`:

```typescript
// backend/src/types/express.d.ts
import type { AccountStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      requestId: string;                    // EXISTING
      currentUser?: {                       // NEW
        id: string;
        username: string;
        email: string;
        roleId: string;
        roleName: string;
        accountStatus: AccountStatus;
        permissions: string[];
      };
    }
  }
}
```

---

# 10. Validation Schemas (Zod)

All schemas live in `auth.validator.ts` and `users.validator.ts`.

## 10.1 Login Schema

```typescript
// auth.validator.ts
const loginBodySchema = z.object({
  identifier: z.string().min(1, 'Username or email is required.').max(150),
  password: z.string().min(1, 'Password is required.').max(200),
});

export const loginSchema = z.object({
  body: loginBodySchema,
  params: z.record(z.string()),
  query: z.record(z.unknown()),
});
```

## 10.2 Change Password Schema

```typescript
const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
  confirmPassword: z.string().min(1),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});
```

## 10.3 Create User Schema

```typescript
// users.validator.ts
const createUserBodySchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(100)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores.'),
  email: z.string().email('A valid email address is required.').max(150),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
  roleId: z.string().uuid('A valid role ID is required.'),
});
```

## 10.4 Update User Schema

```typescript
const updateUserBodySchema = z.object({
  username: z.string().min(3).max(100).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().max(150).optional(),
  roleId: z.string().uuid().optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided.' }
);
```

## 10.5 User Status Schema

```typescript
const updateUserStatusBodySchema = z.object({
  accountStatus: z.enum(['ACTIVE', 'LOCKED']),
  reason: z.string().min(1).max(500).optional(),
});
```

## 10.6 Reset Password Schema

```typescript
const resetPasswordBodySchema = z.object({
  newPassword: z.string().min(8).max(128)
    .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  requireChangeOnNextLogin: z.boolean().default(true),
});
```

## 10.7 Query Parameter Schemas

```typescript
const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  roleId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'LOCKED', 'DISABLED']).optional(),
  sort: z.enum(['createdAt', 'username', 'email', 'lastLogin']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
```

---

# 11. DTO Definitions

All DTOs live in `auth.dto.ts` and `users.dto.ts`.

## 11.1 Auth DTOs

```typescript
// auth.dto.ts

// Input
export interface LoginInput {
  identifier: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Output
export interface AuthUserDto {
  id: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  lastLogin: Date | null;
  accountStatus: string;
  role: {
    id: string;
    roleName: string;
  };
  permissions: string[];
}

export interface LoginResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
}
```

## 11.2 User Management DTOs

```typescript
// users.dto.ts

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  roleId?: string;
}

export interface UpdateUserStatusInput {
  accountStatus: 'ACTIVE' | 'LOCKED';
  reason?: string;
}

export interface ResetPasswordInput {
  newPassword: string;
  requireChangeOnNextLogin: boolean;
}

export interface UserListItemDto {
  id: string;
  username: string;
  email: string;
  accountStatus: string;
  isEmailVerified: boolean;
  lastLogin: Date | null;
  role: { id: string; roleName: string };
  createdAt: Date;
}

export interface UserDetailDto extends UserListItemDto {
  updatedAt: Date;
  createdBy: { id: string; username: string } | null;
}

export interface ListUsersQuery {
  page: number;
  pageSize: number;
  search?: string;
  roleId?: string;
  status?: 'ACTIVE' | 'LOCKED' | 'DISABLED';
  sort: string;
  order: 'asc' | 'desc';
}
```

---

# 12. Internal Types

```typescript
// auth.types.ts

export interface JwtPayload {
  sub: string;       // user UUID
  roleId: string;
  roleName: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;       // user UUID
  jti: string;       // unique token identifier
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  roleId: string;
  roleName: string;
  accountStatus: string;
  permissions: string[];
}

export type LoginFailureReason =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DISABLED'
  | 'USER_NOT_FOUND';
```

---

# 13. Rate Limiting Strategy

Two rate limiters are used:

| Limiter | Applies To | Window | Limit | Purpose |
|---|---|---|---|---|
| `apiRateLimiter` (existing) | All `/api/v1/*` routes | 15 minutes | 1,000 req/IP | General protection |
| `authRateLimiter` (new) | `/api/v1/auth/login`, `/api/v1/auth/refresh-token` | 15 minutes | 20 req/IP | Brute-force protection |

The `authRateLimiter` is applied **before** `apiRateLimiter` in the auth router. The stricter limit governs.

```typescript
// rate-limit.middleware.ts (addition)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_request, response) => {
    sendError(response, 429, 'Too many login attempts. Please try again later.', [
      { code: 'AUTH_006', message: 'Rate limit exceeded for authentication.' },
    ]);
  },
});
```

---

# 14. Middleware Design

## 14.1 authenticate.middleware.ts

```typescript
// Pseudocode — not final implementation
export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication required.', 'AUTH_002');
  }
  const token = authHeader.slice(7);

  // 2. Verify signature and expiry
  const payload = verifyAccessToken(token); // throws if invalid

  // 3. Load user from DB (confirms account still active)
  const user = await userRepository.findById(payload.sub);
  if (!user || user.isDeleted) {
    throw new AppError(401, 'User account not found.', 'AUTH_002');
  }
  if (user.accountStatus === 'LOCKED') {
    throw new AppError(403, 'Account is locked.', 'AUTH_004');
  }
  if (user.accountStatus === 'DISABLED') {
    throw new AppError(403, 'Account is disabled.', 'AUTH_005');
  }

  // 4. Load permissions
  const permissions = await roleRepository.findPermissionsByRoleId(user.roleId);

  // 5. Attach to request
  req.currentUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role.roleName,
    accountStatus: user.accountStatus,
    permissions: permissions.map((p) => p.permissionName),
  };

  next();
});
```

## 14.2 authorize.middleware.ts

```typescript
// Pseudocode — not final implementation
export function authorize(...requiredPermissions: string[]): RequestHandler {
  return asyncHandler(async (req, _res, next) => {
    if (!req.currentUser) {
      throw new AppError(401, 'Authentication required.', 'AUTH_002');
    }

    const userPermissions = new Set(req.currentUser.permissions);
    const hasAll = requiredPermissions.every((p) => userPermissions.has(p));

    if (!hasAll) {
      throw new AppError(403, 'You do not have permission to perform this action.', 'PERM_001');
    }

    next();
  });
}
```

---

# 15. Audit Logging Strategy

The `AuditLog` table (already in schema.prisma) is used from Day 1.

## 15.1 Audit Actions in Phase 1

| Action Constant | Module | Trigger |
|---|---|---|
| `LOGIN` | `auth` | Successful login |
| `LOGIN_FAILED` | `auth` | Failed login attempt |
| `LOGOUT` | `auth` | Successful logout |
| `TOKEN_REFRESHED` | `auth` | Refresh token used |
| `PASSWORD_CHANGED` | `auth` | User changes own password |
| `PASSWORD_RESET` | `user` | Admin resets a user's password |
| `USER_CREATED` | `user` | New user account created |
| `USER_UPDATED` | `user` | User account details updated |
| `USER_DEACTIVATED` | `user` | User soft-deleted |
| `USER_STATUS_CHANGED` | `user` | Account locked or unlocked |
| `USER_ROLE_CHANGED` | `user` | Role changed for a user |

## 15.2 Audit Log Record Fields

For every audit action, the following fields are recorded:

| Field | Source |
|---|---|
| `userId` | `request.currentUser?.id` (null for failed logins) |
| `module` | Hardcoded per action (e.g., `'auth'`) |
| `action` | Hardcoded constant (e.g., `'LOGIN'`) |
| `recordId` | UUID of affected record (e.g., target user's ID) |
| `oldValue` | JSON of state before change (passwords excluded) |
| `newValue` | JSON of state after change (passwords excluded) |
| `ipAddress` | `request.ip` |
| `userAgent` | `request.headers['user-agent']` |

**Passwords must never appear in `oldValue` or `newValue`.**

## 15.3 Audit Log Write Strategy

Audit logs are written inside the Auth Service — after the primary operation succeeds. If the audit write fails, the error is **logged** (via Winston) but the primary operation is **not rolled back**. The audit write should not block the user response.

```
Primary operation (login, create user, etc.)
         │
         ▼
Operation succeeds
         │
         ├── Write audit log (fire-and-forget)
         │   └── On failure: logger.error(...)
         │
         ▼
Return success response
```

---

# 16. Sequence Diagrams

## 16.1 Login Flow

```
Client                 Express              Auth Service           Database
  │                      │                      │                     │
  │── POST /auth/login ──▶│                      │                     │
  │                      │── validateRequest ───▶│                     │
  │                      │   (Zod schema)        │                     │
  │                      │── authController ─────▶│                     │
  │                      │   .login()            │── findByIdentifier ─▶│
  │                      │                      │◀─ user record ───────│
  │                      │                      │                     │
  │                      │                      │── bcrypt.compare()  │
  │                      │                      │   (password check)  │
  │                      │                      │                     │
  │                      │                      │── createRefreshToken─▶│
  │                      │                      │── updateLastLogin ───▶│
  │                      │                      │── writeAuditLog ─────▶│
  │                      │                      │                     │
  │◀─ 200 OK ────────────│◀─ loginResponseDto ──│                     │
  │   (body: accessToken,│                      │                     │
  │    user profile)     │                      │                     │
  │   (cookie: refresh)  │                      │                     │
```

## 16.2 Authenticated Request Flow

```
Client                 Express              authenticate          authorize
  │                      │                   middleware           middleware
  │── GET /users ────────▶│                      │                     │
  │   Authorization:      │── authenticate ───────▶│                     │
  │   Bearer <token>      │                      │── verifyJwt()       │
  │                      │                      │── loadUser()        │
  │                      │                      │── loadPermissions() │
  │                      │                      │── attach currentUser│
  │                      │── authorize ──────────────────────────────▶│
  │                      │   ('user.view')      │                   │── check perms
  │                      │                      │                   │── pass/fail
  │                      │── usersController ────────────────────────────▶
  │                      │   .listUsers()
  │◀─ 200 OK ────────────│
```

## 16.3 Token Refresh Flow

```
Client                 Express              Auth Service           Database
  │                      │                      │                     │
  │── POST /auth/ ────────▶│                      │                     │
  │   refresh-token       │                      │                     │
  │   (cookie: refresh)   │── authController ─────▶│                     │
  │                      │   .refreshToken()    │── findRefreshToken ──▶│
  │                      │                      │◀─ token record ──────│
  │                      │                      │                     │
  │                      │                      │── verifyRefreshJwt()│
  │                      │                      │── check is_revoked  │
  │                      │                      │── check expires_at  │
  │                      │                      │── loadUser()        │
  │                      │                      │── check accountStatus│
  │                      │                      │                     │
  │                      │                      │── revokeOldToken ───▶│
  │                      │                      │── createNewTokens ───▶│
  │                      │                      │── writeAuditLog ─────▶│
  │                      │                      │                     │
  │◀─ 200 OK ────────────│◀─ new accessToken ───│                     │
  │   (body: accessToken) │                      │                     │
  │   (new cookie: refresh)│                     │                     │
```

## 16.4 Logout Flow

```
Client                 Express              Auth Service           Database
  │                      │                      │                     │
  │── POST /auth/logout ──▶│                      │                     │
  │   Authorization:      │── authenticate ───────▶│                     │
  │   Bearer <token>      │   (best-effort)      │                     │
  │   (cookie: refresh)   │── authController ─────▶│                     │
  │                      │   .logout()          │── findRefreshToken ──▶│
  │                      │                      │── revokeToken ───────▶│
  │                      │                      │── writeAuditLog ─────▶│
  │                      │                      │                     │
  │◀─ 200 OK ────────────│◀─ success ───────────│                     │
  │   (cookie cleared)   │                      │                     │
```

---

# 17. Frontend Design

## 17.1 AuthContext

```typescript
// frontend/src/modules/auth/contexts/AuthContext.tsx

interface AuthContextValue {
  currentUser: AuthUserDto | null;   // null when not logged in
  isAuthenticated: boolean;
  isLoading: boolean;                // true during initial /auth/me fetch
  permissions: Set<string>;          // for O(1) permission lookups
  hasPermission: (permission: string) => boolean;
}
```

The context is initialized by calling `GET /api/v1/auth/me` via TanStack Query on app startup. If the call fails with 401, the user is treated as unauthenticated.

## 17.2 useAuth Hook

```typescript
// Minimal shape
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

## 17.3 useLogin Hook

```typescript
// TanStack Query mutation
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginInput) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });
}
```

## 17.4 useLogout Hook

```typescript
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();         // Clear all cached data
      queryClient.removeQueries(); // Remove all queries
    },
  });
}
```

## 17.5 apiClient Enhancement

The existing `apiClient` in `frontend/src/services/api/client.ts` must be updated to:

1. Include the `Authorization: Bearer <accessToken>` header on authenticated requests.
2. On 401 response, attempt one `/auth/refresh-token` call automatically.
3. If refresh succeeds, retry the original request once.
4. If refresh fails, clear auth state and redirect to `/login`.

This logic is the **silent token refresh** pattern.

## 17.6 ProtectedRoute Component

```typescript
// frontend/src/modules/auth/components/ProtectedRoute.tsx
// Pseudocode

function ProtectedRoute({ permission }: { permission?: string }): ReactElement {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
```

## 17.7 Router Structure (Phase 1)

```typescript
// router.tsx structure
createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <PlatformStatusPage />,
      },
      // Public routes
      {
        path: 'login',
        element: <LoginPage />,
      },
      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          // User management — requires user.view permission
          {
            element: <ProtectedRoute permission="user.view" />,
            children: [
              { path: 'users', element: <UsersPage /> },
              { path: 'users/:id', element: <UserDetailPage /> },
            ],
          },
        ],
      },
      // Catch-all
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
```

## 17.8 Token Storage Architecture

| Token | Storage | Rationale |
|---|---|---|
| Access Token | JavaScript `memory` (module-level variable in auth.api.ts) | Not persisted. Lost on page refresh — recovered via silent refresh. |
| Refresh Token | `httpOnly` cookie (set by server) | Not accessible to JavaScript. Protected from XSS. |

On page refresh:
1. Access token is gone from memory.
2. The app calls `GET /auth/me` — gets 401 (expired access token).
3. The `apiClient` interceptor calls `POST /auth/refresh-token` — the cookie is sent automatically.
4. A new access token is returned and stored in memory.
5. The original `/auth/me` request is retried.

---

# 18. Password Policy

All passwords must meet the following requirements:

| Rule | Requirement |
|---|---|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Uppercase letters | At least 1 |
| Lowercase letters | At least 1 |
| Numeric digits | At least 1 |
| Special characters | At least 1 (`!@#$%^&*` etc.) |
| Hashing algorithm | bcrypt with cost factor 12 |
| Common passwords | Not blocked in Phase 1 (Phase 17 enhancement) |

Passwords are **never**:
- Stored in plain text
- Returned in any API response
- Written to any log file
- Embedded in any JWT payload

---

# 19. Account Lockout Policy

| Event | Threshold | Action |
|---|---|---|
| Consecutive failed logins | 5 within 15 minutes | `account_status` set to `LOCKED` |
| Account unlock | Manual only | Admin calls `PUT /users/:id/status` with `ACTIVE` |

When an account is locked:
- A `login_history` record is written with `failure_reason = 'ACCOUNT_LOCKED'`.
- An `audit_log` record is written with action `USER_STATUS_CHANGED`.
- All subsequent login attempts return `403 AUTH_004`.

---

# 20. Error Codes (Phase 1 Additions)

New error codes to register alongside the existing ones:

| Code | HTTP Status | Meaning |
|---|---|---|
| `AUTH_001` | 401 | Invalid credentials (wrong username/password) |
| `AUTH_002` | 401 | Missing, expired, or malformed token |
| `AUTH_003` | 401 | Refresh token is revoked or not found |
| `AUTH_004` | 403 | Account is locked |
| `AUTH_005` | 403 | Account is disabled |
| `AUTH_006` | 429 | Auth rate limit exceeded |
| `PERM_001` | 403 | Insufficient permissions (already exists) |
| `VAL_001` | 422 | Validation failure (already exists) |
| `DB_001` | 409 | Duplicate record (already exists) |

---

# 21. Security Considerations

## 21.1 Token Security

- Access tokens have a short 15-minute lifetime to limit damage from leakage.
- Refresh tokens are stored server-side as SHA-256 hashes. The raw token is never stored.
- Refresh token rotation detects token theft: if a revoked token is presented, all tokens for that user are revoked immediately.
- The `httpOnly` cookie flag prevents JavaScript from reading the refresh token.
- The `SameSite=Strict` flag prevents CSRF in cross-origin contexts.
- The `Secure` flag ensures cookies are only sent over HTTPS in production.

## 21.2 Password Security

- bcrypt cost factor 12: ~250ms per hash — acceptable for UX, high cost for attackers.
- Passwords are compared using bcrypt.compare (timing-safe).
- Passwords are never logged, never returned in responses, never stored in JWT.

## 21.3 CORS

- The backend CORS config (existing) already uses a whitelist from `CORS_ORIGINS` env var.
- `credentials: true` is set, which allows cookies to be sent cross-origin when `SameSite=None; Secure` is used in production (cross-origin). For same-origin or `SameSite=Strict`, cookies are sent automatically.

## 21.4 SQL Injection

- All database operations use Prisma ORM with parameterized queries. Raw SQL is never used in this module.

## 21.5 Enumeration Protection

- Login returns a generic `401 AUTH_001` message regardless of whether the identifier exists. This prevents user enumeration attacks.
- The error message is: `"Invalid credentials."` — same for wrong username, wrong password.

## 21.6 Log Safety

- Login payloads are never logged.
- Passwords are never written to Winston logs.
- JWTs are never written to Winston logs.
- IP addresses are logged (for security monitoring).
- Audit logs capture `ipAddress` and `userAgent` only.

---

# 22. Prisma Migration

The first real migration (on top of the foundation schema) will add:

1. `refresh_token` table
2. `login_history` table

The migration will be named:

```
prisma migrate dev --name add-auth-tables
```

This migration is created and applied as part of Phase 1 implementation. The existing 7 models in `schema.prisma` do not change — only new models are added.

---

# 23. Seed Script Design

The seed script (`backend/seed/seed.ts`) runs once during initial setup.

## Seed Sequence

```
1. Create all 8 system Roles
2. Create all Phase 1 Permissions
3. Create Role-Permission mappings
4. Create the Super Admin User account
```

## Super Admin Seed Account

| Field | Value |
|---|---|
| Username | `superadmin` |
| Email | `admin@school.com` |
| Password | `Admin@123456` (printed on first run — must be changed immediately) |
| Role | Super Admin |

**The seed script prints a one-time notice to the console:**

```
=========================================================
  Super Admin account created.
  Username : superadmin
  Password : Admin@123456
  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN.
=========================================================
```

The seed script is idempotent — running it twice does not create duplicate records (`upsert` is used for all seed operations).

---

# 24. Testing Strategy

## 24.1 What to Test

Every test lives in `backend/src/modules/auth/auth.test.ts` and `backend/src/modules/users/users.test.ts`.

### Auth Module Tests

| Test Case | Type |
|---|---|
| Login with valid credentials returns 200, access token, and sets refresh cookie | Integration |
| Login with wrong password returns 401 | Integration |
| Login with non-existent user returns 401 | Integration |
| Login with locked account returns 403 | Integration |
| Login with disabled account returns 403 | Integration |
| Login with missing fields returns 422 | Integration |
| 5 consecutive failed logins locks the account | Integration |
| Refresh token endpoint returns new access token | Integration |
| Refresh token endpoint rotates the cookie | Integration |
| Refresh token endpoint with revoked token returns 401 | Integration |
| Refresh token endpoint with expired token returns 401 | Integration |
| Refresh token endpoint with missing cookie returns 401 | Integration |
| Logout revokes refresh token and clears cookie | Integration |
| Logout is idempotent (double logout returns 200) | Integration |
| GET /auth/me returns current user when authenticated | Integration |
| GET /auth/me returns 401 without token | Integration |
| Change password with correct current password succeeds | Integration |
| Change password with wrong current password returns 401 | Integration |
| Change password with non-matching confirmPassword returns 422 | Integration |

### User Management Tests

| Test Case | Type |
|---|---|
| Create user with valid data returns 201 | Integration |
| Create user with duplicate email returns 409 | Integration |
| Create user without permission returns 403 | Integration |
| List users requires `user.view` permission | Integration |
| Get user by ID returns correct user | Integration |
| Get non-existent user returns 404 | Integration |
| Update user email succeeds | Integration |
| Update user with no fields returns 400 | Integration |
| Delete user succeeds (soft delete) | Integration |
| User cannot delete their own account | Integration |
| Last Super Admin cannot be deleted | Integration |
| Lock account changes status to LOCKED | Integration |
| Admin reset password revokes all user tokens | Integration |

### Middleware Tests

| Test Case | Type |
|---|---|
| authenticate passes with valid token | Unit |
| authenticate throws 401 with missing Authorization header | Unit |
| authenticate throws 401 with expired token | Unit |
| authenticate throws 403 if account is locked | Unit |
| authorize passes when user has required permission | Unit |
| authorize throws 403 when user lacks permission | Unit |
| authorize throws 401 when currentUser not attached | Unit |

## 24.2 Test Setup Pattern

Tests use the existing `createApp()` factory with a mock database checker pattern (as seen in `health.test.ts`). For database-dependent tests, a dedicated test database is used (already configured in `setup.ts`).

```typescript
// Pattern from existing tests
describe('POST /api/v1/auth/login', () => {
  it('returns 200 with valid credentials', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'superadmin', password: 'Admin@123456' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();
  });
});
```

## 24.3 What NOT to Test in Phase 1

- Performance benchmarks (Phase 17)
- End-to-end browser tests (Phase 18)
- Multi-device session tests (Phase 20)
- Biometric or 2FA flows (Phase 20)

---

# 25. Environment Variables

No new environment variables are required. The following already exist in `backend/.env.example` and `env.ts`:

| Variable | Purpose | Constraint |
|---|---|---|
| `JWT_SECRET` | Signs access tokens | Minimum 32 characters |
| `REFRESH_TOKEN_SECRET` | Signs refresh tokens | Minimum 32 characters, different from JWT_SECRET |

The `env.ts` already validates both. No changes needed.

---

# 26. Implementation Checklist

Phase 1 is complete when all of the following are done.

### Database
- [ ] `refresh_token` model added to `schema.prisma`
- [ ] `login_history` model added to `schema.prisma`
- [ ] Migration created and applied (`add-auth-tables`)
- [ ] Seed script created in `backend/seed/seed.ts`
- [ ] Seed script executed successfully (8 roles, permissions, Super Admin)

### Backend
- [ ] `backend/src/modules/auth/` created with all 7 files
- [ ] `backend/src/modules/users/` created with all 7 files
- [ ] `authenticate.middleware.ts` created
- [ ] `authorize.middleware.ts` created
- [ ] `authRateLimiter` added to `rate-limit.middleware.ts`
- [ ] `express.d.ts` extended with `currentUser`
- [ ] Auth routes registered in `v1.routes.ts`
- [ ] User routes registered in `v1.routes.ts`
- [ ] All 7 auth endpoints implemented and working
- [ ] All 7 user management endpoints implemented and working
- [ ] Audit logging working for all 11 action types
- [ ] All validation schemas tested
- [ ] All tests passing

### Frontend
- [ ] `frontend/src/modules/auth/` created with full structure
- [ ] `AuthContext.tsx` and `AuthProvider` implemented
- [ ] `useAuth.ts` hook implemented
- [ ] `useLogin.ts` mutation implemented
- [ ] `useLogout.ts` mutation implemented
- [ ] `ProtectedRoute.tsx` component implemented
- [ ] `apiClient.ts` updated with auth headers and silent refresh
- [ ] `LoginPage.tsx` implemented
- [ ] Router updated with protected routes
- [ ] Auth state persists through page refresh (via /auth/me + cookie)

### Quality
- [ ] TypeScript strict mode passes with zero errors (`npm run typecheck`)
- [ ] ESLint passes with zero warnings (`npm run lint`)
- [ ] All tests pass (`npm run test`)
- [ ] Prettier formatting passes (`npm run format:check`)
- [ ] No passwords appear in any log file
- [ ] No tokens appear in any log file

---

# 27. Out of Scope for Phase 1

The following are **intentionally excluded** from Phase 1:

- Email-based password reset (SMTP not configured until Phase 15)
- Two-Factor Authentication (Phase 20)
- OAuth / Google / Microsoft login (Phase 20)
- White-label school branding on login page (Phase 2)
- AcademicYear-aware permissions (Phase 5)
- Session listing / device management UI (Phase 16)
- Permission caching / Redis (Phase 17)
- Brute-force IP blocking beyond account lockout (Phase 17)
- Audit log export to CSV/PDF (Phase 14)
- Custom role creation UI (Phase 16)

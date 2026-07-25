# School ERP Development Rules

Version: 1.0

Status: Final

Document Type: Development Rules & Standards

---

# 1. Purpose

This document defines mandatory development rules for the School ERP.

These rules apply to:

- Developers
- AI Coding Agents
- Future Contributors

These rules are mandatory.

---

# 2. Core Principles

The system must always be:

- Secure
- Modular
- Maintainable
- Scalable
- Readable
- Testable
- Extensible
- Production Ready

---

# 3. Development Philosophy

Every feature must follow:

Design

↓

Database

↓

API

↓

Backend

↓

Frontend

↓

Testing

↓

Documentation

Never skip steps.

---

# 4. Clean Architecture

Application Layers

Presentation

↓

API

↓

Business Logic

↓

Repository

↓

Database

Never bypass layers.

---

# 5. Single Responsibility

Every file should have one responsibility.

Example

StudentService

Only student business logic.

StudentController

Only request handling.

StudentRepository

Only database operations.

---

# 6. Folder Rules

Each module must contain

Controller

Service

Repository

Validator

Routes

Types

DTO

Tests

---

# 7. Backend Rules

Controllers

- Receive request
- Validate request
- Call Service
- Return response

No business logic.

---

Services

Contain all business logic.

No HTTP code.

---

Repositories

Only communicate with Prisma.

No validation.

No business logic.

---

# 8. Frontend Rules

Every page must include

Loading State

Error State

Empty State

Permission Check

Validation

Responsive Layout

---

# 9. Database Rules

Use UUID

Use Foreign Keys

Use Indexes

Use Soft Delete

Never remove production data.

Audit critical changes.

---

# 10. API Rules

REST only.

Version every endpoint.

Example

/api/v1/students

/api/v1/teachers

Return JSON only.

---

# 11. Validation Rules

Validate on

Frontend

↓

Backend

↓

Database

Never trust client input.

---

# 12. Authentication Rules

JWT

Refresh Token

bcrypt Password Hashing

Session Tracking

Login History

---

# 13. Authorization Rules

Authentication

↓

Role

↓

Permission

↓

Business Rule

↓

Database

Every request must pass all checks.

---

# 14. Coding Standards

Use TypeScript Strict Mode.

Avoid any.

Prefer interfaces.

Use async/await.

No callback hell.

No duplicated logic.

---

# 15. Naming Convention

Files

kebab-case

Components

PascalCase

Variables

camelCase

Database

snake_case

Constants

UPPER_CASE

---

# 16. Error Handling

Global Error Handler.

Meaningful messages.

Never expose stack traces.

Log all unexpected errors.

---

# 17. Logging Rules

Maintain

Application Log

Audit Log

Activity Log

Security Log

Error Log

Logs are immutable.

---

# 18. Security Rules

HTTPS

JWT

RBAC

Rate Limiting

Input Sanitization

Parameterized Queries

Secure File Upload

Security Headers

Password Hashing

Audit Logging

---

# 19. File Upload Rules

Allowed Types

jpg

jpeg

png

pdf

docx

xlsx

Maximum File Size

Configurable

Virus scanning ready.

---

# 20. UI Rules

Maximum three clicks to reach major functions.

Consistent spacing.

Consistent typography.

Professional colours.

Responsive design.

No clutter.

---

# 21. Performance Rules

Pagination

Lazy Loading

Database Indexes

Optimized Queries

Image Compression

Caching Ready

---

# 22. Git Rules

Small commits.

Meaningful commit messages.

Never commit

.env

node_modules

Database backups

Secrets

API Keys

Generated files

---

# 23. Testing Rules

Every module should support

Unit Testing

API Testing

Integration Testing

Manual Testing

Regression Testing

---

# 24. Documentation Rules

Every module must include

Overview

Database

API

Business Rules

Permissions

Future Scope

---

# 25. Configuration Rules

Nothing hardcoded.

Everything configurable.

Examples

School Name

Logo

Board

Language

Academic Pattern

Fee Pattern

Theme

SMTP

SMS

---

# 26. Business Rules

Historical data is never deleted.

Students remain searchable forever.

Every academic session remains independent.

Promotion creates new records.

Transfer Certificate closes active records but preserves history.

Financial records are immutable.

---

# 27. AI Development Rules

AI must never

Delete existing features.

Rename database tables without approval.

Remove APIs.

Change business rules.

Modify security.

Ignore documentation.

AI must always

Read project documentation first.

Follow coding standards.

Maintain backward compatibility.

Generate production-ready code.

---

# 28. Deployment Rules

One School

↓

One Server

↓

One PostgreSQL Database

↓

One Domain

↓

One Backup Strategy

Schools own their data.

No SaaS architecture.

---

# 29. Golden Rules

Security First

Database First

API First

Reusable Code

Configuration Over Hardcoding

Documentation Before Development

Quality Over Speed

Never Break Existing Features

Always Preserve Historical Data


# School ERP Coding Standards

Version: 1.0

Status: Final

Document Type: Coding Standards

---

# 1. Purpose

Defines coding standards for the complete School ERP project.

Every developer and AI coding assistant must follow these standards.

---

# 2. General Principles

- Write clean code.
- Write readable code.
- Write reusable code.
- Write maintainable code.
- Keep functions small.
- Keep modules independent.

---

# 3. TypeScript

Always use:

- TypeScript Strict Mode
- Interfaces
- Enums where appropriate
- Explicit return types
- Async/Await

Avoid

- any
- implicit types
- callback hell

---

# 4. Backend Standards

Folder Structure

Controller

↓

Service

↓

Repository

↓

Prisma

Controller

- Handle HTTP only

Service

- Business Logic only

Repository

- Database only

---

# 5. Frontend Standards

Pages

↓

Components

↓

Hooks

↓

Services

↓

API

Rules

- Reusable components
- No duplicated UI
- Responsive
- Accessible

---

# 6. Naming Standards

Files

kebab-case

Example

student-service.ts

Components

PascalCase

StudentCard.tsx

Variables

camelCase

studentName

Database

snake_case

student_id

Constants

UPPER_CASE

MAX_FILE_SIZE

---

# 7. Functions

Maximum

40–50 lines

One responsibility.

Descriptive names.

Avoid nested conditions.

---

# 8. Comments

Explain WHY.

Not WHAT.

Remove outdated comments.

---

# 9. Error Handling

Always

try/catch

Return standard API responses.

Log unexpected errors.

---

# 10. Database

Never write raw SQL unless necessary.

Always use Prisma.

Use transactions for financial operations.

Use indexes.

---

# 11. API

REST

Versioned

JSON

Consistent response structure.

---

# 12. Git

Small commits.

Clear commit messages.

Feature branches.

Pull Request before merge (future).

---

# 13. Security

Never expose secrets.

Never hardcode passwords.

Never trust client input.

Always validate.

---

# 14. Performance

Pagination

Lazy Loading

Memoization

Optimized Queries

Code Splitting

Caching Ready

---

# 15. Code Review Checklist

✓ Clean

✓ Tested

✓ Documented

✓ Secure

✓ No duplication

✓ Production Ready
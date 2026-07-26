# School ERP Naming Conventions

Version: 1.0

Status: Final

---

# File Names

Use kebab-case

Example

student-service.ts

fee-controller.ts

attendance-report.ts

---

# React Components

Use PascalCase

StudentCard.tsx

FeeReceipt.tsx

AttendanceTable.tsx

---

# Variables

Use camelCase

studentName

feeAmount

attendanceStatus

---

# Constants

Use UPPER_CASE

MAX_UPLOAD_SIZE

DEFAULT_PAGE_SIZE

JWT_SECRET

---

# Database Tables

Use snake_case

student

student_attendance

fee_receipt

employee_leave

---

# Database Columns

Use snake_case

student_id

created_at

updated_at

is_active

---

# API Endpoints

Plural Resources

/students

/teachers

/fees

/attendance

/examinations

---

# Git Branches

feature/student-module

feature/attendance

bugfix/login

hotfix/security

release/v1.0.0

---

# Commit Messages

feat:

fix:

docs:

refactor:

style:

test:

chore:

Examples

feat: add student admission

fix: correct attendance calculation

docs: update deployment guide

---

# Versioning

Follow Semantic Versioning

Major.Minor.Patch

Examples

1.0.0

1.1.0

1.1.1

---

# Naming Principles

- Be descriptive.
- Avoid abbreviations unless standard.
- Maintain consistency.
- Prefer readability over brevity.
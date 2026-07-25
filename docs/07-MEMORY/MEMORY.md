# School ERP Project Memory

Version: 1.0

Status: Permanent

Document Type: Project Memory

---

# 1. Purpose

This document stores all permanent decisions made during the project.

It acts as the project's long-term memory.

Future developers and AI assistants must read this document before making architectural or business decisions.

---

# 2. Project Vision

The objective is to build a commercial-grade School ERP System for individual schools.

The system must be production-ready, scalable, secure, and easy to customize.

Each school owns its own installation.

---

# 3. Deployment Model

One School

↓

One Server

↓

One PostgreSQL Database

↓

One Domain

↓

One Installation

The project is NOT SaaS.

The project is NOT multi-tenant.

---

# 4. Target Schools

Supported Classes

- Nursery
- LKG
- UKG
- Grade 1–10
- Grade 11–12

Streams

- Science
- Commerce
- Arts

---

# 5. Academic Sessions

Each academic year is independent.

Examples

2026–27

2027–28

2028–29

Historical academic sessions are never modified.

---

# 6. Student Lifecycle

Admission

↓

Active Student

↓

Promotion

↓

Graduation

↓

Alumni

OR

Transfer Certificate

↓

Inactive Student

Student records are never permanently deleted.

---

# 7. Employee Lifecycle

Recruitment

↓

Joining

↓

Active

↓

Resignation / Retirement

↓

Inactive

Employee records remain permanently available.

---

# 8. Historical Data Policy

Never delete:

- Students
- Employees
- Fee Records
- Attendance
- Examination Results
- Report Cards
- Audit Logs
- Activity Logs
- Financial Transactions

Historical records are read-only.

---

# 9. User Roles

- Super Admin
- Principal
- Admin
- Accountant (CA)
- Teacher
- Parent
- Student
- Alumni

Future roles may be added.

---

# 10. Principal Permissions

The Principal has read-only access to all school data.

The Principal can:

- View students
- View staff
- View attendance
- View examinations
- View reports
- View fees
- View documents
- Search any student
- Search alumni
- Search historical records

The Principal does not approve operational changes.

---

# 11. Admin Permissions

Admin manages:

- Admissions
- Students
- Staff
- Academic Year
- Fees
- Attendance
- Examinations
- Certificates
- Website
- Documents

Admin performs approvals and operational updates.

---

# 12. Accountant (CA)

The Accountant manages:

- Fee Collection
- Discounts
- Scholarships
- Refunds
- Receipts
- Financial Reports

No academic permissions.

---

# 13. Student History

Every student has one permanent profile.

The profile stores:

- Personal Information
- Parents
- Academic History
- Attendance
- Fees
- Examination Results
- Certificates
- Documents
- Timeline

This record is permanent.

---

# 14. Transfer Certificate Policy

When a student receives a Transfer Certificate:

- Status changes to Inactive.
- Future attendance stops.
- Future fee generation stops.
- Future examination participation stops.
- Login becomes historical (read-only).
- Previous records remain available forever.

---

# 15. Promotion Policy

Promotion creates a new academic record.

Old records remain unchanged.

Students can view previous academic years.

---

# 16. Fee Policy

Fee history is immutable.

Receipts are never deleted.

Refunds create separate records.

All financial transactions remain auditable.

---

# 17. Document Policy

Documents include:

- Transfer Certificate
- Marksheet
- Bonafide Certificate
- Character Certificate
- Birth Certificate
- Migration Certificate

The system tracks:

- Issued
- Pending
- Collected

Students and parents can view document status.

---

# 18. Security Policy

Passwords are hashed.

JWT Authentication.

Role-Based Access Control.

Audit every critical action.

No sensitive information in logs.

---

# 19. Website Policy

The public website shares the same database as the ERP.

Website modules include:

- Home
- About
- Academics
- Admissions
- Gallery
- News
- Events
- Downloads
- Contact

Website content is managed from the ERP.

---

# 20. Future Expansion

The architecture must support:

- Mobile App
- AI Assistant
- WhatsApp Integration
- SMS
- Email
- RFID
- GPS
- Face Recognition
- Payroll
- Hostel
- LMS
- Online Exams

---

# 21. Coding Philosophy

Database First

↓

API First

↓

Backend

↓

Frontend

↓

Testing

↓

Deployment

---

# 22. Permanent Decisions

- One installation per school.
- PostgreSQL database.
- React frontend.
- Express backend.
- TypeScript everywhere.
- Prisma ORM.
- JWT Authentication.
- Local file storage by default.
- Schools own their data.
- Historical records are never deleted.
- Modular architecture.
- Future-ready design.

---

# 23. AI Instructions

Before generating code, AI must:

- Read PRD.md
- Read DATABASE.md
- Read ARCHITECTURE.md
- Read DESIGN.md
- Read RULES.md
- Read PHASES.md
- Read MEMORY.md

AI must never change business rules without explicit approval.

---

# 24. Project Goal

Deliver a commercial School ERP that is:

- Professional
- Secure
- Scalable
- Maintainable
- Easy to deploy
- Easy to customize
- Suitable for schools from Nursery to Grade 12
- Ready for long-term commercial use

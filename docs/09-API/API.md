# School ERP REST API Specification

Version: 1.0

Status: Final

Document Type: API Specification

---

# 1. Purpose

This document defines the REST API standards for the School ERP.

All APIs must follow this specification.

---

# 2. API Standards

Protocol

HTTPS

Architecture

REST

Data Format

JSON

Versioning

/api/v1/

Example

/api/v1/students

---

# 3. Standard Response

Success

{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {}
}

Error

{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}

---

# 4. HTTP Status Codes

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# 5. Authentication APIs

POST /api/v1/auth/login

POST /api/v1/auth/logout

POST /api/v1/auth/refresh-token

POST /api/v1/auth/forgot-password

POST /api/v1/auth/reset-password

GET /api/v1/auth/profile

PUT /api/v1/auth/change-password

---

# 6. School APIs

GET /schools

GET /schools/{id}

POST /schools

PUT /schools/{id}

DELETE /schools/{id}

---

# 7. Academic Year APIs

GET /academic-years

POST /academic-years

PUT /academic-years/{id}

DELETE /academic-years/{id}

POST /academic-years/{id}/activate

---

# 8. Student APIs

GET /students

GET /students/{id}

POST /students

PUT /students/{id}

DELETE /students/{id}

GET /students/{id}/timeline

GET /students/{id}/documents

GET /students/{id}/attendance

GET /students/{id}/fees

GET /students/{id}/results

POST /students/{id}/promote

POST /students/{id}/transfer

POST /students/{id}/graduate

---

# 9. Parent APIs

GET /parents

POST /parents

PUT /parents/{id}

DELETE /parents/{id}

GET /parents/{id}/children

---

# 10. Employee APIs

GET /employees

POST /employees

PUT /employees/{id}

DELETE /employees/{id}

GET /employees/{id}/attendance

GET /employees/{id}/leave

GET /employees/{id}/subjects

---

# 11. Attendance APIs

GET /attendance

POST /attendance

PUT /attendance/{id}

GET /attendance/report

POST /attendance/correction

POST /attendance/leave

---

# 12. Examination APIs

GET /examinations

POST /examinations

PUT /examinations/{id}

POST /marks

PUT /marks/{id}

POST /results/publish

GET /report-cards/{studentId}

---

# 13. Fee APIs

GET /fees

POST /fees

POST /payments

GET /payments

GET /receipts/{id}

POST /refunds

GET /outstanding-fees

---

# 14. Library APIs

GET /books

POST /books

PUT /books/{id}

POST /books/issue

POST /books/return

GET /books/overdue

---

# 15. Transport APIs

GET /vehicles

GET /routes

POST /routes

POST /student-transport

---

# 16. Inventory APIs

GET /inventory

POST /inventory

PUT /inventory/{id}

POST /stock

GET /suppliers

POST /suppliers

---

# 17. Website APIs

GET /website/pages

POST /website/pages

PUT /website/pages/{id}

GET /news

POST /news

GET /events

POST /events

GET /gallery

POST /gallery

GET /downloads

POST /admission-enquiry

POST /contact

---

# 18. Dashboard APIs

GET /dashboard/admin

GET /dashboard/principal

GET /dashboard/teacher

GET /dashboard/student

GET /dashboard/parent

---

# 19. Reports APIs

GET /reports/students

GET /reports/attendance

GET /reports/examinations

GET /reports/fees

GET /reports/library

GET /reports/transport

GET /reports/inventory

---

# 20. Notification APIs

GET /notifications

POST /notifications

PUT /notifications/{id}/read

DELETE /notifications/{id}

---

# 21. Settings APIs

GET /settings

PUT /settings

GET /backup

POST /backup

POST /restore

---

# 22. Query Parameters

Pagination

?page=1

&pageSize=20

Sorting

?sort=name

?order=asc

Filtering

?class=10

?section=A

Searching

?search=krishna

---

# 23. Validation

Every API validates:

Authentication

↓

Authorization

↓

Request Data

↓

Business Rules

↓

Database

---

# 24. API Security

JWT Required

HTTPS Only

Rate Limiting

Input Validation

Permission Check

Audit Logging

---

# 25. API Documentation

Every endpoint must include:

Purpose

Request

Response

Validation

Permissions

Error Codes

Examples

---

# 26. Versioning

Current

/api/v1/

Future

/api/v2/

Breaking changes require a new version.

---

# 27. Error Codes

AUTH_001

Authentication Failed

AUTH_002

Invalid Token

AUTH_003

Session Expired

VAL_001

Validation Error

DB_001

Database Error

PERM_001

Permission Denied

SYS_001

Unexpected Error

---

# 28. Performance

Pagination

Filtering

Sorting

Caching Ready

Compression

Optimized Queries

---

# 29. Future APIs

Mobile APIs

AI APIs

WhatsApp APIs

Payment Gateway

RFID

GPS

Face Recognition

LMS

Online Examination

---

# 30. API Principles

REST First

Version Controlled

Secure by Default

Consistent Responses

Minimal Payloads

Backward Compatible

Fully Documented5

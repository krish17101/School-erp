# School ERP Folder Structure

Version: 1.0

Status: Final

Document Type: Project Structure

---

# 1. Purpose

This document defines the standard folder structure for the School ERP.

Every developer and AI coding assistant must follow this structure.

---

# 2. Root Structure

school-erp/

docs/

frontend/

backend/

database/

scripts/

deployment/

tests/

assets/

---

# 3. Frontend Structure

frontend/

src/

assets/

components/

common/

ui/

forms/

tables/

charts/

layouts/

pages/

auth/

dashboard/

students/

teachers/

parents/

attendance/

examinations/

fees/

library/

transport/

inventory/

website/

settings/

hooks/

services/

api/

contexts/

types/

utils/

constants/

styles/

routes/

---

# 4. Backend Structure

backend/

src/

config/

controllers/

services/

repositories/

middlewares/

routes/

validators/

dto/

types/

constants/

utils/

jobs/

database/

prisma/

seed/

uploads/

logs/

---

# 5. Module Structure

Every module must contain

controller

service

repository

route

validator

dto

types

tests

Example

student/

student.controller.ts

student.service.ts

student.repository.ts

student.routes.ts

student.validator.ts

student.dto.ts

student.types.ts

student.test.ts

---

# 6. Database Structure

database/

migrations/

seed/

schema/

backup/

restore/

---

# 7. Documentation Structure

docs/

01-PRD

02-DATABASE

03-ARCHITECTURE

04-DESIGN

05-RULES

06-PHASES

07-MEMORY

08-SECURITY

09-API

10-DEPLOYMENT

11-CODING-STANDARDS

12-TESTING

13-FOLDER-STRUCTURE

14-NAMING-CONVENTIONS

---

# 8. Asset Structure

assets/

images/

icons/

logos/

documents/

templates/

---

# 9. Upload Structure

uploads/

students/

employees/

documents/

certificates/

gallery/

website/

temp/

---

# 10. Principles

- One responsibility per folder.
- No duplicate files.
- Keep modules independent.
- Keep reusable components in common folders.
- Separate business logic from presentation.
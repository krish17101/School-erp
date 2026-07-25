# School ERP Database Design

Version: 1.0

Status: Draft

Document Type: Database Blueprint

---

# 1. Purpose

This document defines the complete database architecture for the School ERP & Website Platform.

It serves as the single source of truth for all database-related decisions.

No SQL should be written before this blueprint is finalized.

---

# 2. Database Philosophy

The database shall be designed according to the following principles.

- PostgreSQL
- One database per school
- One deployment per school
- Vendor independent
- No SaaS architecture
- Normalized design
- High performance
- Scalable
- Secure
- Audit friendly
- Future ready

---

# 3. Core Design Principles

## Permanent Data

The following data shall never be permanently deleted.

- Students
- Teachers
- Parents
- Academic Years
- Fee Receipts
- Report Cards
- Examination Results
- Certificates

Status changes shall be used instead of permanent deletion.

---

## Soft Delete

Whenever possible, records should use soft delete.

Typical fields:

- is_deleted
- deleted_at
- deleted_by

---

## Audit First

Every important table shall include:

created_at

updated_at

created_by

updated_by

Audit Logs shall record every critical operation.

---

## UUID Policy

Every major table shall use UUID as the internal primary key.

Examples:

School

Student

Teacher

Parent

User

Attendance

Fee

Exam

Marks

Certificate

Human-readable IDs (Admission Number, Employee ID, Receipt Number, etc.) will also be stored separately where required.

---

## Academic Year Driven

Academic Year is the central entity.

Attendance

Fees

Examinations

Report Cards

Subject Allocation

Timetable

Promotion

All belong to an Academic Year.

Historical records must never be modified after the Academic Year is closed.

---

# 4. Database Naming Standards

## Tables

Use snake_case.

Examples

student

student_attendance

fee_receipt

teacher_subject

---

## Columns

Use snake_case.

Examples

first_name

date_of_birth

created_at

updated_at

---

## Foreign Keys

Always end with _id.

Examples

student_id

teacher_id

school_id

academic_year_id

---

## Boolean Fields

Prefix with is_

Examples

is_active

is_deleted

is_verified

---

## Date Fields

Use descriptive names.

Examples

admission_date

joining_date

issue_date

payment_date

---

# 5. Standard Fields

Every major table shall contain the following fields unless there is a justified exception.

- id
- created_at
- updated_at
- created_by
- updated_by
- is_active
- is_deleted

This ensures consistency across the application.

---

# 6. Master Tables

Master tables store the core information used throughout the ERP.

These tables should be created before all other modules.

Master Tables:

- School
- Academic Year
- Board
- Class
- Section
- Stream
- Subject
- Department
- Designation
- User
- Role
- Permission

---

# 7. Table: School

## Purpose

Stores the basic information of the school.

Only one record will exist in each school's database.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| school_name | VARCHAR(200) | Official School Name |
| school_code | VARCHAR(50) | Unique School Code |
| registration_number | VARCHAR(100) | Government Registration |
| affiliation_number | VARCHAR(100) | Board Affiliation Number |
| board_id | UUID | Education Board |
| email | VARCHAR(150) | Official Email |
| phone | VARCHAR(30) | Contact Number |
| website | VARCHAR(200) | Website URL |
| address | TEXT | School Address |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State |
| country | VARCHAR(100) | Country |
| postal_code | VARCHAR(20) | ZIP / PIN Code |
| logo | TEXT | Logo File Path |
| principal_name | VARCHAR(150) | Principal Name |
| established_year | INTEGER | Year Established |
| created_at | TIMESTAMP | Record Creation Time |
| updated_at | TIMESTAMP | Last Update Time |

## Business Rules

- Only one school record is allowed.
- School information can be updated but never deleted.
- Logo changes should preserve previous versions if audit logging is enabled.

---

# 8. Table: Academic Year

## Purpose

Stores all academic sessions.

Example:

2025-2026

2026-2027

2027-2028

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| name | VARCHAR(50) | Academic Year Name |
| start_date | DATE | Session Start |
| end_date | DATE | Session End |
| is_current | BOOLEAN | Current Session |
| status | VARCHAR(30) | Upcoming / Active / Closed |
| created_at | TIMESTAMP | Created Time |
| updated_at | TIMESTAMP | Updated Time |

## Business Rules

- Only one Academic Year can be Active.
- Closed Academic Years become read-only.
- Student promotion creates records for the next Academic Year.
- Historical records remain unchanged.

---

# 9. Table: Board

## Purpose

Stores supported education boards.

Examples:

- CBSE
- ICSE
- State Board
- IB
- Cambridge
- Custom Board

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| board_name | VARCHAR(100) | Board Name |
| board_code | VARCHAR(20) | Short Code |
| description | TEXT | Optional Description |
| is_active | BOOLEAN | Active Status |

## Business Rules

- Board names must be unique.
- Boards should not be deleted if linked to academic records.

---

# 10. Table: Class

## Purpose

Stores all classes available in the school.

Examples:

- Nursery
- LKG
- UKG
- Class 1
- Class 2
- ...
- Class 12

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| class_name | VARCHAR(100) | Class Name |
| class_order | INTEGER | Display Order |
| board_id | UUID | Education Board |
| stream_required | BOOLEAN | Applicable for Senior Classes |
| is_active | BOOLEAN | Active Status |

## Business Rules

- Class names should be unique within a board.
- Class order determines display sequence.

---

# 11. Table: Section

## Purpose

Stores sections for each class.

Examples:

- A
- B
- C
- D

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| class_id | UUID | Linked Class |
| section_name | VARCHAR(20) | Section Name |
| class_teacher_id | UUID | Assigned Class Teacher |
| capacity | INTEGER | Maximum Students |
| is_active | BOOLEAN | Active Status |

## Business Rules

- Section names should be unique within the same class.
- Student count should not exceed capacity.

---

# 12. Table: Stream

## Purpose

Stores streams for higher secondary education.

Examples:

- Science
- Commerce
- Arts
- General

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| stream_name | VARCHAR(100) | Stream Name |
| stream_code | VARCHAR(20) | Short Code |
| description | TEXT | Optional Description |
| is_active | BOOLEAN | Active Status |

## Business Rules

- Stream names must be unique.
- Streams are mainly applicable for Classes 11 and 12.

---

# 13. Table: Subject

## Purpose

Stores all academic subjects.

Examples:

- Mathematics
- Science
- English
- Computer Science

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| subject_name | VARCHAR(150) | Subject Name |
| subject_code | VARCHAR(30) | Subject Code |
| board_id | UUID | Education Board |
| stream_id | UUID | Optional Stream |
| is_optional | BOOLEAN | Optional Subject |
| is_active | BOOLEAN | Active Status |

## Business Rules

- Subject code must be unique.
- A subject may belong to a specific stream or be common across streams.

---

# 14. Table: Department

## Purpose

Stores departments within the school.

Examples:

- Administration
- Accounts
- Academics
- Library
- Transport
- Laboratory

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| department_name | VARCHAR(100) | Department Name |
| description | TEXT | Description |
| is_active | BOOLEAN | Active Status |

## Business Rules

- Department names must be unique.

---

# 15. Table: Designation

## Purpose

Stores employee designations.

Examples:

- Principal
- Vice Principal
- Teacher
- Accountant
- Librarian
- Receptionist

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| designation_name | VARCHAR(100) | Designation |
| department_id | UUID | Department |
| description | TEXT | Description |
| is_active | BOOLEAN | Active Status |

## Business Rules

- Designation belongs to one department.
- A department can contain multiple designations.

---

# 16. Table: User

## Purpose

Stores login accounts for all users.

Every login in the ERP must have one User record.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| username | VARCHAR(100) | Login Username |
| email | VARCHAR(150) | Email Address |
| password_hash | TEXT | Encrypted Password |
| role_id | UUID | Assigned Role |
| is_email_verified | BOOLEAN | Email Verification |
| last_login | TIMESTAMP | Last Login |
| account_status | VARCHAR(30) | Active / Locked / Disabled |
| created_at | TIMESTAMP | Created Time |
| updated_at | TIMESTAMP | Updated Time |

## Business Rules

- Passwords are never stored in plain text.
- Username and email must be unique.
- Locked accounts cannot log in.

---

# 17. Table: Role

## Purpose

Defines system roles.

Examples:

- Super Admin
- Admin
- Principal
- Teacher
- Parent
- Student
- Alumni

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| role_name | VARCHAR(100) | Role Name |
| description | TEXT | Description |
| is_system_role | BOOLEAN | Default Role |
| is_active | BOOLEAN | Active Status |

## Business Rules

- System roles cannot be deleted.
- Custom roles may be created if required.

---

# 18. Table: Permission

## Purpose

Defines individual permissions used by Role-Based Access Control (RBAC).

Examples:

- student.view
- student.create
- student.update
- student.delete
- fee.collect
- exam.publish

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| permission_name | VARCHAR(150) | Permission Key |
| module_name | VARCHAR(100) | Related Module |
| description | TEXT | Description |

## Business Rules

- Permission names must be unique.
- Permissions are assigned through roles, not directly to users.

---

# 19. Table: Role Permission

## Purpose

Maps Roles to Permissions.

This enables flexible Role-Based Access Control.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| role_id | UUID | Role |
| permission_id | UUID | Permission |

## Business Rules

- One role can have many permissions.
- One permission can belong to many roles.
- Duplicate role-permission combinations are not allowed.

---

# Master Table Relationships

School
│
├── Academic Year
├── Board
│   ├── Class
│   │   ├── Section
│   │   └── Subject
│   └── Stream
│
├── Department
│   └── Designation
│
└── User
    ├── Role
    │   └── Permission
    └── Profile (Student / Teacher / Parent / Staff)

    ---

# 20. Student Module

The Student Module stores every piece of information related to a student throughout their lifecycle.

Student Lifecycle

Admission Enquiry
        ↓
Admission Application
        ↓
Admitted
        ↓
Active Student
        ↓
Promoted (Every Academic Year)
        ↓
Graduated / Transferred / Dropped
        ↓
Alumni

Student records are never permanently deleted.

---

# 21. Table: Student

## Purpose

Stores permanent student information.

One record represents one person for life.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| admission_number | VARCHAR(50) | Unique Admission Number |
| roll_number | VARCHAR(30) | Current Roll Number |
| first_name | VARCHAR(100) | First Name |
| middle_name | VARCHAR(100) | Middle Name |
| last_name | VARCHAR(100) | Last Name |
| gender | VARCHAR(20) | Gender |
| date_of_birth | DATE | Date of Birth |
| blood_group | VARCHAR(10) | Blood Group |
| nationality | VARCHAR(100) | Nationality |
| religion | VARCHAR(100) | Religion |
| category | VARCHAR(50) | Category |
| aadhaar_number | VARCHAR(20) | Aadhaar Number (Optional) |
| email | VARCHAR(150) | Email |
| mobile | VARCHAR(20) | Mobile Number |
| photo | TEXT | Student Photo |
| address | TEXT | Address |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State |
| postal_code | VARCHAR(20) | PIN Code |
| admission_date | DATE | Admission Date |
| current_status | VARCHAR(30) | Active / Alumni / Transfer / Dropped |
| created_at | TIMESTAMP | Created Time |
| updated_at | TIMESTAMP | Updated Time |

## Business Rules

- Admission Number must be unique.
- Student record can never be deleted.
- Status changes are recorded in Student Timeline.
- Roll Number may change every Academic Year.

---

# 22. Table: Student Academic History

## Purpose

Stores yearly academic records.

One student can have multiple academic history records.

Example

2025 → Class 5

2026 → Class 6

2027 → Class 7

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| academic_year_id | UUID |
| class_id | UUID |
| section_id | UUID |
| stream_id | UUID |
| roll_number | VARCHAR(30) |
| admission_status | VARCHAR(30) |
| promoted_from | UUID |
| promoted_to | UUID |

## Business Rules

- One record per student per academic year.
- Previous records become read-only after promotion.
- Historical data is never modified.

---

# 23. Table: Parent

## Purpose

Stores parent or guardian information.

One parent may have multiple children.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| father_name | VARCHAR(150) |
| mother_name | VARCHAR(150) |
| guardian_name | VARCHAR(150) |
| father_mobile | VARCHAR(20) |
| mother_mobile | VARCHAR(20) |
| guardian_mobile | VARCHAR(20) |
| email | VARCHAR(150) |
| occupation | VARCHAR(100) |
| annual_income | DECIMAL |
| address | TEXT |

## Business Rules

- Multiple students may be linked to one parent.
- Parents can access only linked students.

---

# 24. Table: Student Parent Mapping

## Purpose

Maps students to parents.

Supports siblings without duplicate parent records.

## Columns

| Column | Type |
|---------|------|
| student_id | UUID |
| parent_id | UUID |
| relationship | VARCHAR(50) |

Examples

Father

Mother

Guardian

---

# 25. Table: Student Medical Information

## Purpose

Stores medical details.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| blood_group | VARCHAR(10) |
| allergies | TEXT |
| medical_conditions | TEXT |
| medications | TEXT |
| emergency_notes | TEXT |

Medical information should only be accessible to authorized staff.

---

# 26. Table: Student Emergency Contact

## Purpose

Stores emergency contact details.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| contact_name | VARCHAR(150) |
| relationship | VARCHAR(50) |
| mobile | VARCHAR(20) |
| alternate_mobile | VARCHAR(20) |

---

# 27. Table: Student Documents

## Purpose

Stores uploaded student documents.

Examples

Birth Certificate

Transfer Certificate

Aadhaar

Passport

Photo

Report Cards

Medical Certificate

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| document_type | VARCHAR(100) |
| file_path | TEXT |
| uploaded_date | TIMESTAMP |
| uploaded_by | UUID |
| verification_status | VARCHAR(30) |

Documents are never deleted once officially verified.

---

# 28. Table: Student Timeline

## Purpose

Stores every major event in a student's journey.

Examples

Admission

Promotion

Class Change

Section Change

Fee Due

Fee Paid

Certificate Issued

Transfer

Graduation

Alumni

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| event_type | VARCHAR(100) |
| event_date | TIMESTAMP |
| description | TEXT |
| performed_by | UUID |

Timeline provides a complete audit history of the student's lifecycle.

---

# 29. Student Exit Management

The Student Exit Module manages students who leave the school.

Exit Types

- Graduated
- Transfer
- School Leaving
- Dropped
- Expelled
- Deceased

A student record is never deleted after exit.

---

# 30. Table: Student Exit

## Purpose

Stores exit information for students leaving the school.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| student_id | UUID | Student |
| academic_year_id | UUID | Academic Year |
| exit_type | VARCHAR(50) | Type of Exit |
| exit_date | DATE | Exit Date |
| reason | TEXT | Exit Reason |
| remarks | TEXT | Additional Remarks |
| approved_by | UUID | Approved By |
| created_at | TIMESTAMP | Record Created |

## Business Rules

- A student can have only one active exit record.
- Exit cannot be reversed without administrator approval.
- Student status is updated automatically after exit approval.

---

# 31. Table: Exit Checklist

## Purpose

Tracks departmental clearance before completing student exit.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| exit_id | UUID | Student Exit |
| checklist_item | VARCHAR(100) | Clearance Item |
| status | VARCHAR(30) | Pending / Approved |
| verified_by | UUID | Verified By |
| verified_date | TIMESTAMP | Verification Date |
| remarks | TEXT | Remarks |

## Default Checklist

- Fee Clearance
- Library Clearance
- Laboratory Clearance
- Transport Clearance
- Hostel Clearance (Future)
- Uniform Return (Optional)
- ID Card Returned
- Document Verification

## Business Rules

- Exit cannot be completed until all mandatory checklist items are approved.
- Each checklist item records the verifying user.

---

# 32. Table: Certificate Issue Register

## Purpose

Maintains a permanent record of every certificate issued.

## Supported Certificates

- Transfer Certificate
- Character Certificate
- Bonafide Certificate
- Migration Certificate
- Study Certificate
- Fee Certificate
- Income Certificate
- Conduct Certificate
- Marksheet
- Report Card

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| student_id | UUID | Student |
| certificate_type | VARCHAR(100) | Certificate Type |
| certificate_number | VARCHAR(100) | Unique Certificate Number |
| issue_date | DATE | Date Issued |
| issued_by | UUID | Staff Member |
| delivery_status | VARCHAR(30) | Pending / Issued / Collected |
| remarks | TEXT | Remarks |

## Business Rules

- Certificate numbers must be unique.
- Issued certificates are never deleted.
- Reissued certificates must maintain version history.

---

# 33. Table: Alumni

## Purpose

Stores alumni information after graduation.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| student_id | UUID | Linked Student |
| graduation_year | INTEGER | Graduation Year |
| highest_class | VARCHAR(50) | Final Class |
| email | VARCHAR(150) | Personal Email |
| mobile | VARCHAR(20) | Mobile Number |
| occupation | VARCHAR(150) | Occupation (Optional) |
| organization | VARCHAR(200) | Organization (Optional) |
| city | VARCHAR(100) | Current City |

## Business Rules

- Alumni are linked to the original Student record.
- Academic history remains available in read-only mode.
- Alumni login is optional and configurable.

---

# 34. Student Status Workflow

Admission Enquiry
        ↓
Application Submitted
        ↓
Admission Approved
        ↓
Active Student
        ↓
Academic Promotion
        ↓
Graduated / Transferred / Dropped
        ↓
Alumni

Every status change creates a Student Timeline entry.

---

# 35. Student Module Relationships

Student
│
├── Student Academic History
├── Student Parent Mapping
│      └── Parent
├── Student Medical Information
├── Student Emergency Contact
├── Student Documents
├── Student Timeline
├── Student Exit
│      ├── Exit Checklist
│      └── Certificate Issue Register
└── Alumni

---

# Student Module Summary

The Student Module is designed around a permanent student identity.

Key Principles:

- One permanent Student record.
- Unlimited Academic History records.
- Complete audit trail.
- Soft delete policy.
- Full document management.
- Complete exit workflow.
- Alumni support.
- Future-ready architecture.
---

# 36. Teacher & Staff Module

The Teacher & Staff Module manages all employees working in the school.

Employee Types

- Principal
- Vice Principal
- Teacher
- Accountant
- Office Administrator
- Receptionist
- Librarian
- Lab Assistant
- Transport Manager
- Driver
- Helper
- IT Administrator
- Security Staff
- Other Staff

Each employee has one permanent Employee record.

---

# 37. Table: Employee

## Purpose

Stores the master profile of every employee.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| employee_code | VARCHAR(50) | Unique Employee Code |
| first_name | VARCHAR(100) | First Name |
| middle_name | VARCHAR(100) | Middle Name |
| last_name | VARCHAR(100) | Last Name |
| gender | VARCHAR(20) | Gender |
| date_of_birth | DATE | Date of Birth |
| mobile | VARCHAR(20) | Mobile Number |
| email | VARCHAR(150) | Email |
| address | TEXT | Address |
| city | VARCHAR(100) | City |
| state | VARCHAR(100) | State |
| postal_code | VARCHAR(20) | PIN Code |
| joining_date | DATE | Joining Date |
| relieving_date | DATE | Leaving Date |
| designation_id | UUID | Employee Designation |
| department_id | UUID | Department |
| user_id | UUID | Login Account |
| photo | TEXT | Profile Photo |
| employment_status | VARCHAR(30) | Active / Resigned / Retired / Terminated |
| created_at | TIMESTAMP | Created Time |
| updated_at | TIMESTAMP | Updated Time |

## Business Rules

- Employee Code must be unique.
- Employee records are never permanently deleted.
- Employment status tracks lifecycle.

---

# 38. Table: Employee Qualification

## Purpose

Stores educational qualifications.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| employee_id | UUID |
| qualification | VARCHAR(150) |
| specialization | VARCHAR(150) |
| university | VARCHAR(150) |
| passing_year | INTEGER |
| percentage | DECIMAL(5,2) |
| certificate_path | TEXT |

## Business Rules

- One employee can have multiple qualifications.

---

# 39. Table: Employee Experience

## Purpose

Stores previous work experience.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| employee_id | UUID |
| organization_name | VARCHAR(200) |
| designation | VARCHAR(150) |
| start_date | DATE |
| end_date | DATE |
| total_years | DECIMAL(4,2) |
| remarks | TEXT |

---

# 40. Table: Employee Subject Assignment

## Purpose

Assigns subjects to teachers.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| employee_id | UUID |
| academic_year_id | UUID |
| class_id | UUID |
| section_id | UUID |
| subject_id | UUID |

## Business Rules

- Only teachers can receive subject assignments.
- Duplicate assignments are not allowed.

---

# 41. Table: Class Teacher Assignment

## Purpose

Assigns one class teacher to each section.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| academic_year_id | UUID |
| class_id | UUID |
| section_id | UUID |
| employee_id | UUID |
| effective_from | DATE |
| effective_to | DATE |

## Business Rules

- Only one active class teacher per section.
- Assignment history is preserved.

---

# 42. Table: Employee Attendance

## Purpose

Stores daily employee attendance.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| employee_id | UUID |
| attendance_date | DATE |
| status | VARCHAR(20) |
| check_in | TIMESTAMP |
| check_out | TIMESTAMP |
| remarks | TEXT |

## Status Values

- Present
- Absent
- Half Day
- Leave
- Holiday

---

# 43. Table: Employee Leave

## Purpose

Stores leave requests.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| employee_id | UUID |
| leave_type | VARCHAR(50) |
| start_date | DATE |
| end_date | DATE |
| total_days | DECIMAL(5,2) |
| reason | TEXT |
| approval_status | VARCHAR(30) |
| approved_by | UUID |

## Approval Status

- Pending
- Approved
- Rejected
- Cancelled

---

# 44. Table: Employee Documents

## Purpose

Stores employee documents.

## Examples

- Aadhaar
- PAN
- Resume
- Degree Certificate
- Experience Letter
- Appointment Letter
- Relieving Letter
- Identity Proof

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| employee_id | UUID |
| document_type | VARCHAR(100) |
| file_path | TEXT |
| uploaded_date | TIMESTAMP |
| verification_status | VARCHAR(30) |

---

# 45. Employee Module Relationships

Employee
│
├── User
├── Department
├── Designation
├── Employee Qualification
├── Employee Experience
├── Employee Documents
├── Employee Attendance
├── Employee Leave
├── Employee Subject Assignment
└── Class Teacher Assignment

---

# Employee Module Summary

Key Principles

- Permanent Employee Record
- One Login per Employee
- Multiple Qualifications
- Multiple Experiences
- Subject Assignment History
- Attendance History
- Leave History
- Document Management
- Future Payroll Compatibility
---

# 46. Academic Module

The Academic Module manages the academic structure of the school.

It includes:

- Subject Groups
- Class Subject Mapping
- Academic Calendar
- Timetable
- Periods
- Holidays
- Working Days
- Classroom Allocation

All academic operations are linked to an Academic Year.

---

# 47. Table: Subject Group

## Purpose

Groups subjects together for specific classes or streams.

Examples

Science Group

Commerce Group

Arts Group

Core Subjects

Elective Subjects

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| group_name | VARCHAR(100) | Group Name |
| class_id | UUID | Related Class |
| stream_id | UUID | Related Stream (Optional) |
| description | TEXT | Description |
| is_active | BOOLEAN | Active Status |

## Business Rules

- Group names should be unique within a class.
- Groups may contain one or many subjects.

---

# 48. Table: Class Subject Mapping

## Purpose

Maps subjects to classes.

Example

Class 5

- Mathematics
- English
- Science
- Computer

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| academic_year_id | UUID |
| class_id | UUID |
| section_id | UUID |
| subject_id | UUID |
| subject_group_id | UUID |
| employee_id | UUID |
| is_optional | BOOLEAN |

## Business Rules

- One subject can be assigned to multiple classes.
- One class contains multiple subjects.
- Teacher assignment is optional during setup.

---

# 49. Table: Period

## Purpose

Defines school periods.

Example

Period 1

Period 2

Lunch

Period 3

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| period_name | VARCHAR(50) |
| start_time | TIME |
| end_time | TIME |
| display_order | INTEGER |
| is_break | BOOLEAN |

## Business Rules

- Time ranges must not overlap.
- Period order determines timetable display.

---

# 50. Table: Timetable

## Purpose

Stores the class timetable.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| academic_year_id | UUID |
| class_id | UUID |
| section_id | UUID |
| day_of_week | VARCHAR(20) |
| period_id | UUID |
| subject_id | UUID |
| employee_id | UUID |
| classroom | VARCHAR(100) |

## Business Rules

- A teacher cannot be assigned to two classes at the same time.
- A class cannot have two subjects in the same period.
- Timetable conflicts must be prevented.

---

# 51. Table: Academic Calendar

## Purpose

Stores important academic events.

Examples

Academic Session Start

Unit Tests

Mid-Term Exams

Annual Exams

Sports Day

Annual Function

Parent Meeting

Vacation

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| academic_year_id | UUID |
| event_name | VARCHAR(200) |
| event_type | VARCHAR(100) |
| start_date | DATE |
| end_date | DATE |
| description | TEXT |

---

# 52. Table: Holiday

## Purpose

Stores official school holidays.

Examples

National Holiday

Festival

School Holiday

Emergency Holiday

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| holiday_name | VARCHAR(150) |
| holiday_date | DATE |
| holiday_type | VARCHAR(100) |
| description | TEXT |

## Business Rules

- Attendance cannot be marked on holidays.
- Holidays appear automatically in calendars.

---

# 53. Table: Working Day

## Purpose

Defines working days for attendance calculations.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| academic_year_id | UUID |
| working_date | DATE |
| day_type | VARCHAR(30) |

## Day Types

- Working
- Holiday
- Half Day
- Examination
- Event

---

# 54. Table: Classroom

## Purpose

Stores classrooms and laboratories.

Examples

Room 101

Room 205

Physics Lab

Computer Lab

Robotics Lab

Library

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| room_name | VARCHAR(100) |
| room_number | VARCHAR(50) |
| capacity | INTEGER |
| room_type | VARCHAR(50) |
| floor | VARCHAR(50) |
| building | VARCHAR(100) |
| is_active | BOOLEAN |

## Business Rules

- Room numbers should be unique.
- Capacity must be greater than zero.

---

# 55. Academic Module Relationships

Academic Year
│
├── Subject Group
├── Class Subject Mapping
├── Timetable
├── Academic Calendar
├── Working Day
│
Class
├── Section
├── Subject
├── Classroom
└── Period

Teacher
└── Timetable

---

# Academic Module Summary

Key Features

- Multi-Board Support
- Multi-Class Support
- Flexible Subject Assignment
- Conflict-Free Timetable
- Academic Calendar
- Holiday Management
- Classroom Management
- Future Scheduling Support
---

# 56. Attendance Module

The Attendance Module manages attendance for students and employees.

It supports:

- Daily Student Attendance
- Period-wise Attendance
- Teacher Attendance
- Staff Attendance
- Attendance Corrections
- Leave Requests
- Attendance Reports
- Future Biometric Integration
- Future RFID Integration
- Future QR Code Attendance

Attendance is always linked to an Academic Year.

---

# 57. Table: Student Attendance

## Purpose

Stores daily attendance for students.

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| academic_year_id | UUID | Academic Year |
| student_id | UUID | Student |
| class_id | UUID | Class |
| section_id | UUID | Section |
| attendance_date | DATE | Attendance Date |
| status | VARCHAR(20) | Attendance Status |
| remarks | TEXT | Remarks |
| marked_by | UUID | Teacher |
| marked_at | TIMESTAMP | Marking Time |

## Attendance Status

- Present
- Absent
- Late
- Half Day
- Leave
- Holiday

## Business Rules

- One attendance record per student per day.
- Future attendance cannot be entered.
- Attendance on holidays is not allowed.

---

# 58. Table: Period Attendance

## Purpose

Stores attendance for individual class periods.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_attendance_id | UUID |
| period_id | UUID |
| subject_id | UUID |
| employee_id | UUID |
| status | VARCHAR(20) |
| remarks | TEXT |

## Business Rules

- Period attendance is optional.
- Daily attendance and period attendance remain independent.

---

# 59. Table: Attendance Correction Request

## Purpose

Tracks requests to modify attendance.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| attendance_id | UUID |
| requested_by | UUID |
| requested_date | TIMESTAMP |
| current_status | VARCHAR(30) |
| requested_status | VARCHAR(30) |
| reason | TEXT |
| approved_by | UUID |
| approved_date | TIMESTAMP |

## Approval Status

- Pending
- Approved
- Rejected

## Business Rules

- Original attendance is never overwritten without approval.
- Every correction is recorded in Audit Logs.

---

# 60. Table: Student Leave Request

## Purpose

Stores leave applications submitted by students or parents.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| leave_type | VARCHAR(50) |
| start_date | DATE |
| end_date | DATE |
| total_days | DECIMAL(5,2) |
| reason | TEXT |
| attachment | TEXT |
| approval_status | VARCHAR(30) |
| approved_by | UUID |

## Leave Status

- Pending
- Approved
- Rejected
- Cancelled

---

# 61. Table: Attendance Summary

## Purpose

Stores calculated attendance summaries for faster reporting.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| academic_year_id | UUID |
| student_id | UUID |
| total_working_days | INTEGER |
| present_days | INTEGER |
| absent_days | INTEGER |
| leave_days | INTEGER |
| late_days | INTEGER |
| attendance_percentage | DECIMAL(5,2) |
| last_updated | TIMESTAMP |

## Business Rules

- Generated automatically.
- Updated after attendance changes.

---

# 62. Attendance Reports

The ERP shall generate:

- Daily Attendance Report
- Monthly Attendance Report
- Annual Attendance Report
- Class-wise Attendance
- Section-wise Attendance
- Student Attendance History
- Defaulter List
- Teacher Attendance Report
- Employee Attendance Report

Reports should support:

- PDF Export
- Excel Export
- CSV Export

---

# 63. Future Attendance Integrations

The architecture should support future integration with:

- Biometric Devices
- RFID Cards
- QR Code Attendance
- NFC Cards
- Mobile App Attendance
- GPS Attendance
- Face Recognition

These integrations should not require changes to the core attendance tables.

---

# 64. Attendance Module Relationships

Academic Year
│
├── Student Attendance
│      ├── Period Attendance
│      ├── Attendance Correction Request
│      └── Attendance Summary
│
Student
├── Student Leave Request
└── Attendance Summary

Employee
├── Student Attendance (Marked By)
└── Employee Attendance

---

# Attendance Module Summary

Key Features

- Daily Attendance
- Period Attendance
- Leave Management
- Attendance Corrections
- Attendance Analytics
- Attendance Reports
- Future Device Integration
- Audit Trail

---

# 65. Examination Module

The Examination Module manages the complete assessment lifecycle.

It supports:

- Exam Types
- Exam Schedule
- Subject-wise Marks
- Grade System
- GPA / CGPA
- Percentage Calculation
- Report Cards
- Rank Calculation
- Promotion Rules
- Result Publishing
- Student Transcripts

Every examination belongs to an Academic Year.

---

# 66. Table: Exam Type

## Purpose

Stores different examination categories.

Examples

- Unit Test
- Monthly Test
- Quarterly Examination
- Half Yearly Examination
- Pre Board Examination
- Annual Examination
- Practical Examination
- Viva

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| exam_type_name | VARCHAR(100) |
| description | TEXT |
| is_active | BOOLEAN |

## Business Rules

- Exam Type names must be unique.

---

# 67. Table: Examination

## Purpose

Stores examination details.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| academic_year_id | UUID |
| exam_type_id | UUID |
| exam_name | VARCHAR(150) |
| start_date | DATE |
| end_date | DATE |
| result_date | DATE |
| status | VARCHAR(30) |

## Status

- Draft
- Scheduled
- Ongoing
- Completed
- Published

---

# 68. Table: Exam Schedule

## Purpose

Stores subject-wise examination schedule.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| examination_id | UUID |
| class_id | UUID |
| section_id | UUID |
| subject_id | UUID |
| exam_date | DATE |
| start_time | TIME |
| end_time | TIME |
| classroom_id | UUID |
| invigilator_id | UUID |

## Business Rules

- No timetable conflicts.
- No teacher should supervise two exams simultaneously.

---

# 69. Table: Marks Entry

## Purpose

Stores marks obtained by students.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| examination_id | UUID |
| student_id | UUID |
| subject_id | UUID |
| maximum_marks | DECIMAL(6,2) |
| passing_marks | DECIMAL(6,2) |
| obtained_marks | DECIMAL(6,2) |
| practical_marks | DECIMAL(6,2) |
| internal_marks | DECIMAL(6,2) |
| remarks | TEXT |
| entered_by | UUID |
| entered_at | TIMESTAMP |

## Business Rules

- Obtained Marks cannot exceed Maximum Marks.
- Marks editing after result publication requires authorization.

---

# 70. Table: Grade System

## Purpose

Defines grading rules.

Example

| Grade | Percentage |
|--------|------------|
| A+ | 91–100 |
| A | 81–90 |
| B+ | 71–80 |
| B | 61–70 |
| C | 51–60 |
| D | 41–50 |
| F | Below 40 |

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| grade | VARCHAR(10) |
| minimum_percentage | DECIMAL(5,2) |
| maximum_percentage | DECIMAL(5,2) |
| grade_point | DECIMAL(4,2) |
| remarks | TEXT |

---

# 71. Table: Result

## Purpose

Stores calculated examination results.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| examination_id | UUID |
| student_id | UUID |
| total_marks | DECIMAL(8,2) |
| obtained_marks | DECIMAL(8,2) |
| percentage | DECIMAL(5,2) |
| grade | VARCHAR(10) |
| rank | INTEGER |
| result_status | VARCHAR(20) |
| generated_at | TIMESTAMP |

## Result Status

- Pass
- Fail
- Promoted
- Detained

---

# 72. Table: Report Card

## Purpose

Stores report card metadata.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| result_id | UUID |
| report_card_number | VARCHAR(100) |
| generated_date | DATE |
| generated_by | UUID |
| pdf_path | TEXT |
| version | INTEGER |

## Business Rules

- Report Cards are never deleted.
- Regenerated report cards increase the version number.

---

# 73. Table: Promotion History

## Purpose

Stores yearly student promotion records.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| from_class_id | UUID |
| to_class_id | UUID |
| academic_year_id | UUID |
| promotion_status | VARCHAR(30) |
| approved_by | UUID |
| promotion_date | DATE |

## Promotion Status

- Promoted
- Retained
- Graduated

---

# 74. Examination Reports

The ERP shall generate:

- Subject-wise Result
- Class-wise Result
- Section-wise Result
- Rank List
- Top Performers
- Pass Percentage
- Fail Analysis
- Subject Performance
- Student Progress Report
- Teacher Subject Performance

Reports should support:

- PDF
- Excel
- CSV

---

# 75. Examination Module Relationships

Academic Year
│
├── Examination
│      ├── Exam Schedule
│      ├── Marks Entry
│      ├── Result
│      └── Report Card
│
Student
├── Marks Entry
├── Result
├── Report Card
└── Promotion History

Subject
├── Exam Schedule
└── Marks Entry

Grade System
└── Result

---

# Examination Module Summary

Key Features

- Flexible Exam Types
- Online Marks Entry
- Grade System
- GPA / Percentage Support
- Automated Result Processing
- Report Card Generation
- Student Ranking
- Promotion History
- Complete Academic Audit

---

# 76. Fee Management Module

The Fee Management Module handles all financial transactions related to students.

It supports:

- Fee Categories
- Fee Structure
- Installments
- Student Fee Assignment
- Concessions
- Scholarships
- Late Fees
- Payments
- Receipts
- Refunds
- Financial Reports

Every financial transaction is linked to an Academic Year.

---

# 77. Table: Fee Category

## Purpose

Defines different fee types.

Examples

- Tuition Fee
- Admission Fee
- Examination Fee
- Transport Fee
- Library Fee
- Laboratory Fee
- Computer Fee
- Activity Fee
- Annual Fee

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| category_name | VARCHAR(100) |
| description | TEXT |
| is_recurring | BOOLEAN |
| is_active | BOOLEAN |

---

# 78. Table: Fee Structure

## Purpose

Defines the fee structure for each class.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| academic_year_id | UUID |
| class_id | UUID |
| fee_category_id | UUID |
| amount | DECIMAL(12,2) |
| due_date | DATE |
| installment_allowed | BOOLEAN |
| created_at | TIMESTAMP |

## Business Rules

- One fee structure per class, category, and academic year.
- Fee revisions create a new version instead of overwriting the old one.

---

# 79. Table: Student Fee Assignment

## Purpose

Assigns fee structures to individual students.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| academic_year_id | UUID |
| fee_structure_id | UUID |
| assigned_amount | DECIMAL(12,2) |
| discount_amount | DECIMAL(12,2) |
| scholarship_amount | DECIMAL(12,2) |
| final_amount | DECIMAL(12,2) |

## Business Rules

- Final Amount = Assigned Amount − Discounts − Scholarships.
- Assignment history must be preserved.

---

# 80. Table: Fee Installment

## Purpose

Stores installment schedules.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| student_fee_assignment_id | UUID |
| installment_name | VARCHAR(100) |
| due_date | DATE |
| installment_amount | DECIMAL(12,2) |
| late_fee | DECIMAL(12,2) |
| status | VARCHAR(30) |

## Status

- Pending
- Partially Paid
- Paid
- Overdue

---

# 81. Table: Fee Payment

## Purpose

Stores every payment transaction.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| installment_id | UUID |
| payment_date | DATE |
| payment_method | VARCHAR(50) |
| transaction_reference | VARCHAR(200) |
| amount_paid | DECIMAL(12,2) |
| received_by | UUID |
| remarks | TEXT |

## Payment Methods

- Cash
- UPI
- Credit Card
- Debit Card
- Bank Transfer
- Cheque
- Online Gateway (Future)

## Business Rules

- Every payment must be traceable.
- Partial payments are supported.

---

# 82. Table: Fee Receipt

## Purpose

Stores generated receipts.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| payment_id | UUID |
| receipt_number | VARCHAR(100) |
| generated_date | DATE |
| generated_by | UUID |
| pdf_path | TEXT |
| version | INTEGER |

## Business Rules

- Receipt numbers must be unique.
- Receipts are never deleted.
- Reissued receipts increase the version number.

---

# 83. Table: Fee Refund

## Purpose

Stores refunded amounts.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| payment_id | UUID |
| refund_date | DATE |
| refund_amount | DECIMAL(12,2) |
| refund_reason | TEXT |
| approved_by | UUID |

## Business Rules

- Refund amount cannot exceed original payment.
- Refund history must remain permanent.

---

# 84. Fee Reports

The ERP shall generate:

- Fee Collection Report
- Outstanding Fee Report
- Installment Report
- Daily Collection Report
- Monthly Collection Report
- Annual Collection Report
- Scholarship Report
- Discount Report
- Refund Report

Reports should support:

- PDF
- Excel
- CSV

---

# 85. Fee Module Relationships

Academic Year
│
├── Fee Structure
│      └── Fee Category
│
Student
└── Student Fee Assignment
       ├── Fee Installment
       │      └── Fee Payment
       │             ├── Fee Receipt
       │             └── Fee Refund

---

# Fee Module Summary

Key Features

- Flexible Fee Structures
- Multiple Installments
- Discounts & Scholarships
- Partial Payments
- Automatic Receipts
- Refund Management
- Financial Reports
- Future Payment Gateway Support
- Complete Financial Audit
---

# 86. Library Module

The Library Module manages books, members, book issue/return, fines, reservations and reports.

---

# 87. Table: Book Category

## Purpose

Stores book categories.

Examples

- Science
- Mathematics
- Literature
- Computer
- Robotics
- History
- Reference

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| category_name | VARCHAR(100) |
| description | TEXT |
| is_active | BOOLEAN |

---

# 88. Table: Book

## Purpose

Stores library books.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| isbn | VARCHAR(50) |
| accession_number | VARCHAR(100) |
| title | VARCHAR(250) |
| author | VARCHAR(200) |
| publisher | VARCHAR(200) |
| edition | VARCHAR(50) |
| category_id | UUID |
| language | VARCHAR(50) |
| total_copies | INTEGER |
| available_copies | INTEGER |
| shelf_location | VARCHAR(100) |
| purchase_date | DATE |
| purchase_price | DECIMAL(12,2) |
| status | VARCHAR(30) |

---

# 89. Table: Library Member

## Purpose

Links students and employees to the library.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| member_type | VARCHAR(30) |
| student_id | UUID |
| employee_id | UUID |
| membership_number | VARCHAR(100) |
| issue_limit | INTEGER |
| status | VARCHAR(30) |

---

# 90. Table: Book Issue

## Purpose

Stores issued books.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| member_id | UUID |
| book_id | UUID |
| issue_date | DATE |
| due_date | DATE |
| return_date | DATE |
| fine_amount | DECIMAL(12,2) |
| status | VARCHAR(30) |

Status

- Issued
- Returned
- Overdue
- Lost

---

# 91. Library Reports

Generate:

- Books Inventory
- Book Issue Register
- Book Return Register
- Overdue Books
- Fine Collection
- Popular Books
- Library Usage

---

# 92. Transport Module

Supports:

- Routes
- Stops
- Vehicles
- Drivers
- Student Allocation

---

# 93. Table: Vehicle

| Column | Type |
|---------|------|
| id | UUID |
| vehicle_number | VARCHAR(50) |
| vehicle_name | VARCHAR(100) |
| capacity | INTEGER |
| driver_id | UUID |
| helper_name | VARCHAR(150) |
| insurance_expiry | DATE |
| fitness_expiry | DATE |
| status | VARCHAR(30) |

---

# 94. Table: Route

| Column | Type |
|---------|------|
| id | UUID |
| route_name | VARCHAR(150) |
| route_code | VARCHAR(50) |
| distance_km | DECIMAL(8,2) |
| estimated_time | INTEGER |

---

# 95. Table: Route Stop

| Column | Type |
|---------|------|
| id | UUID |
| route_id | UUID |
| stop_name | VARCHAR(150) |
| pickup_time | TIME |
| drop_time | TIME |
| sequence_number | INTEGER |

---

# 96. Table: Student Transport

| Column | Type |
|---------|------|
| id | UUID |
| student_id | UUID |
| vehicle_id | UUID |
| route_id | UUID |
| pickup_stop_id | UUID |
| drop_stop_id | UUID |
| transport_fee | DECIMAL(12,2) |

---

# 97. Inventory Module

Supports:

- Products
- Assets
- Purchases
- Suppliers
- Stock
- Issue & Return

---

# 98. Table: Inventory Item

| Column | Type |
|---------|------|
| id | UUID |
| item_code | VARCHAR(100) |
| item_name | VARCHAR(200) |
| category | VARCHAR(100) |
| unit | VARCHAR(50) |
| quantity | DECIMAL(10,2) |
| minimum_stock | DECIMAL(10,2) |
| purchase_price | DECIMAL(12,2) |
| status | VARCHAR(30) |

---

# 99. Table: Supplier

| Column | Type |
|---------|------|
| id | UUID |
| supplier_name | VARCHAR(200) |
| contact_person | VARCHAR(150) |
| mobile | VARCHAR(20) |
| email | VARCHAR(150) |
| address | TEXT |

---

# 100. Table: Stock Transaction

| Column | Type |
|---------|------|
| id | UUID |
| item_id | UUID |
| transaction_type | VARCHAR(30) |
| quantity | DECIMAL(10,2) |
| transaction_date | DATE |
| reference_number | VARCHAR(100) |
| remarks | TEXT |

Transaction Types

- Purchase
- Issue
- Return
- Damage
- Adjustment

---

# Library / Transport / Inventory Summary

The ERP supports complete management of:

- Library
- Book Issue
- Fine Collection
- School Vehicles
- Routes
- Student Transport
- Inventory
- Assets
- Stock Movement
- Suppliers

The architecture is plugin-ready, allowing these modules to be enabled or disabled per school.

---

# 101. Website CMS Module

The Website CMS manages the complete public-facing school website.

The ERP and Website share the same database.

Modules include:

- Home Page
- About School
- Principal Message
- Management
- Academics
- Robotics & STEM Lab
- Gallery
- News
- Events
- Admissions
- Downloads
- Contact Us
- SEO

---

# 102. Table: Website Page

## Purpose

Stores editable website pages.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| page_title | VARCHAR(200) |
| page_slug | VARCHAR(200) |
| page_content | LONGTEXT |
| meta_title | VARCHAR(250) |
| meta_description | TEXT |
| featured_image | TEXT |
| publish_status | VARCHAR(30) |
| created_by | UUID |
| updated_by | UUID |

---

# 103. Table: Gallery

## Purpose

Stores image albums.

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| album_name | VARCHAR(200) |
| description | TEXT |
| cover_image | TEXT |
| created_date | DATE |

---

# 104. Table: Gallery Image

| Column | Type |
|---------|------|
| id | UUID |
| gallery_id | UUID |
| image_title | VARCHAR(200) |
| image_path | TEXT |
| uploaded_by | UUID |
| uploaded_at | TIMESTAMP |

---

# 105. Table: News

| Column | Type |
|---------|------|
| id | UUID |
| title | VARCHAR(250) |
| slug | VARCHAR(250) |
| short_description | TEXT |
| full_content | LONGTEXT |
| featured_image | TEXT |
| publish_date | DATE |
| status | VARCHAR(30) |

---

# 106. Table: Event

| Column | Type |
|---------|------|
| id | UUID |
| event_name | VARCHAR(200) |
| event_start | TIMESTAMP |
| event_end | TIMESTAMP |
| location | VARCHAR(200) |
| description | TEXT |
| featured_image | TEXT |

---

# 107. Table: Download

Examples

- Admission Form
- Holiday List
- Syllabus
- Circular
- Calendar

| Column | Type |
|---------|------|
| id | UUID |
| title | VARCHAR(200) |
| file_path | TEXT |
| category | VARCHAR(100) |
| uploaded_date | DATE |

---

# 108. Table: Admission Enquiry

## Purpose

Stores online admission enquiries.

| Column | Type |
|---------|------|
| id | UUID |
| student_name | VARCHAR(150) |
| parent_name | VARCHAR(150) |
| mobile | VARCHAR(20) |
| email | VARCHAR(150) |
| class_applied | VARCHAR(100) |
| message | TEXT |
| enquiry_date | TIMESTAMP |
| status | VARCHAR(30) |

Status

- New
- Contacted
- Application Submitted
- Admitted
- Rejected

---

# 109. Table: Contact Message

## Purpose

Stores messages submitted from Contact Us page.

| Column | Type |
|---------|------|
| id | UUID |
| name | VARCHAR(150) |
| email | VARCHAR(150) |
| mobile | VARCHAR(20) |
| subject | VARCHAR(200) |
| message | TEXT |
| received_at | TIMESTAMP |
| status | VARCHAR(30) |

---

# 110. Communication Module

Supports

- Email
- SMS
- Push Notifications
- In-App Notifications
- WhatsApp (Future)

---

# 111. Table: Notification

| Column | Type |
|---------|------|
| id | UUID |
| title | VARCHAR(250) |
| message | TEXT |
| notification_type | VARCHAR(50) |
| target_role | VARCHAR(50) |
| target_user | UUID |
| sent_at | TIMESTAMP |
| read_at | TIMESTAMP |

---

# 112. Table: Email Log

| Column | Type |
|---------|------|
| id | UUID |
| recipient | VARCHAR(200) |
| subject | VARCHAR(250) |
| delivery_status | VARCHAR(30) |
| sent_at | TIMESTAMP |

---

# 113. Table: SMS Log

| Column | Type |
|---------|------|
| id | UUID |
| mobile | VARCHAR(20) |
| message | TEXT |
| delivery_status | VARCHAR(30) |
| sent_at | TIMESTAMP |

---

# 114. Audit Module

Every important action inside the ERP must be recorded.

Examples

- Login
- Logout
- Student Update
- Marks Updated
- Attendance Edited
- Fee Collected
- Certificate Issued
- User Created

---

# 115. Table: Audit Log

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| module | VARCHAR(100) |
| action | VARCHAR(100) |
| record_id | UUID |
| old_value | JSONB |
| new_value | JSONB |
| ip_address | VARCHAR(100) |
| user_agent | TEXT |
| created_at | TIMESTAMP |

Business Rules

- Audit Logs can never be edited.
- Audit Logs can never be deleted.

---

# 116. Table: Activity Log

Stores non-critical user activities.

Examples

- Profile Updated
- Password Changed
- File Downloaded
- Login History

| Column | Type |
|---------|------|
| id | UUID |
| user_id | UUID |
| activity | VARCHAR(250) |
| description | TEXT |
| created_at | TIMESTAMP |

---

# 117. Settings Module

Configuration should be database-driven instead of hardcoded.

Supports

- School Settings
- Academic Settings
- Examination Settings
- Fee Settings
- Notification Settings
- Theme Settings
- Website Settings

---

# 118. Table: System Setting

| Column | Type |
|---------|------|
| id | UUID |
| setting_key | VARCHAR(150) |
| setting_value | TEXT |
| category | VARCHAR(100) |
| description | TEXT |

---

# 119. Backup Module

Supports

- Full Backup
- Database Restore
- File Backup
- Scheduled Backup
- Manual Backup

---

# 120. Table: Backup History

| Column | Type |
|---------|------|
| id | UUID |
| backup_type | VARCHAR(50) |
| backup_file | TEXT |
| backup_size | BIGINT |
| created_by | UUID |
| created_at | TIMESTAMP |
| status | VARCHAR(30) |

---

# 121. Database Summary

Estimated Core Tables

- Master Tables
- Student Module
- Teacher Module
- Academic Module
- Attendance Module
- Examination Module
- Fee Module
- Library Module
- Transport Module
- Inventory Module
- Website CMS
- Communication
- Audit
- Settings
- Backup




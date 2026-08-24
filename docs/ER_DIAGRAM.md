# Entity-Relationship (ER) Diagram & Schema Specification

## 1. Relational Entity Diagram

```
 +------------------+           +--------------------+           +-------------------+
 |   departments    | 1       * |       users        | 1       * |     requests      |
 +------------------+-----------+--------------------+-----------+-------------------+
 | id (PK)          |           | id (PK)            |           | id (PK)           |
 | name             |           | email (UNIQUE)     |           | request_number    |
 | code             |           | password_hash      |           | request_type_id   |
 | manager_id (FK)  |           | full_name          |           | requester_id (FK) |
 +------------------+           | role               |           | department_id (FK)|
                                | department_id (FK) |           | title             |
                                +--------------------+           | priority          |
                                                                 | status            |
                                                                 | assignee_id (FK)  |
                                                                 | payload_json      |
                                                                 | sla_due_at        |
                                                                 | sla_status        |
                                                                 +---------+---------+
                                                                           | 1
                                       +-----------------------------------+
                                       |
                   +-------------------+-------------------+-------------------+
                   | 1                                   | 1                 | 1
                   ▼ *                                   ▼ *                 ▼ *
         +-------------------+                 +-------------------+ +-------------------+
         |     approvals     |                 |     comments      | |    attachments    |
         +-------------------+                 +-------------------+ +-------------------+
         | id (PK)           |                 | id (PK)           | | id (PK)           |
         | request_id (FK)   |                 | request_id (FK)   | | request_id (FK)   |
         | approver_id (FK)  |                 | author_id (FK)    | | uploader_id (FK)  |
         | stage_name        |                 | message           | | file_name         |
         | action            |                 | is_internal       | | original_name     |
         | comment           |                 +-------------------+ | file_path         |
         +-------------------+                                       | file_size         |
                                                                     +-------------------+
```

---

## 2. Table Schemas & Constraints

- `users`: Foreign key `department_id` references `departments(id)`. Email indexed uniquely.
- `requests`: Foreign keys to `request_types`, `users(requester_id)`, `departments(department_id)`, and `users(current_assignee_id)`.
- `approvals`: Foreign keys to `requests` and `users`. Cascade delete on request deletion.
- `audit_logs`: Foreign keys to `requests` and `users`. Nullified on user/request deletion to preserve historical audit traceability.

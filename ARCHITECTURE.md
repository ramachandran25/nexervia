# Nexervia – System Architecture

## 1. Overview

Nexervia is a metadata-driven, multi-tenant ITSM platform inspired by ServiceNow.

Core Principles:
- Schema-per-tenant architecture (PostgreSQL / Neon)
- Metadata-driven table & form engine
- Modular subscription-based provisioning
- Strict role-based access control
- Multiple isolated portals per tenant

---

## 2. Technology Stack

Backend:
- Django
- Django Rest Framework
- PostgreSQL (Neon)
- Schema-based multi-tenancy
- Django AllAuth (authentication)
- JWT for API authentication (React portals)

Frontend:
- React (Vite)
- Tailwind CSS
- Role-based portal rendering
- SPA architecture per portal

Infrastructure:
- Tenant schema provisioning on signup
- Module provisioning per subscription
- API-first architecture

---

## 3. Multi-Tenant Architecture

Each tenant has:

- Dedicated PostgreSQL schema
- Isolated data
- Same Django codebase
- Middleware-based schema switching

### Tenant Resolution Flow

1. Request hits Django
2. Tenant identified via:
   - Subdomain OR
   - Header OR
   - Tenant mapping table
3. Middleware switches DB schema
4. Request processed within tenant context

No tenant data is shared.

---

## 4. Portal Architecture

System contains four primary portals:

1. Customer Portal
2. Support Portal
3. Tenant Admin Portal
4. Platform Admin Portal

Each portal:
- Is role protected
- Uses same backend
- UI rendered conditionally
- Permissions enforced at API level

---

## 5. Metadata Engine (ServiceNow-like)

Inspired by sys_table and sys_dictionary concept.

Core Metadata Tables:

- meta_app
- meta_table
- meta_field
- meta_relationship
- meta_layout
- meta_permission

The system dynamically:

- Creates models
- Renders forms
- Builds list views
- Applies validations
- Controls field visibility

All business tables are metadata-driven.

---

## 6. Module Provisioning

Tenants subscribe to modules:

Examples:
- Incident Management
- Service Request
- Change Management
- Asset Management

Provisioning Flow:
- Tenant subscribes
- Required metadata records inserted
- Tables become active
- Portal components enabled

---

## 7. Role & Permission Model

Role Types:
- customer_user
- support_agent
- tenant_admin
- platform_admin

Permissions are enforced:
- At API layer
- At metadata layer
- At field level (future support)

No frontend-only security.

---

## 8. Service Request (servex)

Example business module:

Table: servex

Features:
- Create request
- Track status
- Assign support
- SLA tracking (future)
- Comments and attachments

Fully metadata-driven.

---

## 9. Authentication Flow

- Django AllAuth handles login
- JWT issued for React portals
- Permissions derived from role model
- Token includes tenant context

---

## 10. Request Lifecycle

1. Customer creates Service Request
2. Record stored in tenant schema
3. Support agent views in Support Portal
4. Status updated
5. Customer notified
6. Record archived if resolved

---

## 11. Security Principles

- Strict schema isolation
- No cross-tenant joins
- Middleware enforced context
- Role-based API validation
- No trust in frontend

---

## 12. Future Enhancements

- Workflow engine
- SLA engine
- Automation engine
- Event-driven notifications
- Audit trail engine
- AI-assisted ticket routing
- Cross-module analytics

---

## 13. Design Philosophy

- Everything metadata-driven
- Everything modular
- Everything tenant-isolated
- Everything API-first
- React is only presentation layer
# Nexervia Metadata-Driven Multi-Tenant Platform Blueprint

## 1) Target state

Build a **ServiceNow-style platform engine** where:

- each tenant has an isolated PostgreSQL schema,
- all app objects are defined as metadata (not hardcoded Django models),
- tables/fields/ACL/UI forms can be created/updated/hidden from UI,
- module subscriptions control visibility and provisioning,
- upgrades are safe through versioned metadata packages + update sets.

---

## 2) Core principles

1. **Global control plane + tenant data plane**
   - `public` schema holds platform metadata, module catalog, packaging, update sets, tenant registry.
   - each tenant schema holds business records and tenant-local extensions.

2. **Generic storage + metadata compiler**
   - move from static Django ORM app models to generic records backed by metadata.
   - metadata compiler generates/updates physical tenant tables and indexes.

3. **Never hard-delete on module disable**
   - module disable marks tables/forms/APIs as hidden/inactive.
   - tenant data remains for audit/history.

4. **Tenant-safe customization**
   - tenant custom fields stored and materialized in that tenant schema only.
   - no cross-tenant schema coupling.

5. **Everything manageable via UI**
   - schema designer, field designer, ACL policy, form/list builder, workflow hooks, update-set deployment.

---

## 3) Data model (metadata)

Implement metadata tables in `public` schema.

### 3.1 Tenant and module

- `core_tenant`
  - `id` (uuid, pk)
  - `tla` (char(3), unique, uppercase)
  - `name`, `subdomain`, `schema_name`, `status`, lifecycle timestamps

- `core_module`
  - module key (`itsm`, `itom`, `csdm`, etc), version, default_enabled

- `core_tenant_module`
  - tenant-to-module subscription with `state` (`enabled`, `disabled`, `hidden`)
  - disable should not drop physical tables.

### 3.2 Metadata dictionary

- `meta_table`
  - logical table definition (generic name convention e.g. `x_case`, `x_task`)
  - module ownership, extensibility flags, tenant customizability policy

- `meta_field`
  - field definition (`string`, `int`, `bool`, `datetime`, `reference`, `jsonb`, `choice`)
  - validation rules, nullable, default, indexed, unique, encrypted flags

- `meta_reference`
  - reference relation definitions (`from_table.field -> to_table.id`)

- `meta_index`
  - index metadata including unique and partial indexes

- `meta_ui_form`, `meta_ui_list`, `meta_ui_action`
  - portal-render metadata (labels, sections, visibility rules, role guards)

### 3.3 ACL and security

- `sec_role`
- `sec_group`
- `sec_user_role`
- `sec_acl_rule`
  - row/field/table ACL with condition expression and operation (`read`, `write`, `delete`, `execute`)

### 3.4 Update set and packaging

- `ops_update_set`
  - logical change bundle with state (`draft`, `previewed`, `committed`, `rolled_back`)

- `ops_update_item`
  - each metadata change as immutable event with before/after snapshot

- `ops_release_package`
  - signed exportable package for promotion (dev -> test -> prod)

---

## 4) Physical data strategy in tenant schemas

For each active metadata table, compile into tenant schema physical structures:

- generated table naming: `tbl_<logical_key>` (global convention)
- mandatory system columns for every record:
  - `sys_id` UUID primary key
  - `sys_tenant_id` UUID
  - `sys_created_on`, `sys_created_by`
  - `sys_updated_on`, `sys_updated_by`
  - `sys_mod_count`
  - `sys_active`
  - optional soft-delete: `sys_deleted_on`, `sys_deleted_by`

Reference fields use `UUID` and FK constraints where safe.

### Why this approach

- keeps query performance predictable,
- avoids EAV-only performance bottlenecks,
- still metadata-driven because schema is generated from metadata and managed via UI.

---

## 5) Runtime architecture

1. Request routing by subdomain (`tla.nexervia.com`) resolves tenant.
2. Middleware sets `search_path` to tenant schema.
3. Metadata cache loader retrieves active table/field/ACL/UI definitions.
4. Generic record engine performs CRUD using metadata rules.
5. ACL engine evaluates operation/table/field/row conditions.
6. Portal renderer builds forms/lists from metadata.

---

## 6) Migration path from current Django models

### Phase 1: Foundation

- keep current tenant model,
- introduce metadata registry tables in `public`,
- add `tla` to tenant and enforce unique 3-letter acronym policy.

### Phase 2: Generic engine

- build `RecordService` (`create/read/update/delete`) using metadata,
- implement schema compiler for table/field/index lifecycle,
- add tenant module provisioning engine.

### Phase 3: App-by-app transition

- move one domain module first (e.g., requests/incidents),
- dual-write optional during transition,
- cutover reads to metadata engine after validation.

### Phase 4: UI admin tooling

- schema designer UI,
- field designer UI,
- ACL rule UI,
- module subscription UI,
- update-set UI with preview and rollback.

### Phase 5: Platform hardening

- audit journal for metadata and record changes,
- package signing and dependency checks,
- backward-compatible upgrade contracts.

---

## 7) ACL model (ServiceNow-style MVP)

Rule evaluation order:

1. deny-by-default,
2. explicit role allow,
3. table-level allow,
4. field-level allow,
5. row condition allow.

Any explicit deny should short-circuit allow.

Support scripted/expressive conditions but sandbox execution.

---

## 8) Tenant customization model

Two layers:

1. **Base metadata** (platform-owned): immutable core fields.
2. **Tenant extension metadata** (tenant-owned): custom fields, forms, choices, automations.

Compiler merges base + tenant extension at runtime for that tenant only.

This ensures one tenant’s custom fields never leak to others.

---

## 9) CSDM as a module (MVP scope)

Create a `csdm` module package with metadata tables such as:

- business capability,
- business application,
- service offering,
- technical service,
- CI relationship maps.

Ship as installable metadata package; enable per tenant through `core_tenant_module`.

---

## 10) Update set and rollback design

- every metadata mutation creates `ops_update_item` with forward and rollback payload.
- update set preview runs dry-run compiler against target tenant schema.
- commit applies in transaction batches.
- rollback replays inverse operations.

Add safety checks:

- dependency validation,
- data-loss prevention guard (block destructive drops unless explicit override),
- module version compatibility matrix.

---

## 11) Recommended immediate backlog

1. Add `tla` and tenant lifecycle governance.
2. Implement metadata dictionary tables in `public` schema.
3. Build schema compiler (create/alter/hide, no drop on disable).
4. Build generic CRUD + ACL enforcement service.
5. Build admin UI for metadata management.
6. Build update-set engine (export/import/preview/rollback).
7. Pilot with CSDM MVP module.

---

## 12) Notes for Neon + Django

- continue using schema `search_path` switching middleware.
- use PostgreSQL transactional DDL where possible.
- maintain metadata cache with invalidation on update set commit.
- keep a strict API boundary: portals and workflows call generic engine, not direct app models.

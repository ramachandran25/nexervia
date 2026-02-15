from __future__ import annotations

import re
from dataclasses import dataclass

from django.db import connection

from helpers.db.schemas import use_tenant_schema


_IDENTIFIER_RE = re.compile(r"^[a-z][a-z0-9_]{1,62}$")


class SchemaCompilerError(ValueError):
    pass


@dataclass
class FieldDDL:
    name: str
    ddl_type: str
    nullable: bool
    default: str | None


class TenantSchemaCompiler:
    """Compiles metadata table + fields into tenant schema physical tables."""

    SYSTEM_COLUMNS_SQL = """
        sys_id UUID PRIMARY KEY,
        sys_tenant_id UUID NOT NULL,
        sys_created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        sys_created_by VARCHAR(150),
        sys_updated_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        sys_updated_by VARCHAR(150),
        sys_mod_count INTEGER NOT NULL DEFAULT 0,
        sys_active BOOLEAN NOT NULL DEFAULT TRUE,
        sys_deleted_on TIMESTAMPTZ,
        sys_deleted_by VARCHAR(150)
    """.strip()

    FIELD_TYPE_MAP = {
        "string": "VARCHAR",
        "text": "TEXT",
        "integer": "INTEGER",
        "bigint": "BIGINT",
        "boolean": "BOOLEAN",
        "datetime": "TIMESTAMPTZ",
        "date": "DATE",
        "json": "JSONB",
        "uuid": "UUID",
        "decimal": "NUMERIC",
        "reference": "UUID",
    }

    def _validate_identifier(self, identifier: str):
        if not _IDENTIFIER_RE.match(identifier):
            raise SchemaCompilerError(
                f"Invalid identifier '{identifier}'. Use lowercase snake_case."
            )

    def ensure_table(self, tenant_schema: str, table_name: str):
        self._validate_identifier(table_name)
        with use_tenant_schema(tenant_schema, create_if_missing=True, revert_public=True):
            with connection.cursor() as cursor:
                cursor.execute(
                    f'CREATE TABLE IF NOT EXISTS "{table_name}" ({self.SYSTEM_COLUMNS_SQL});'
                )

    def _build_field_ddl(self, schema_field) -> FieldDDL:
        field_type = self.FIELD_TYPE_MAP.get(schema_field.field_type)
        if not field_type:
            raise SchemaCompilerError(f"Unsupported field type: {schema_field.field_type}")

        ddl_type = field_type
        if schema_field.field_type == "string":
            ddl_type = f"VARCHAR({schema_field.max_length or 255})"
        elif schema_field.field_type == "decimal":
            ddl_type = f"NUMERIC({schema_field.precision or 18}, {schema_field.scale or 2})"

        default_sql = None
        if schema_field.default_value not in (None, ""):
            escaped = str(schema_field.default_value).replace("'", "''")
            default_sql = f"'{escaped}'"
            if schema_field.field_type in {"integer", "bigint", "decimal"}:
                default_sql = str(schema_field.default_value)
            elif schema_field.field_type == "boolean":
                default_sql = "TRUE" if str(schema_field.default_value).lower() in {"1", "true", "yes"} else "FALSE"

        return FieldDDL(
            name=schema_field.column_name,
            ddl_type=ddl_type,
            nullable=schema_field.is_nullable,
            default=default_sql,
        )

    def ensure_field(self, tenant_schema: str, table_name: str, schema_field):
        self._validate_identifier(table_name)
        self._validate_identifier(schema_field.column_name)
        field_ddl = self._build_field_ddl(schema_field)

        with use_tenant_schema(tenant_schema, create_if_missing=True, revert_public=True):
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = current_schema()
                      AND table_name = %s
                      AND column_name = %s
                    """,
                    [table_name, schema_field.column_name],
                )
                exists = cursor.fetchone() is not None
                if not exists:
                    nullable_sql = "" if field_ddl.nullable else "NOT NULL"
                    default_sql = (
                        f"DEFAULT {field_ddl.default}" if field_ddl.default is not None else ""
                    )
                    cursor.execute(
                        f'ALTER TABLE "{table_name}" ADD COLUMN "{field_ddl.name}" {field_ddl.ddl_type} {default_sql} {nullable_sql};'
                    )

                if schema_field.is_indexed:
                    index_name = f"idx_{table_name}_{schema_field.column_name}"
                    cursor.execute(
                        f'CREATE INDEX IF NOT EXISTS "{index_name}" ON "{table_name}" ("{schema_field.column_name}");'
                    )

                if schema_field.is_unique:
                    constraint_name = f"uq_{table_name}_{schema_field.column_name}"
                    cursor.execute(
                        f'ALTER TABLE "{table_name}" ADD CONSTRAINT "{constraint_name}" UNIQUE ("{schema_field.column_name}");'
                    )

    def sync_table_for_tenant(self, tenant, schema_table):
        table_name = schema_table.physical_table_name
        self.ensure_table(tenant.schema_name, table_name)

        active_fields = schema_table.fields.filter(is_active=True)
        for schema_field in active_fields:
            self.ensure_field(tenant.schema_name, table_name, schema_field)

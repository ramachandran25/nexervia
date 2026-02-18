# metaengine/schema_engine.py

from django.db import connection

SYSTEM_COLUMNS = {
    "sys_id": "UUID PRIMARY KEY",
    "number": "VARCHAR(50)",
    "created_at": "TIMESTAMP",
    "updated_at": "TIMESTAMP",
    "created_by": "INTEGER REFERENCES auth_user(id)",
    "updated_by": "INTEGER REFERENCES auth_user(id)",
}


def create_physical_table(table):

    table_name = table.name

    column_definitions = []

    # Add system columns
    for column_name, column_type in SYSTEM_COLUMNS.items():
        column_definitions.append(f"{column_name} {column_type}")

    # Add core business fields
    for field in table.fields.filter(is_core=True):

        if field.field_type == "string":
            column_definitions.append(f"{field.name} VARCHAR(255)")

        elif field.field_type == "text":
            column_definitions.append(f"{field.name} TEXT")

        elif field.field_type == "integer":
            column_definitions.append(f"{field.name} INTEGER")

        elif field.field_type == "boolean":
            column_definitions.append(f"{field.name} BOOLEAN")

        elif field.field_type == "choice":
            column_definitions.append(f"{field.name} VARCHAR(100)")

    # JSONB column for dynamic fields
    column_definitions.append("data JSONB")

    columns_sql = ", ".join(column_definitions)

    create_sql = f"""
        CREATE TABLE IF NOT EXISTS "{table_name}" (
            {columns_sql}
        );
    """

    with connection.cursor() as cursor:
        cursor.execute(create_sql)

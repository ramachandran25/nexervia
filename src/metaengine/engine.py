# metaengine/engine.py

from django.db import connection

def create_physical_table(meta_table, schema):
    table_name = meta_table.name

    columns = ["id SERIAL PRIMARY KEY"]

    for field in meta_table.fields.all():
        sql_type = map_field_type(field)

        col_def = f"{field.name} {sql_type}"

        if field.is_required:
            col_def += " NOT NULL"

        if field.is_unique:
            col_def += " UNIQUE"

        columns.append(col_def)

    sql = f"""
    CREATE TABLE {schema}.{table_name} (
        {", ".join(columns)}
    );
    """

    with connection.cursor() as cursor:
        cursor.execute(sql)

def map_field_type(field):
    mapping = {
        "string": "VARCHAR(255)",
        "text": "TEXT",
        "integer": "INTEGER",
        "boolean": "BOOLEAN",
        "date": "DATE",
        "datetime": "TIMESTAMP",
    }

    if field.field_type == "choice":
        return "VARCHAR(255)"

    if field.field_type == "reference":
        return "INTEGER"

    return mapping.get(field.field_type, "VARCHAR(255)")

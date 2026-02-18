from django.db.models import Q
import uuid
from datetime import datetime
from django.db import connection
from psycopg.types.json import Json   # ✅ ADD THIS
import uuid
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .table_service import get_dynamic_table_model
from .sequence_service import generate_number


SYSTEM_COLUMNS = {
    "sys_id",
    "number",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
}

def create_record(table_name, data_payload):

    Model = get_dynamic_table_model(table_name)

    number = generate_number(table_name)

    state_value = data_payload.get("state")

    if state_value == "3":
        data_payload["active"] = False
    else:
        data_payload["active"] = True

    return Model.objects.create(
        sys_id=uuid.uuid4(),
        number=number,
        created_at=timezone.now(),
        updated_at=timezone.now(),
        data=data_payload
    )

def fetch_records(table):

    table_name = table.name

    select_sql = f"""
        SELECT *
        FROM "{table_name}"
        ORDER BY created_at DESC
    """

    with connection.cursor() as cursor:
        cursor.execute(select_sql)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    records = []

    for row in rows:
        record = dict(zip(columns, row))
        if record.get("data") is None:
            record["data"] = {}
        records.append(record)

    return records

def fetch_record_detail(table, sys_id):

    table_name = table.name

    select_sql = f"""
        SELECT *
        FROM "{table_name}"
        WHERE sys_id = %s
    """

    with connection.cursor() as cursor:
        cursor.execute(select_sql, [str(sys_id)])
        columns = [col[0] for col in cursor.description]
        row = cursor.fetchone()

    if not row:
        return None

    return dict(zip(columns, row))

def update_record(table_name, sys_id, data_payload):

    Model = get_dynamic_table_model(table_name)

    record = get_object_or_404(Model, sys_id=sys_id)

    state_value = data_payload.get("state")

    # Example logic:
    # If state == "closed" or specific value → active False
    if state_value in ["closed", "cancelled", "resolved", "7", "8"]:
        data_payload["active"] = False
    else:
        data_payload["active"] = True

    record.data = data_payload
    record.updated_at = timezone.now()
    record.save()

    return record


def get_record(table_name, sys_id):

    Model = get_dynamic_table_model(table_name)
    return get_object_or_404(Model, sys_id=sys_id)


def list_records(table_name):

    Model = get_dynamic_table_model(table_name)
    return Model.objects.all().order_by("-created_at")
from django.shortcuts import render

# Create your views here.
# metaengine/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from .form_builder import build_dynamic_form
from .models import MetaTable
from django.shortcuts import render
import uuid
from django.shortcuts import render, redirect
from django.utils import timezone
from metaengine.models import MetaTable
from metaengine.services.table_service import get_dynamic_table_model
import uuid

from metaengine.services.record_service import (
    create_record,
    update_record,
    get_record,
    list_records,
)


def create_record_ui(request, table_name):

    table = MetaTable.objects.get(name=table_name)
    fields = table.fields.all().order_by("order")

    if request.method == "POST":

        data_payload = request.POST.dict()
        data_payload.pop("csrfmiddlewaretoken", None)

        create_record(table_name, data_payload)

        return redirect(f"/{table_name}/list/")

    return render(
        request,
        "metaengine/form.html",
        {
            "table": table,
            "fields": fields,
            "record": None,
        }
    )



def list_record_ui(request, table_name):

    table = MetaTable.objects.get(name=table_name)
    fields = table.fields.all().order_by("order")

    records = list_records(table_name)

    return render(
        request,
        "metaengine/list.html",
        {
            "table": table,
            "fields": fields,
            "records": records,
        }
    )

def detail_record_ui(request, table_name, sys_id):

    table = MetaTable.objects.get(name=table_name)
    fields = table.fields.all().order_by("order")

    if request.method == "POST":

        data_payload = request.POST.dict()
        data_payload.pop("csrfmiddlewaretoken", None)

        update_record(table_name, sys_id, data_payload)

        return redirect(f"/{table_name}/{sys_id}/")

    record = get_record(table_name, sys_id)

    return render(
        request,
        "metaengine/form.html",
        {
            "table": table,
            "fields": fields,
            "record": record,
        }
    )

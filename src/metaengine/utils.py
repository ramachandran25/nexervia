# metaengine/utils.py

from django.db import transaction
from .models import RecordSequence

from django.urls import path

def generate_number(table):
    with transaction.atomic():
        seq = RecordSequence.objects.select_for_update().get(table=table)
        seq.last_number += 1
        seq.save()
        return f"{seq.prefix}{str(seq.last_number).zfill(5)}"

from django.db import transaction
from metaengine.models import RecordSequence


def generate_number(table_name):

    with transaction.atomic():

        sequence = RecordSequence.objects.select_for_update().get(
            table__name=table_name
        )

        sequence.last_number += 1
        sequence.save()

        return f"{sequence.prefix}{sequence.last_number:05d}"

from django.db import models
from metaengine.physical_models import BaseHybridTable


def get_dynamic_table_model(table_name):

    if hasattr(table_name, "name"):
        table_name = table_name.name

    table_name = str(table_name).lower()

    class DynamicTable(BaseHybridTable):
        class Meta:
            managed = False
            db_table = table_name

    return DynamicTable
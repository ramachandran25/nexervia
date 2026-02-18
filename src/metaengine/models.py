from django.db import models
import uuid
from django.contrib.postgres.fields import JSONField


class MetaTable(models.Model):
    sys_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=100, unique=True)  # db_name
    label = models.CharField(max_length=150)
    is_system = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    module = models.ForeignKey(
        "platformcore.Module",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="template_tables"
    )

    is_template = models.BooleanField(default=False)


    def __str__(self):
        return self.label
    
    def save(self, *args, **kwargs):

        is_new = self.pk is None

        super().save(*args, **kwargs)

        # Only create physical table for templates
        if self.is_template:
            from .schema_engine import create_physical_table
            create_physical_table(self)


    
class MetaField(models.Model):

    FIELD_TYPES = [
        ("string", "String"),
        ("text", "Text"),
        ("integer", "Integer"),
        ("boolean", "Boolean"),
        ("date", "Date"),
        ("datetime", "DateTime"),
        ("choice", "Choice"),
        ("reference", "Reference"),
    ]

    table = models.ForeignKey(
        MetaTable,
        on_delete=models.CASCADE,
        related_name="fields"
    )

    name = models.CharField(max_length=100)
    label = models.CharField(max_length=150)

    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)

    required = models.BooleanField(default=False)
    read_only = models.BooleanField(default=False)

    max_length = models.IntegerField(null=True, blank=True)

    # NEW FIELDS 👇
    default_value = models.CharField(max_length=255, blank=True, null=True)

    help_text = models.CharField(max_length=255, blank=True, null=True)

    order = models.IntegerField(default=0)

    reference_table = models.ForeignKey(
        MetaTable,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="referenced_by"
    )

    is_core = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.table.name}.{self.name}"

class RecordSequence(models.Model):
    table = models.OneToOneField(MetaTable, on_delete=models.CASCADE)
    prefix = models.CharField(max_length=10)
    last_number = models.IntegerField(default=0)


class MetaChoice(models.Model):

    field = models.ForeignKey(
        MetaField,
        on_delete=models.CASCADE,
        related_name="choices"
    )

    value = models.CharField(max_length=100)
    label = models.CharField(max_length=100)
    order = models.IntegerField(default=0)

    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.field.name} - {self.label}"

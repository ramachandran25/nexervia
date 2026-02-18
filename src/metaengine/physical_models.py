from django.db import models


class BaseHybridTable(models.Model):
    """
    Base physical structure shared by all logical tables.
    Every tenant table (servex, incident, change, etc.)
    must follow this structure.
    """

    sys_id = models.UUIDField(primary_key=True)
    number = models.CharField(max_length=50)

    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)

    created_by = models.UUIDField(null=True)
    updated_by = models.UUIDField(null=True)

    data = models.JSONField()

    class Meta:
        managed = False
        abstract = True
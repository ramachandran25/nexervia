import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

from helpers.db.validators import (
    validate_subdomain,
    validate_blocked_subdomains,
    validate_tla,
)
from . import tasks, utils

User = settings.AUTH_USER_MODEL  # auth.User


class Tenant(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, db_index=True, editable=False)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    tla = models.CharField(max_length=3, unique=True, db_index=True, validators=[validate_tla], null=True, blank=True)
    subdomain = models.CharField(
        max_length=60,
        unique=True,
        db_index=True,
        validators=[
            validate_subdomain,
            validate_blocked_subdomains
        ]
    )
    tenant_name = models.CharField(max_length=120, unique=True, blank=True, null=True, db_index=True)
    schema_name = models.CharField(max_length=60, unique=True, blank=True, null=True, db_index=True)
    active = models.BooleanField(default=True)
    active_at = models.DateTimeField(null=True, blank=True)
    inactive_at = models.DateTimeField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        created = False
        if not self.pk:
            created = True
        now = timezone.now()
        if self.tla:
            self.tla = self.tla.upper()
        if self.active and not self.active_at:
            self.active_at = now
            self.inactive_at = None
        elif not self.active and not self.inactive_at:
            self.active_at = None
            self.inactive_at = now
        if not self.schema_name:
            self.schema_name = utils.generate_unique_schema_name(self.id)
        super().save(*args, **kwargs)
        tasks.migrate_tenant_task(self.id, branch=created)

    def __str__(self):
        return f"{self.tenant_name or self.subdomain} ({self.tla})"

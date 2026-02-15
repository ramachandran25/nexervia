import uuid

from django.db import models
from django.utils import timezone

from tenants.models import Tenant

from .services import TenantSchemaCompiler


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Module(TimestampedModel):
    key = models.SlugField(max_length=50, unique=True)
    name = models.CharField(max_length=120)
    version = models.CharField(max_length=30, default="1.0.0")
    is_default_enabled = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["key"]

    def __str__(self):
        return f"{self.key} ({self.version})"


class TenantModuleSubscription(TimestampedModel):
    class State(models.TextChoices):
        ENABLED = "enabled", "Enabled"
        DISABLED = "disabled", "Disabled"
        HIDDEN = "hidden", "Hidden"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="module_subscriptions")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="tenant_subscriptions")
    state = models.CharField(max_length=20, choices=State.choices, default=State.ENABLED)
    activated_at = models.DateTimeField(null=True, blank=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("tenant", "module")
        ordering = ["tenant__subdomain", "module__key"]

    def save(self, *args, **kwargs):
        now = timezone.now()
        if self.state == self.State.ENABLED:
            self.activated_at = self.activated_at or now
            self.deactivated_at = None
        else:
            self.deactivated_at = self.deactivated_at or now
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tenant.subdomain}: {self.module.key} ({self.state})"


class SchemaTable(TimestampedModel):
    class Scope(models.TextChoices):
        PLATFORM = "platform", "Platform"
        TENANT = "tenant", "Tenant"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name="schema_tables",
        null=True,
        blank=True,
        help_text="Leave empty for platform-level metadata table definitions.",
    )
    module = models.ForeignKey(Module, on_delete=models.PROTECT, related_name="schema_tables")
    scope = models.CharField(max_length=20, choices=Scope.choices, default=Scope.PLATFORM)
    table_key = models.SlugField(max_length=63, help_text="Logical key. Physical table is generated as tbl_<table_key>.")
    display_name = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["tenant", "table_key"], name="uq_schema_table_tenant_key")
        ]
        ordering = ["table_key"]

    @property
    def physical_table_name(self):
        return f"tbl_{self.table_key.replace('-', '_')}"

    def delete(self, *args, **kwargs):
        self.is_active = False
        self.is_visible = False
        self.save(update_fields=["is_active", "is_visible", "updated_at"])

    def __str__(self):
        return self.display_name


class SchemaField(TimestampedModel):
    class FieldType(models.TextChoices):
        STRING = "string", "String"
        TEXT = "text", "Text"
        INTEGER = "integer", "Integer"
        BIGINT = "bigint", "Big Int"
        BOOLEAN = "boolean", "Boolean"
        DATETIME = "datetime", "Date Time"
        DATE = "date", "Date"
        JSON = "json", "JSON"
        UUID = "uuid", "UUID"
        DECIMAL = "decimal", "Decimal"
        REFERENCE = "reference", "Reference"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table = models.ForeignKey(SchemaTable, on_delete=models.CASCADE, related_name="fields")
    field_key = models.SlugField(max_length=63)
    column_name = models.SlugField(max_length=63)
    field_type = models.CharField(max_length=20, choices=FieldType.choices)
    is_required = models.BooleanField(default=False)
    is_nullable = models.BooleanField(default=True)
    is_unique = models.BooleanField(default=False)
    is_indexed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    default_value = models.CharField(max_length=255, blank=True, null=True)
    max_length = models.PositiveIntegerField(blank=True, null=True)
    precision = models.PositiveIntegerField(blank=True, null=True)
    scale = models.PositiveIntegerField(blank=True, null=True)
    reference_table = models.ForeignKey(
        SchemaTable,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="referenced_by",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["table", "field_key"], name="uq_schema_field_key_per_table"),
            models.UniqueConstraint(fields=["table", "column_name"], name="uq_schema_column_per_table"),
        ]
        ordering = ["table__table_key", "column_name"]

    def save(self, *args, **kwargs):
        if self.is_required:
            self.is_nullable = False
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def __str__(self):
        return f"{self.table.table_key}.{self.column_name}"


class UpdateSet(TimestampedModel):
    class State(models.TextChoices):
        DRAFT = "draft", "Draft"
        PREVIEWED = "previewed", "Previewed"
        COMMITTED = "committed", "Committed"
        ROLLED_BACK = "rolled_back", "Rolled Back"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="update_sets")
    name = models.CharField(max_length=120)
    state = models.CharField(max_length=20, choices=State.choices, default=State.DRAFT)

    class Meta:
        unique_together = ("tenant", "name")

    def __str__(self):
        return f"{self.tenant.subdomain} :: {self.name}"


class UpdateSetItem(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    update_set = models.ForeignKey(UpdateSet, on_delete=models.CASCADE, related_name="items")
    object_type = models.CharField(max_length=60)
    object_id = models.UUIDField()
    operation = models.CharField(max_length=30)
    before_snapshot = models.JSONField(default=dict, blank=True)
    after_snapshot = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.update_set.name}: {self.object_type} {self.operation}"


schema_compiler = TenantSchemaCompiler()

from django.db.models.signals import post_save
from django.dispatch import receiver

from tenants.models import Tenant

from .models import (
    Module,
    SchemaField,
    SchemaTable,
    TenantModuleSubscription,
    schema_compiler,
)


@receiver(post_save, sender=Tenant)
def ensure_default_module_subscriptions(sender, instance, created, **kwargs):
    if not created:
        return

    default_modules = Module.objects.filter(is_default_enabled=True, is_active=True)
    for module in default_modules:
        TenantModuleSubscription.objects.get_or_create(
            tenant=instance,
            module=module,
            defaults={"state": TenantModuleSubscription.State.ENABLED},
        )


@receiver(post_save, sender=TenantModuleSubscription)
def sync_subscription_tables(sender, instance, **kwargs):
    if instance.state != TenantModuleSubscription.State.ENABLED:
        return

    tenant = instance.tenant
    tables = SchemaTable.objects.filter(module=instance.module, is_active=True)
    for table in tables:
        schema_compiler.sync_table_for_tenant(tenant, table)


@receiver(post_save, sender=SchemaTable)
def sync_schema_table(sender, instance, **kwargs):
    tenants = Tenant.objects.filter(active=True)
    if instance.scope == SchemaTable.Scope.TENANT and instance.tenant_id:
        tenants = tenants.filter(id=instance.tenant_id)

    subscriptions = {
        (s.tenant_id, s.module_id): s
        for s in TenantModuleSubscription.objects.filter(
            tenant__in=tenants,
            module=instance.module,
            state=TenantModuleSubscription.State.ENABLED,
        )
    }

    for tenant in tenants:
        if (tenant.id, instance.module_id) not in subscriptions:
            continue
        schema_compiler.sync_table_for_tenant(tenant, instance)


@receiver(post_save, sender=SchemaField)
def sync_schema_field(sender, instance, **kwargs):
    table = instance.table
    tenants = Tenant.objects.filter(active=True)

    if table.scope == SchemaTable.Scope.TENANT and table.tenant_id:
        tenants = tenants.filter(id=table.tenant_id)

    enabled_tenant_ids = TenantModuleSubscription.objects.filter(
        tenant__in=tenants,
        module=table.module,
        state=TenantModuleSubscription.State.ENABLED,
    ).values_list("tenant_id", flat=True)

    for tenant in tenants.filter(id__in=enabled_tenant_ids):
        schema_compiler.sync_table_for_tenant(tenant, table)

from django.core.management.base import BaseCommand

from schemadata.models import SchemaTable, TenantModuleSubscription, schema_compiler


class Command(BaseCommand):
    help = "Sync active metadata tables/fields into enabled tenant schemas"

    def handle(self, *args, **options):
        subscriptions = TenantModuleSubscription.objects.select_related("tenant", "module").filter(state=TenantModuleSubscription.State.ENABLED)
        total = 0
        for subscription in subscriptions:
            tables = SchemaTable.objects.filter(module=subscription.module, is_active=True)
            for table in tables:
                schema_compiler.sync_table_for_tenant(subscription.tenant, table)
                total += 1

        self.stdout.write(self.style.SUCCESS(f"Synced {total} table definitions."))

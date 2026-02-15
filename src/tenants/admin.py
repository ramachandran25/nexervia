from django.contrib import admin

from .models import Tenant


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    readonly_fields = ['schema_name', 'active_at', 'inactive_at', 'timestamp', 'updated']
    list_display = ['tla', 'subdomain', 'tenant_name', 'owner', 'schema_name', 'active']
    search_fields = ['tla', 'subdomain', 'tenant_name']
    list_filter = ['active']

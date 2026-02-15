from django.contrib import admin

from .models import (
    Module,
    SchemaField,
    SchemaTable,
    TenantModuleSubscription,
    UpdateSet,
    UpdateSetItem,
)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ["key", "name", "version", "is_default_enabled", "is_active"]
    list_filter = ["is_default_enabled", "is_active"]
    search_fields = ["key", "name"]


@admin.register(TenantModuleSubscription)
class TenantModuleSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["tenant", "module", "state", "activated_at", "deactivated_at"]
    list_filter = ["state", "module"]
    search_fields = ["tenant__subdomain", "module__key"]


class SchemaFieldInline(admin.TabularInline):
    model = SchemaField
    fk_name = "table"
    extra = 0
    fields = [
        "field_key",
        "column_name",
        "field_type",
        "is_required",
        "is_nullable",
        "is_unique",
        "is_indexed",
        "is_active",
    ]


@admin.register(SchemaTable)
class SchemaTableAdmin(admin.ModelAdmin):
    list_display = [
        "display_name",
        "table_key",
        "physical_table_name",
        "scope",
        "tenant",
        "module",
        "is_active",
        "is_visible",
    ]
    list_filter = ["scope", "module", "is_active", "is_visible"]
    search_fields = ["display_name", "table_key", "tenant__subdomain"]
    inlines = [SchemaFieldInline]


@admin.register(SchemaField)
class SchemaFieldAdmin(admin.ModelAdmin):
    list_display = [
        "table",
        "column_name",
        "field_type",
        "is_required",
        "is_unique",
        "is_indexed",
        "is_active",
    ]
    list_filter = ["field_type", "is_required", "is_unique", "is_indexed", "is_active"]
    search_fields = ["table__table_key", "column_name", "field_key"]


class UpdateSetItemInline(admin.TabularInline):
    model = UpdateSetItem
    extra = 0
    readonly_fields = ["object_type", "object_id", "operation", "before_snapshot", "after_snapshot", "created_at"]


@admin.register(UpdateSet)
class UpdateSetAdmin(admin.ModelAdmin):
    list_display = ["tenant", "name", "state", "created_at", "updated_at"]
    list_filter = ["state"]
    search_fields = ["tenant__subdomain", "name"]
    inlines = [UpdateSetItemInline]


@admin.register(UpdateSetItem)
class UpdateSetItemAdmin(admin.ModelAdmin):
    list_display = ["update_set", "object_type", "operation", "created_at"]
    list_filter = ["operation", "object_type"]
    search_fields = ["update_set__name", "object_type"]

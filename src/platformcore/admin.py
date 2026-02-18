from django.contrib import admin

# Register your models here.
from .models import Module, TenantModule

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("name", "label", "active")


@admin.register(TenantModule)
class TenantModuleAdmin(admin.ModelAdmin):
    list_display = ("tenant", "module", "active", "provisioned")
    list_filter = ("active", "module")
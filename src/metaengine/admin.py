from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import MetaTable, MetaField, MetaChoice, RecordSequence

class MetaFieldInline(admin.TabularInline):
    model = MetaField
    fk_name = "table"   # 👈 THIS IS THE FIX
    extra = 1


@admin.register(MetaTable)
class MetaTableAdmin(admin.ModelAdmin):
    list_display = ("name", "label", "active", "created_at")
    inlines = [MetaFieldInline]



@admin.register(MetaChoice)
class MetaChoiceAdmin(admin.ModelAdmin):
    list_display = ("field", "label", "value", "order", "active")
    list_filter = ("field",)
    ordering = ("field", "order")

@admin.register(RecordSequence)
class RecordSequenceAdmin(admin.ModelAdmin):
    list_display = ("table", "prefix", "last_number")


@admin.register(MetaField)
class MetaFieldAdmin(admin.ModelAdmin):
    list_display = ("name", "label", "table", "field_type", "required", "order")
    list_filter = ("table", "field_type")
    search_fields = ("name", "label")
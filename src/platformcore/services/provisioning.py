from django.db import connection, transaction
from metaengine.models import MetaTable, MetaField, MetaChoice, RecordSequence


def set_schema(schema_name: str):
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{schema_name}", public')
        cursor.execute("SHOW search_path")
        print("Current search_path:", cursor.fetchone())


def clone_table_from_public(table_name: str):
    table_name = table_name.lower()

    with connection.cursor() as cursor:
        print("Cloning table:", table_name)
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS "{table_name}"
            (LIKE public."{table_name}" INCLUDING ALL);
        """)


def provision_module_to_tenant(tenant_module):

    print("=== PROVISIONING STARTED ===")
    print("Tenant:", tenant_module.tenant)
    print("Module:", tenant_module.module)

    if tenant_module.provisioned:
        print("Already provisioned. Skipping.")
        return

    tenant = tenant_module.tenant
    module = tenant_module.module
    tenant_schema = tenant.schema_name

    with transaction.atomic():

        # 1️⃣ Read templates from PUBLIC
        set_schema("public")

        templates = list(
            MetaTable.objects.filter(
                module=module,
                is_template=True
            ).prefetch_related("fields__choices")
        )

        print("Templates found:", templates)

        if not templates:
            return

        # 2️⃣ Switch to TENANT
        set_schema(tenant_schema)

        for template in templates:

            # 🔥 Clone physical table first
            clone_table_from_public(template.name)

            # 🔥 Copy metadata if not exists
            if MetaTable.objects.filter(name=template.name).exists():
                continue

            new_table = MetaTable.objects.create(
                name=template.name,
                label=template.label,
                is_template=False,
                module=None
            )

            for field in template.fields.all():

                new_field = MetaField.objects.create(
                    table=new_table,
                    name=field.name,
                    label=field.label,
                    field_type=field.field_type,
                    required=field.required,
                    read_only=field.read_only,
                    order=field.order,
                    default_value=field.default_value,
                    help_text=field.help_text,
                )

                for choice in field.choices.all():
                    MetaChoice.objects.create(
                        field=new_field,
                        value=choice.value,
                        label=choice.label,
                        order=choice.order,
                        active=choice.active,
                    )

            RecordSequence.objects.create(
                table=new_table,
                prefix=template.name.upper()[:3],
                last_number=0,
            )

        # 3️⃣ Switch back to PUBLIC
        set_schema("public")

        tenant_module.provisioned = True
        tenant_module.save(update_fields=["provisioned"])

        print("=== PROVISIONING COMPLETED ===")

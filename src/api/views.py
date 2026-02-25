import json
from copy import deepcopy
from urllib.parse import urlencode

from django.db import connection
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from metaengine.models import MetaTable
from platformcore.models import TenantModule
from tenants.models import Tenant


class DynamicTableView(APIView):

    def get(self, request, table_name):

        if not request.user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=403)

        if not MetaTable.objects.filter(name=table_name).exists():
            return Response(
                {"error": "Invalid table"},
                status=status.HTTP_404_NOT_FOUND
            )

        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT *
                FROM {table_name}
            """)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        results = []

        for row in rows:
            record = dict(zip(columns, row))

            data_field = record.get("data")

            if data_field:
                if isinstance(data_field, str):
                    try:
                        data_field = json.loads(data_field)
                    except Exception:
                        data_field = {}

                if isinstance(data_field, dict):
                    record.update(data_field)

            record.pop("data", None)
            results.append(record)

        return Response(results)


class PortalBootstrapView(APIView):

    PORTAL_SKELETON = {
        "admin": {
            "label": "Business Admin",
            "path": "/admin",
            "modules": [],
            "module_groups": [],
        },
        "support": {
            "label": "Support Portal",
            "path": "/support",
            "modules": [],
            "module_groups": [],
        },
        "customer": {
            "label": "Customer Portal",
            "path": "/customer",
            "modules": [],
            "module_groups": [],
        },
        "landing": {
            "label": "Tenant Landing Page",
            "path": "/",
            "modules": [],
            "module_groups": [],
        },
    }

    @staticmethod
    def _dedupe_modules(modules):
        unique_modules = []
        seen_paths = set()

        for module in modules:
            path = module.get("path")
            if not path or path in seen_paths:
                continue
            seen_paths.add(path)
            unique_modules.append(module)

        return unique_modules

    @staticmethod
    def _build_status_filters(base_path, table_name):
        return [
            {"name": "All", "path": f"{base_path}?{urlencode({'table': table_name})}"},
            {"name": "Open", "path": f"{base_path}?{urlencode({'table': table_name, 'status': 'open'})}"},
            {"name": "Closed", "path": f"{base_path}?{urlencode({'table': table_name, 'status': 'closed'})}"},
        ]

    def get(self, request):
        host = request.GET.get("subdomain") or request.get_host().split(":")[0].split(".")[0]
        tenant = Tenant.objects.filter(subdomain=host).first()

        portals = deepcopy(self.PORTAL_SKELETON)

        payload = {
            "tenant": {
                "subdomain": host,
                "name": tenant.tenant_name if tenant and tenant.tenant_name else host,
            },
            "branding": {
                "company_name": tenant.tenant_name if tenant and tenant.tenant_name else "Nexervia",
                "theme_color": "#2563EB",
            },
            "landing": {
                "hero": {
                    "title": "Modern metadata-driven platform",
                    "subtitle": "Build and operate tenant experiences from a single engine.",
                    "primary_cta": "Get Started",
                    "secondary_cta": "Explore",
                },
                "features": {
                    "title": "Subscribed modules",
                    "subtitle": "Your tenant's active platform modules.",
                    "items": [],
                },
            },
            "portals": portals,
        }

        if not tenant:
            return Response(payload)

        tenant_modules = (
            TenantModule.objects.filter(
                tenant=tenant,
                active=True,
                module__active=True,
            )
            .select_related("module")
            .order_by("module__label")
        )

        module_groups_by_portal = {
            "support": {},
            "admin": {},
            "customer": {},
        }

        template_tables = (
            MetaTable.objects.filter(
                is_template=True,
                active=True,
                module_id__in=tenant_modules.values_list("module_id", flat=True),
            )
            .select_related("module")
            .order_by("module__label", "label")
        )

        for template in template_tables:
            if not template.module:
                continue

            module_key = template.module.name
            module_label = template.module.label

            payload["portals"]["support"]["modules"].append(
                {
                    "name": template.label,
                    "path": f"/support/tickets?{urlencode({'table': template.name})}",
                }
            )
            payload["portals"]["customer"]["modules"].append(
                {
                    "name": template.label,
                    "path": f"/customer?{urlencode({'table': template.name})}",
                }
            )

            support_group = module_groups_by_portal["support"].setdefault(
                module_key,
                {
                    "name": module_label,
                    "tables": [],
                }
            )
            support_group["tables"].append(
                {
                    "name": template.label,
                    "table": template.name,
                    "filters": self._build_status_filters("/support/tickets", template.name),
                }
            )

            admin_group = module_groups_by_portal["admin"].setdefault(
                module_key,
                {
                    "name": module_label,
                    "tables": [],
                }
            )
            admin_group["tables"].append(
                {
                    "name": template.label,
                    "table": template.name,
                    "filters": self._build_status_filters("/admin/users", template.name),
                }
            )

        for tenant_module in tenant_modules:
            module_name = tenant_module.module.name
            module_label = tenant_module.module.label
            payload["landing"]["features"]["items"].append(
                {
                    "title": module_label,
                    "description": f"Active module: {module_name}",
                }
            )

            customer_group = module_groups_by_portal["customer"].setdefault(
                module_name,
                {
                    "name": module_label,
                    "tables": [],
                }
            )
            if not customer_group["tables"]:
                customer_group["tables"].append(
                    {
                        "name": module_label,
                        "table": None,
                        "filters": [
                            {
                                "name": "All",
                                "path": "/customer",
                            }
                        ],
                    }
                )

            if module_name in payload["portals"]:
                payload["portals"][module_name]["label"] = module_label
                continue

            if ":" not in module_name:
                continue

            portal_key, module_key = module_name.split(":", 1)
            if portal_key not in payload["portals"]:
                continue

            base_path = payload["portals"][portal_key]["path"]
            payload["portals"][portal_key]["modules"].append(
                {
                    "name": module_label,
                    "path": f"{base_path}/{module_key}",
                }
            )

        for portal_key in ("support", "admin", "customer"):
            groups = list(module_groups_by_portal[portal_key].values())
            payload["portals"][portal_key]["module_groups"] = groups

        for key in payload["portals"]:
            modules = payload["portals"][key]["modules"]
            payload["portals"][key]["modules"] = self._dedupe_modules(modules)

        return Response(payload)

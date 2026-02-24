import json

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

    DEFAULT_PORTALS = {
        "admin": {
            "label": "Business Admin",
            "path": "/admin",
            "modules": [
                {"name": "Users", "path": "/admin/users"},
                {"name": "Groups", "path": "/admin/groups"},
                {"name": "Workflows", "path": "/admin/workflows"},
            ],
        },
        "support": {
            "label": "Support Portal",
            "path": "/support",
            "modules": [
                {"name": "Tickets", "path": "/support/tickets"},
                {"name": "SLAs", "path": "/support/slas"},
                {"name": "Knowledge", "path": "/support/kb"},
                {"name": "Reports", "path": "/support/reports"},
            ],
        },
        "customer": {
            "label": "Customer Portal",
            "path": "/customer",
            "modules": [
                {"name": "Overview", "path": "/customer"},
                {"name": "Tickets", "path": "/customer/tickets"},
                {"name": "Knowledge", "path": "/customer/kb"},
            ],
        },
        "landing": {
            "label": "Tenant Landing Page",
            "path": "/",
            "modules": [],
        },
    }

    def get(self, request):
        host = request.GET.get("subdomain") or request.get_host().split(":")[0].split(".")[0]
        tenant = Tenant.objects.filter(subdomain=host).first()

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
                    "title": "What you can do",
                    "subtitle": "Core capabilities delivered dynamically from platform metadata.",
                    "items": [
                        {"title": "Business Admin", "description": "Manage users, groups and workflows."},
                        {"title": "Support Portal", "description": "Track tickets and SLAs in real-time."},
                        {"title": "Customer Portal", "description": "Give customers a self-service workspace."},
                    ],
                },
            },
            "portals": self.DEFAULT_PORTALS,
        }

        if not tenant:
            return Response(payload)

        tenant_modules = (
            TenantModule.objects.filter(tenant=tenant, active=True)
            .select_related("module")
            .values_list("module__name", "module__label")
        )

        for module_name, module_label in tenant_modules:
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

        for key in ("admin", "support", "customer"):
            modules = payload["portals"][key]["modules"]
            unique_modules = []
            seen_paths = set()
            for module in modules:
                if module["path"] in seen_paths:
                    continue
                seen_paths.add(module["path"])
                unique_modules.append(module)
            payload["portals"][key]["modules"] = unique_modules

        return Response(payload)
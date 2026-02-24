from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from metaengine.models import MetaTable
import json


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

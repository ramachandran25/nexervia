from rest_framework import serializers
from metaengine.models import MetaTable


class MetaTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetaTable
        fields = "__all__"

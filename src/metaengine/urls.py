from django.urls import path
from .views import CreateDynamicRecord, ListDynamicRecord

urlpatterns = [
    path("api/<str:table_name>/create/", CreateDynamicRecord.as_view(), name="dynamic-create"),
    path("api/<str:table_name>/list/", ListDynamicRecord.as_view()),
]

from django.urls import path
from .views import DynamicTableView

urlpatterns = [
    path("data/<str:table_name>/", DynamicTableView.as_view()),
]

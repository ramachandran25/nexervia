from django.urls import path
from .views import DynamicTableView, PortalBootstrapView

urlpatterns = [
    path("data/<str:table_name>/", DynamicTableView.as_view()),
    path("portal/bootstrap/", PortalBootstrapView.as_view()),
]

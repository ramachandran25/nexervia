from django.urls import path
from .views import DynamicTableView, PortalBootstrapView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("data/<str:table_name>/", DynamicTableView.as_view()),
    path("portal/bootstrap/", PortalBootstrapView.as_view()),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

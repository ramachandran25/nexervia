from django.urls import path, include

from landing import views as landing_views

# enterprises url conf
urlpatterns = [
    path("", landing_views.landing_dashboard_page_view, name='home'),
    path("services/", landing_views.services_page_view, name='services'),
    path("pricing/", landing_views.pricing_page_view, name='pricing'),
    path("pricing-page/", landing_views.pricing_page_view, name='marketing_pricing'),
    path("contact/", landing_views.contact_page_view, name='contact'),
    path('accounts/', include('allauth.urls')),
]

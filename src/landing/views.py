import helpers.numbers
from django.shortcuts import render

from dashboard.views import dashboard_view
from visits.models import PageVisit
from decouple import config
from helpers.db import use_dynamic_database_url


from .content import get_hero_image_for_request, get_site_content_for_request


def _marketing_context(request, extra=None):
    context = {
        "site_content": get_site_content_for_request(request),
        "hero_image_src": get_hero_image_for_request(request),
    }
    if extra:
        context.update(extra)
    return context


def landing_dashboard_page_view(request):
    qs = PageVisit.objects.all()
    DB_URL_2 = config('DB_URL_2', default=None)
    if DB_URL_2 is not None:
        alias = 'db_url_2'
        with use_dynamic_database_url(DB_URL_2, alias=alias):
            qs = PageVisit.objects.using(alias).all()
            PageVisit.objects.using(alias).create(path=request.path, user=None)

    user = request.user if request.user.is_authenticated else None
    PageVisit.objects.create(path=request.path, user=user)
    qs = PageVisit.objects.all()
    if user is not None:
        return dashboard_view(request)

    page_views_formatted = helpers.numbers.shorten_number(qs.count() * 100_000)
    social_views_formatted = helpers.numbers.shorten_number(qs.count() * 23_000)

    return render(
        request,
        "landing/main.html",
        _marketing_context(
            request,
            {
                "page_view_count": page_views_formatted,
                "social_views_count": social_views_formatted,
            },
        ),
    )


def services_page_view(request):
    return render(request, "landing/services.html", _marketing_context(request))


def pricing_page_view(request):
    return render(request, "landing/pricing.html", _marketing_context(request))


def contact_page_view(request):
    return render(request, "landing/contact.html", _marketing_context(request))

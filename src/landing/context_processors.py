from .content import get_site_content_for_request


def tenant_site_content(request):
    return {
        "tenant_site_content": get_site_content_for_request(request)
    }

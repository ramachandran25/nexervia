from django.test import SimpleTestCase, RequestFactory

from .content import get_site_content_for_request


class TenantContentTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_public_host_uses_default_content(self):
        request = self.factory.get('/', HTTP_HOST='www.localhost:8000')
        content = get_site_content_for_request(request)
        self.assertEqual(content['brand']['name'], 'SaaS')

    def test_subdomain_uses_tenant_json(self):
        request = self.factory.get('/', HTTP_HOST='acme.localhost:8000')
        content = get_site_content_for_request(request)
        self.assertEqual(content['brand']['name'], 'Acme SaaS')

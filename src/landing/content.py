import json
from pathlib import Path

from django.core.cache import cache

PUBLIC_SUBDOMAINS = {None, "", "www", "localhost", "desalsa", "127", "127.0.0.1"}

CONTENT_DIR = Path(__file__).resolve().parent / "content"


def _normalize_subdomain(value):
    if value is None:
        return None
    return str(value).strip().lower()


def get_request_subdomain(request):
    host = request.get_host().split(":")[0].strip().lower()
    parts = host.split(".")
    if len(parts) <= 1:
        return None
    return parts[0]


def _read_json_content(filename):
    file_path = CONTENT_DIR / filename
    if not file_path.exists():
        return None
    with file_path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def get_site_content_for_subdomain(subdomain=None):
    normalized_subdomain = _normalize_subdomain(subdomain)
    tenant_key = "default" if normalized_subdomain in PUBLIC_SUBDOMAINS else normalized_subdomain

    cache_key = f"tenant_site_content:{tenant_key}"
    try:
        cached = cache.get(cache_key)
    except Exception:
        cached = None
    if cached:
        return cached

    payload = _read_json_content(f"{tenant_key}.json")
    if payload is None and tenant_key != "default":
        payload = _read_json_content("default.json")

    if payload is None:
        payload = {}

    try:
        cache.set(cache_key, payload, 60)
    except Exception:
        pass
    return payload


def get_site_content_for_request(request):
    subdomain = get_request_subdomain(request)
    return get_site_content_for_subdomain(subdomain=subdomain)
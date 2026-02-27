export interface TenantContext {
  isPlatform: boolean;
  tenantSlug: string | null;
  subdomain: string;
}

export function detectTenant(): TenantContext {
  const host = window.location.hostname;

  // Localhost handling
  if (host.endsWith("localhost")) {
    const subdomain = host.split(".")[0];

    if (subdomain === "platform") {
      return {
        isPlatform: true,
        tenantSlug: null,
        subdomain,
      };
    }

    return {
      isPlatform: false,
      tenantSlug: subdomain,
      subdomain,
    };
  }

  // Production domain handling
  const parts = host.split(".");
  const subdomain = parts[0];

  if (subdomain === "platform") {
    return {
      isPlatform: true,
      tenantSlug: null,
      subdomain,
    };
  }

  return {
    isPlatform: false,
    tenantSlug: subdomain,
    subdomain,
  };
}
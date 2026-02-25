import api from "./api";


export interface PortalModule {
  name: string;
  path: string;
}

export interface PortalDefinition {
  label: string;
  path: string;
  modules: PortalModule[];
}

export interface PortalBootstrap {
  tenant: {
    subdomain: string;
    name: string;
  };
  branding: {
    company_name: string;
    theme_color: string;
  };
  landing: {
    hero: {
      title: string;
      subtitle: string;
      primary_cta: string;
      secondary_cta: string;
    };
    features: {
      title: string;
      subtitle: string;
      items: { title: string; description: string }[];
    };
  };
  portals: {
    admin: PortalDefinition;
    support: PortalDefinition;
    customer: PortalDefinition;
    landing: PortalDefinition;
  };
}

export async function getPortalBootstrap(subdomain?: string) {
  const query = subdomain ? `?subdomain=${encodeURIComponent(subdomain)}` : "";
  const response = await api.get<PortalBootstrap>(`/api/portal/bootstrap/${query}`);
  return response.data;
}

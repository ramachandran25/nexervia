import { useEffect, useState } from "react";
import { detectTenant } from "../../../core/tenant/tenant";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

interface TenantConfig {
  company_name: string;
  theme_color: string;
  hero: {
    title: string;
    subtitle: string;
    primary_cta: string;
    secondary_cta: string;
  };
  features: {
    title: string;
    subtitle: string;
    items: {
      title: string;
      description: string;
    }[];
  };
}

export default function LandingPage() {
  const tenant = detectTenant();
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadTenantConfig() {
      try {
        const res = await fetch(`/tenants/${tenant.subdomain}/config.json`);

        if (!res.ok) {
          throw new Error("Config not found");
        }

        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error("Landing load error:", err);
        setError(true);
      }
    }

    loadTenantConfig();
  }, [tenant.subdomain]);

  if (error) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Tenant configuration missing
        </h2>
        <p>Check public/tenants/{tenant.subdomain}/config.json</p>
      </div>
    );
  }

  if (!config) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      <HeroSection
        hero={{
          ...config.hero,
          image: `/tenants/${tenant.subdomain}/hero.png`,
        }}
        themeColor={config.theme_color}
      />

      {config.features && (
        <FeaturesSection features={config.features} />
      )}

    </div>
  );
}
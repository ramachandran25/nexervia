import { createContext, ReactNode, useState } from "react";

type PortalType = "platform" | "tenant";

interface PortalContextType {
  portal: PortalType;
  setPortal: (portal: PortalType) => void;
}

export const PortalContext = createContext<PortalContextType>({
  portal: "tenant",
  setPortal: () => {},
});

export function PortalProvider({ children }: { children: ReactNode }) {
  const [portal, setPortal] = useState<PortalType>("tenant");

  return (
    <PortalContext.Provider value={{ portal, setPortal }}>
      {children}
    </PortalContext.Provider>
  );
}
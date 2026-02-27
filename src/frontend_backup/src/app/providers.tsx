import { ReactNode } from "react";
import { AuthProvider } from "../core/auth/AuthContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
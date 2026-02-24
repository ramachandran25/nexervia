import AppRoutes from "./routes";
import { AppProviders } from "./providers";
import ErrorBoundary from "../shared/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}
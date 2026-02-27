import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

interface Props {
  children: JSX.Element;
}

export default function RoleGuard({ children }: Props) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
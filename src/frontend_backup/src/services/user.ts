import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  username: string;
  role?: string;
  is_superuser?: boolean;
  exp: number;
}

export const getUserInfo = (): JwtPayload | null => {
  const token = localStorage.getItem("access_token");

  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};
export type UserRole =
  | "platform_admin"
  | "tenant_admin"
  | "support_user"
  | "customer_user";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  tenant?: string;
}
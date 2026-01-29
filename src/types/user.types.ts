export enum UserRole {
  ADMIN = "Admin",
  USER = "User",
  SUPER_ADMIN = "Super Admin",
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  image: string;
  provider: string;
  role?: UserRole;
}

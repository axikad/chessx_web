import { createContext, useContext, type ReactNode } from 'react';

export type NavigationAccess = {
  permissions?: readonly string[];
  features?: readonly string[];
};

type NavigationAccessContextValue = {
  can: (permission?: string) => boolean;
  hasFeature: (feature?: string) => boolean;
};

const NavigationAccessContext = createContext<NavigationAccessContextValue>({
  can: () => true,
  hasFeature: () => true,
});

export function NavigationAccessProvider({ children, permissions, features }: NavigationAccess & { children: ReactNode }) {
  const can = (permission?: string) => !permission || !permissions || permissions.includes(permission);
  const hasFeature = (feature?: string) => !feature || !features || features.includes(feature);
  return <NavigationAccessContext.Provider value={{ can, hasFeature }}>{children}</NavigationAccessContext.Provider>;
}

export const useNavigationAccess = () => useContext(NavigationAccessContext);

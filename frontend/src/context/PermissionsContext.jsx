import { createContext, useContext, useMemo } from "react";
import { ACCOUNT_KIND } from "@/constants/registerRoles";

const PermissionsContext = createContext({
  accountKind: "",
  canManageInventory: false,
  canManageUsers: false
});

export function PermissionsProvider({ accountKind = "", children }) {
  const value = useMemo(() => {
    const admin = accountKind === ACCOUNT_KIND.admin;
    const manager = accountKind === ACCOUNT_KIND.manager;
    const elevated = admin || manager;
    return {
      accountKind,
      canManageInventory: elevated,
      canManageUsers: elevated
    };
  }, [accountKind]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  return useContext(PermissionsContext);
}

import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRight?: string; // the permission or appKey needed for this page
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRight }) => {
  const token = localStorage.getItem("userId"); // auth check
  const location = useLocation();

  if (!token) {
    // Not authenticated → redirect to signin
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (requiredRight) {
  const accessibleAppsRaw = localStorage.getItem("accessibleApps");
  const accessibleApps: string[] = accessibleAppsRaw ? JSON.parse(accessibleAppsRaw) : [];

  if (!accessibleApps.includes(requiredRight)) {
    return <Navigate to="/home" replace />;
  }
}

  // Authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;

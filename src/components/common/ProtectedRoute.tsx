import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRight?: string; 
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRight }) => {
  const token = localStorage.getItem("userId"); 
  const location = useLocation();

  if (!token) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (location.pathname === "/") {
    return <Navigate to="/home" replace />;
  }

  if (requiredRight) {
    const accessibleAppsRaw = localStorage.getItem("accessibleApps");
    const accessibleApps: string[] = accessibleAppsRaw ? JSON.parse(accessibleAppsRaw) : [];

    if (!accessibleApps.includes(requiredRight)) {
      return <Navigate to="/home" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

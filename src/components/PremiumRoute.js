import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PremiumRoute({ children }) {
  const { isPremium } = useAuth();

  return isPremium() ? children : <Navigate to="/upgrade" />;
}

export default PremiumRoute;

import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";

export function RedirectToHomeEvents() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  useEffect(() => {
    // Reconstruct the path with /home prefix
    const newPath = `/home${location.pathname}`;
    navigate(newPath, { replace: true });
  }, [navigate, location.pathname]);
  
  return null;
}

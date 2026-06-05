import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * EventsRedirect - Redirects old Events page to Home
 * The old Events list page has been disabled per requirement.
 * Events are now managed through:
 * - Home dashboard
 * - Event Detail pages (accessed directly)
 * - Sub-Event pages (for managing fight cards)
 */
export function EventsRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#0A3D91] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#707070] font-medium">Redirecting...</p>
      </div>
    </div>
  );
}

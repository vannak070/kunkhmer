/** Old fight-card links (/home/batches/:id, /home/matches/:id) open the fight night at that card. */
import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { api } from "../../utils/api";

export function FightCardRedirect() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    api.batches
      .get(batchId!)
      .then((card: any) => navigate(`/home/events/${card.event_id}#card-${card.id}`, { replace: true }))
      .catch(() => navigate("/home/program?tab=events", { replace: true }));
  }, [batchId]);
  if (!batchId) return <Navigate to="/home/program?tab=events" replace />;
  return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
}

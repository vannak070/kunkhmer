import { Navigate } from "react-router";

export function RedirectToFighters() {
  return <Navigate to="/home/fighters" replace />;
}
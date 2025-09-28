// frontend/src/routes/AdminRoutes.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { adminMe } from "../services/adminApi";

export default function AdminGuard({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });

  useEffect(() => {
    (async () => {
      try {
        await adminMe();
        setState({ loading: false, ok: true });
      } catch {
        setState({ loading: false, ok: false });
      }
    })();
  }, []);

  if (state.loading) return null; // ou spinner
  return state.ok ? children : <Navigate to="/admin/login" replace />;
}

// src/components/RequireAdmin.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminMe } from "../services/adminApi";

export default function RequireAdmin() {
  const [ok, setOk] = useState(null);
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await adminMe();
        if (mounted) setOk(true);
      } catch {
        if (mounted) setOk(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (ok === null) return <div className="p-6">Vérification…</div>;
  if (ok === false)
    return <Navigate to="/admin/login" replace state={{ from: loc }} />;

  return <Outlet />;
}

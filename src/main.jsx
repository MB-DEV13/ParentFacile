// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";

// Documents
import DocsIndex from "./pages/documents/Index.jsx";

// Informations
import InfosIndex from "./pages/informations/Index.jsx";
import Grossesse from "./pages/informations/Grossesse.jsx";
import Naissance from "./pages/informations/Naissance.jsx";
import UnATroisAns from "./pages/informations/UnATroisAns.jsx";

// Légal
import CGU from "./pages/legal/CGU.jsx";
import Confidentialite from "./pages/legal/Confidentialite.jsx";
import MentionsLegales from "./pages/legal/MentionsLegales.jsx";

// Compte (futur)
import Login from "./pages/account/Login.jsx";
import Register from "./pages/account/Register.jsx";
import Dashboard from "./pages/account/Dashboard.jsx";

// --- Admin (pages + guard) ---
import AdminLogin from "./pages/admin/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminMessages from "./pages/admin/AdminMessages.jsx"; // page “Voir tous”
import RequireAdmin from "./components/RequireAdmin.jsx"; // guard (doit exister)

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      // Public
      { path: "/", element: <Home /> },
      { path: "/contact", element: <Contact /> },
      { path: "/documents", element: <DocsIndex /> },

      // Informations
      {
        path: "/informations",
        children: [
          { index: true, element: <InfosIndex /> },
          { path: "grossesse", element: <Grossesse /> },
          { path: "naissance", element: <Naissance /> },
          { path: "1-3-ans", element: <UnATroisAns /> },
        ],
      },

      // Légal
      { path: "/cgu", element: <CGU /> },
      { path: "/confidentialite", element: <Confidentialite /> },
      { path: "/mentions-legales", element: <MentionsLegales /> },

      // Compte (futur)
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/dashboard", element: <Dashboard /> },

      // --- ADMIN ---
      { path: "/admin/login", element: <AdminLogin /> },
      {
        path: "/admin",
        element: <RequireAdmin />, // protège /admin et ses sous-pages
        children: [
          { index: true, element: <AdminDashboard /> }, // /admin
          { path: "messages", element: <AdminMessages /> }, // /admin/messages
        ],
      },

      // (optionnel) petit 404 propre si tu veux
      // { path: "*", element: <div className="p-6">Page introuvable</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

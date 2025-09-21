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

// Compte (future)
import Login from "./pages/account/Login.jsx";
import Register from "./pages/account/Register.jsx";
import Dashboard from "./pages/account/Dashboard.jsx";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
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

      // Compte
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/dashboard", element: <Dashboard /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

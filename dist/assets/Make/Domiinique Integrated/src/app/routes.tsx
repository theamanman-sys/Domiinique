import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { RitualBuilder } from "./pages/RitualBuilder";
import { SensoryPanel } from "./pages/SensoryPanel";
import { Journal } from "./pages/Journal";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "rituals",
        element: <RitualBuilder />,
      },
      {
        path: "sensory",
        element: <SensoryPanel />,
      },
      {
        path: "journal",
        element: <Journal />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);
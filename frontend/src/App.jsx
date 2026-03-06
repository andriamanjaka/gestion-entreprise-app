import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Registre from "./pages/Registre";
import Dashboard from "./pages/Dashboard";
import Employer from "./pages/Employer";
import Projects from "./pages/Projects";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registre",
    element: <Registre />,
  },
   {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/employer",
    element: <Employer />,
  },
  {
    path: "/projects",
    element: <Projects />,
  },
  {
    path: "/finance",
    element: <Finance />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

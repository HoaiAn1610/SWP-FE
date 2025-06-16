import React from "react";
import Dashboard from "./component/dashboard";
import UploadComponent from "./component/upload";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ManageProduct from "./pages/admin/manage-product";
import ReportPage from "./pages/admin/report";
import EcommerceHome from "./pages/common/home";
import ProtectedRoute from "./component/protected-route";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <EcommerceHome />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "dashboard",
      element: (
        <ProtectedRoute role={"ADMIN"}>
          <Dashboard />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "manage-product",
          element: <ManageProduct />,
        },
        {
          path: "",
          element: <ReportPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

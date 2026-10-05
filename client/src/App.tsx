import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./Authentication/Login";
import Register from "./Authentication/Register";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* PROTECTED ROUTES */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/customers"
              element={<Customers />}
            />

            <Route
              path="/customers/:id"
              element={<CustomerDetails />}
            />

            <Route
              path="/deals"
              element={<Deals />}
            />

            <Route
              path="/tasks"
              element={<Tasks />}
            />
          </Route>
        </Route>

        {/* UNKNOWN ROUTES */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
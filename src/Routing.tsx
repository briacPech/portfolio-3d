import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Loader } from "@react-three/drei";
import App from "./App";
import { LOADER_CONFIG } from "./constants/loaderConfig";

import { ProtectedRoute } from "./admin/ProtectedRoute";
import { Login } from "./admin/Login";
import { Dashboard } from "./admin/Dashboard";

const Contact = lazy(() => import("./components/contact/Contact"));

const Routing = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/contact"
          element={
            <Suspense fallback={null}>
              <Contact />
            </Suspense>
          }
        />
        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<App />} />
      </Routes>
    </Router>
  );
};

export default Routing;

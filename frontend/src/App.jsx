import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAdmin from "./components/RequireAdmin";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import YatraListPage from "./pages/YatraListPage";
import YatraDetailPage from "./pages/YatraDetailPage";
import YatraBookingPage from "./pages/YatraBookingPage";
import AdminYatraListPage from "./pages/admin/AdminYatraListPage";
import AdminYatraEditPage from "./pages/admin/AdminYatraEditPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminEnquiriesPage from "./pages/admin/AdminEnquiriesPage";
import { ADMIN_BASE } from "./lib/adminPath";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/events" element={<YatraListPage />} />
          <Route path="/events/:slug" element={<YatraDetailPage />} />
          <Route path="/events/:slug/book" element={<YatraBookingPage />} />

          {/* Admin area lives at a secret, unlinked path (see lib/adminPath.js) —
              set VITE_ADMIN_PATH in .env to control the real URL. */}
          <Route
            path={`${ADMIN_BASE}/events`}
            element={
              <RequireAdmin>
                <AdminYatraListPage />
              </RequireAdmin>
            }
          />
          <Route
            path={`${ADMIN_BASE}/events/new`}
            element={
              <RequireAdmin>
                <AdminYatraEditPage />
              </RequireAdmin>
            }
          />
          <Route
            path={`${ADMIN_BASE}/events/:id`}
            element={
              <RequireAdmin>
                <AdminYatraEditPage />
              </RequireAdmin>
            }
          />
          <Route
            path={`${ADMIN_BASE}/events/:id/bookings`}
            element={
              <RequireAdmin>
                <AdminBookingsPage />
              </RequireAdmin>
            }
          />
          <Route
            path={`${ADMIN_BASE}/events/:id/enquiries`}
            element={
              <RequireAdmin>
                <AdminEnquiriesPage />
              </RequireAdmin>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

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

          <Route
            path="/admin/events"
            element={
              <RequireAdmin>
                <AdminYatraListPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <RequireAdmin>
                <AdminYatraEditPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/events/:id"
            element={
              <RequireAdmin>
                <AdminYatraEditPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/events/:id/bookings"
            element={
              <RequireAdmin>
                <AdminBookingsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/events/:id/enquiries"
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

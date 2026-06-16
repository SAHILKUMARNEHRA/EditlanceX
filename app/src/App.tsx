import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';

// Editor Pages
import EditorDashboard from '@/pages/editor/Dashboard';
import EditorJobs from '@/pages/editor/Jobs';
import EditorProfile from '@/pages/editor/Profile';

// Client Pages
import ClientDashboard from '@/pages/client/Dashboard';
import PostJob from '@/pages/client/PostJob';
import EditorListing from '@/pages/client/EditorListing';

// Admin Pages
import AdminDashboard from '@/pages/AdminDashboard';
import Requests from '@/pages/Requests';
import EditorProfileView from '@/pages/EditorProfileView';

import { useAuth } from '@/context/AuthContext';

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    if (user?.role === 'editor') return <Navigate to="/editor/dashboard" />;
    if (user?.role === 'client') return <Navigate to="/client/dashboard" />;
  }
  return <Landing />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><HomeRedirect /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Shared Authenticated Routes */}
          <Route
            path="/requests"
            element={
              <ProtectedRoute allowedRoles={['client', 'editor']}>
                <Layout>
                  <Requests />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Editor Routes */}
          <Route
            path="/editor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['editor']}>
                <Layout>
                  <EditorDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/jobs"
            element={
              <ProtectedRoute allowedRoles={['editor']}>
                <Layout>
                  <EditorJobs />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/profile"
            element={
              <ProtectedRoute allowedRoles={['editor']}>
                <Layout>
                  <EditorProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Public editor profile view (clients view hired editors).
              Placed after the static /editor/* routes; React Router matches
              those static paths before this dynamic :id route. */}
          <Route
            path="/editor/:id"
            element={
              <ProtectedRoute allowedRoles={['client', 'editor', 'admin']}>
                <Layout>
                  <EditorProfileView />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Client Routes */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <Layout>
                  <ClientDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/post-job"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <Layout>
                  <PostJob />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/editors"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <Layout>
                  <EditorListing />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'client', 'editor']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

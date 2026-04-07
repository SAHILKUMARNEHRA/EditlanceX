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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

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

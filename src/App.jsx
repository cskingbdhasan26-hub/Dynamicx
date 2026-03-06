import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Authentication Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/admin/AdminLogin'; // ← New

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import AddSoftware from './pages/admin/AddSoftware';
import Software from './pages/admin/Software';
import AddKeys from './pages/admin/AddKeys';
import Keys from './pages/admin/Keys';

// Reseller Pages
import ResellerDashboard from './pages/reseller/Dashboard';

// Protected Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Shobai access korte parbe */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} /> {/* ← New */}

        {/* Admin Routes - Shudhu Admin access korte parbe */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <Users />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/add-software" element={
          <AdminProtectedRoute>
            <AddSoftware />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/software" element={
          <AdminProtectedRoute>
            <Software />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/add-keys" element={
          <AdminProtectedRoute>
            <AddKeys />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/keys" element={
          <AdminProtectedRoute>
            <Keys />
          </AdminProtectedRoute>
        } />

        {/* Reseller Routes - Shudhu Active Reseller access korte parbe */}
        <Route path="/reseller" element={
          <ProtectedRoute>
            <ResellerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
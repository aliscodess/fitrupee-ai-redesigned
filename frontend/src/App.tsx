import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import AppLayout from './layouts/AppLayout';
import PublicLayout from './layouts/PublicLayout';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Private pages
import DashboardPage from './pages/app/DashboardPage';
import DietPlannerPage from './pages/app/DietPlannerPage';
import WorkoutPlannerPage from './pages/app/WorkoutPlannerPage';
import GroceryPlannerPage from './pages/app/GroceryPlannerPage';
import ProteinBudgetPage from './pages/app/ProteinBudgetPage';
import AIChatPage from './pages/app/AIChatPage';
import AnalyticsPage from './pages/app/AnalyticsPage';
import ProfilePage from './pages/app/ProfilePage';
import ProgressPage from './pages/app/ProgressPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#1A1A1A',
            border: '1px solid #DDD8CE',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(26,26,26,0.1)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: '0.87rem',
          },
          success: { iconTheme: { primary: '#2D5A1B', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* App */}
        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="diet" element={<DietPlannerPage />} />
          <Route path="workout" element={<WorkoutPlannerPage />} />
          <Route path="grocery" element={<GroceryPlannerPage />} />
          <Route path="protein-budget" element={<ProteinBudgetPage />} />
          <Route path="chat" element={<AIChatPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

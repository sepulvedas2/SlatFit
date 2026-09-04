import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { setupIframeMessaging } from './lib/iframe-messaging';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import LoginScreen from '@/components/auth/LoginScreen';
import Layout from './Layout';
import { api } from '@/api/client';

// Import pages
import Dashboard from './pages/Dashboard';
import FoodScanner from './pages/FoodScanner';
import Habits from './pages/Habits';
import Learning from './pages/Learning';
import MealPlans from './pages/MealPlans';
import Progresso from './pages/Progresso';
import SmartNutrition from './pages/SmartNutrition';
import WorkoutProgress from './pages/WorkoutProgress';
import Workouts from './pages/Workouts';
import Profile from './pages/Profile';
import AdminSetup from './pages/AdminSetup';
import Subscription from './pages/Subscription';

setupIframeMessaging();

const BYPASS_SUBSCRIPTION_GUARD_IN_DEV = import.meta.env.DEV;

const AuthenticatedApp = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  const billingQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: api.billing.getSubscription,
    enabled: isAuthenticated && !BYPASS_SUBSCRIPTION_GUARD_IN_DEV,
    retry: false,
  });

  // Show loading spinner while validating the stored session
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#0B3936' }}>
        <div className="w-10 h-10 border-2 border-[#CEF17B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Single source of truth: no valid session -> show the login screen
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#0F1C1B', minHeight: '100vh' }}>
        <LoginScreen />
      </div>
    );
  }

  if (!BYPASS_SUBSCRIPTION_GUARD_IN_DEV && billingQuery.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#0B3936' }}>
        <div className="w-10 h-10 border-2 border-[#CEF17B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSubscriptionRoute = location.pathname.toLowerCase() === '/subscription';
  const hasPaidAccess = BYPASS_SUBSCRIPTION_GUARD_IN_DEV || billingQuery.data?.hasAccess === true;

  if (!hasPaidAccess && !isSubscriptionRoute) {
    return <Navigate to="/Subscription" replace />;
  }

  // Render the main app
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/Subscription" element={<Subscription />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/FoodScanner" element={<FoodScanner />} />
        <Route path="/Habits" element={<Habits />} />
        <Route path="/Learning" element={<Learning />} />
        <Route path="/MealPlans" element={<MealPlans />} />
        <Route path="/Progresso" element={<Progresso />} />
        <Route path="/SmartNutrition" element={<SmartNutrition />} />
        <Route path="/WorkoutProgress" element={<WorkoutProgress />} />
        <Route path="/Workouts" element={<Workouts />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/AdminSetup" element={<AdminSetup />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Layout>
  );
};


function App() {
  return (
    <>
      <style>{`
        body {
          background-color: #0B3936 !important;
        }
      `}</style>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <VisualEditAgent />
        </QueryClientProvider>
      </AuthProvider>
    </>
  )
}

export default App

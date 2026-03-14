import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { setupIframeMessaging } from './lib/iframe-messaging';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './Layout';

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

setupIframeMessaging();

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Layout currentPageName="Dashboard">
      <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
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
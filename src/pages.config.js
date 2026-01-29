import Agenda from './pages/Agenda';
import BillingHistory from './pages/BillingHistory';
import Challenges from './pages/Challenges';
import CheckIn from './pages/CheckIn';
import Checkout from './pages/Checkout';
import Community from './pages/Community';
import DailySummary from './pages/DailySummary';
import Dashboard from './pages/Dashboard';
import FoodScanner from './pages/FoodScanner';
import Home from './pages/Home';
import MealPlans from './pages/MealPlans';
import Profile from './pages/Profile';
import Running from './pages/Running';
import SmartNutrition from './pages/SmartNutrition';
import Subscription from './pages/Subscription';
import WorkoutProgress from './pages/WorkoutProgress';
import Workouts from './pages/Workouts';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Agenda": Agenda,
    "BillingHistory": BillingHistory,
    "Challenges": Challenges,
    "CheckIn": CheckIn,
    "Checkout": Checkout,
    "Community": Community,
    "DailySummary": DailySummary,
    "Dashboard": Dashboard,
    "FoodScanner": FoodScanner,
    "Home": Home,
    "MealPlans": MealPlans,
    "Profile": Profile,
    "Running": Running,
    "SmartNutrition": SmartNutrition,
    "Subscription": Subscription,
    "WorkoutProgress": WorkoutProgress,
    "Workouts": Workouts,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
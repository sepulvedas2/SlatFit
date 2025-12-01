import Dashboard from './pages/Dashboard';
import FoodScanner from './pages/FoodScanner';
import Workouts from './pages/Workouts';
import MealPlans from './pages/MealPlans';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Checkout from './pages/Checkout';
import BillingHistory from './pages/BillingHistory';
import CheckIn from './pages/CheckIn';
import Challenges from './pages/Challenges';
import Community from './pages/Community';
import SmartNutrition from './pages/SmartNutrition';
import Agenda from './pages/Agenda';
import WorkoutProgress from './pages/WorkoutProgress';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "FoodScanner": FoodScanner,
    "Workouts": Workouts,
    "MealPlans": MealPlans,
    "Profile": Profile,
    "Subscription": Subscription,
    "Checkout": Checkout,
    "BillingHistory": BillingHistory,
    "CheckIn": CheckIn,
    "Challenges": Challenges,
    "Community": Community,
    "SmartNutrition": SmartNutrition,
    "Agenda": Agenda,
    "WorkoutProgress": WorkoutProgress,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
import Agenda from './pages/Agenda';
import BillingHistory from './pages/BillingHistory';
import Challenges from './pages/Challenges';
import CheckIn from './pages/CheckIn';
import Checkout from './pages/Checkout';
import Community from './pages/Community';
import FoodScanner from './pages/FoodScanner';
import Home from './pages/Home';
import MealPlans from './pages/MealPlans';
import Profile from './pages/Profile';
import SmartNutrition from './pages/SmartNutrition';
import Subscription from './pages/Subscription';
import WorkoutProgress from './pages/WorkoutProgress';
import Workouts from './pages/Workouts';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Agenda": Agenda,
    "BillingHistory": BillingHistory,
    "Challenges": Challenges,
    "CheckIn": CheckIn,
    "Checkout": Checkout,
    "Community": Community,
    "FoodScanner": FoodScanner,
    "Home": Home,
    "MealPlans": MealPlans,
    "Profile": Profile,
    "SmartNutrition": SmartNutrition,
    "Subscription": Subscription,
    "WorkoutProgress": WorkoutProgress,
    "Workouts": Workouts,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
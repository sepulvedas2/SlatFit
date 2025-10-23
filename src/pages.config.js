import Dashboard from './pages/Dashboard';
import FoodScanner from './pages/FoodScanner';
import Workouts from './pages/Workouts';
import MealPlans from './pages/MealPlans';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Checkout from './pages/Checkout';
import BillingHistory from './pages/BillingHistory';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "FoodScanner": FoodScanner,
    "Workouts": Workouts,
    "MealPlans": MealPlans,
    "Profile": Profile,
    "Subscription": Subscription,
    "Checkout": Checkout,
    "BillingHistory": BillingHistory,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};
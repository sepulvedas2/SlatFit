import Dashboard from './pages/Dashboard';
import FoodScanner from './pages/FoodScanner';
import Workouts from './pages/Workouts';
import MealPlans from './pages/MealPlans';
import Profile from './pages/Profile';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "FoodScanner": FoodScanner,
    "Workouts": Workouts,
    "MealPlans": MealPlans,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};
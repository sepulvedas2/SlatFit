/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
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
import Learning from './pages/Learning';
import MealPlans from './pages/MealPlans';
import Profile from './pages/Profile';
import Running from './pages/Running';
import SmartNutrition from './pages/SmartNutrition';
import Subscription from './pages/Subscription';
import WorkoutProgress from './pages/WorkoutProgress';
import Workouts from './pages/Workouts';
import Progresso from './pages/Progresso';
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
    "Learning": Learning,
    "MealPlans": MealPlans,
    "Profile": Profile,
    "Running": Running,
    "SmartNutrition": SmartNutrition,
    "Subscription": Subscription,
    "WorkoutProgress": WorkoutProgress,
    "Workouts": Workouts,
    "Progresso": Progresso,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
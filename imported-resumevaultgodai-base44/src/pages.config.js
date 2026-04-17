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
import Analytics from './pages/Analytics';
import ApplicationTracker from './pages/ApplicationTracker';
import AutoApply from './pages/AutoApply';
import CareerRoadmap from './pages/CareerRoadmap';
import CoverLetter from './pages/CoverLetter';
import Dashboard from './pages/Dashboard';
import ExecutiveResume from './pages/ExecutiveResume';
import FAQ from './pages/FAQ';
import FollowUpEmail from './pages/FollowUpEmail';
import InterviewCoach from './pages/InterviewCoach';
import InterviewMastery from './pages/InterviewMastery';
import JobAnalyzer from './pages/JobAnalyzer';
import ManageSubscription from './pages/ManageSubscription';
import MockInterview from './pages/MockInterview';
import PayPalSetup from './pages/PayPalSetup';
import PaymentSetupGuide from './pages/PaymentSetupGuide';
import PortfolioBuilder from './pages/PortfolioBuilder';
import PortfolioIdeas from './pages/PortfolioIdeas';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeLibrary from './pages/ResumeLibrary';
import Reviews from './pages/Reviews';
import SalaryNegotiation from './pages/SalaryNegotiation';
import TestPayPal from './pages/TestPayPal';
import TestPayment from './pages/TestPayment';
import StripeProductImporter from './pages/StripeProductImporter';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "ApplicationTracker": ApplicationTracker,
    "AutoApply": AutoApply,
    "CareerRoadmap": CareerRoadmap,
    "CoverLetter": CoverLetter,
    "Dashboard": Dashboard,
    "ExecutiveResume": ExecutiveResume,
    "FAQ": FAQ,
    "FollowUpEmail": FollowUpEmail,
    "InterviewCoach": InterviewCoach,
    "InterviewMastery": InterviewMastery,
    "JobAnalyzer": JobAnalyzer,
    "ManageSubscription": ManageSubscription,
    "MockInterview": MockInterview,
    "PayPalSetup": PayPalSetup,
    "PaymentSetupGuide": PaymentSetupGuide,
    "PortfolioBuilder": PortfolioBuilder,
    "PortfolioIdeas": PortfolioIdeas,
    "Pricing": Pricing,
    "Profile": Profile,
    "ResumeBuilder": ResumeBuilder,
    "ResumeLibrary": ResumeLibrary,
    "Reviews": Reviews,
    "SalaryNegotiation": SalaryNegotiation,
    "TestPayPal": TestPayPal,
    "TestPayment": TestPayment,
    "StripeProductImporter": StripeProductImporter,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
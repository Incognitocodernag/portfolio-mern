import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { logTelemetryEvent } from "./utils/telemetry";
import SplashScreen from "./components/SplashScreen";
import CookieConsent from "./components/CookieConsent";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Household from "./pages/Household";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AIAssistant from "./pages/AIAssistant";


// Protect routes that require login
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

// Redirect logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/" replace />;
};

const App = () => {
  const { showSplash, setShowSplash } = useAuth();
  const location = useLocation();

  useEffect(() => {
    logTelemetryEvent("page_view", { path: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    const handleConsentChange = () => {
      logTelemetryEvent("page_view", { path: location.pathname, note: "Consent granted" });
    };
    window.addEventListener("cookieConsentChange", handleConsentChange);
    return () => window.removeEventListener("cookieConsentChange", handleConsentChange);
  }, [location.pathname]);

  return (
    <>
      {/* Splash screen shown after registration */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* GDPR Cookie Consent Banner */}
      <CookieConsent />

      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password"  element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email"    element={<PublicRoute><VerifyEmail /></PublicRoute>} />
        <Route path="/privacy"         element={<PrivacyPolicy />} />
        <Route path="/terms"           element={<TermsOfService />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Layout><Transactions /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout><Analytics /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/household" element={
          <ProtectedRoute>
            <Layout><Household /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/pricing" element={
          <ProtectedRoute>
            <Layout><Pricing /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/ai-assistant" element={
          <ProtectedRoute>
            <Layout><AIAssistant /></Layout>
          </ProtectedRoute>
        }/>


        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
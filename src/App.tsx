import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Preloader } from './components/Preloader';
import { ScrollReveal } from './components/ScrollReveal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubmissionsProvider } from './context/SubmissionsContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { StandaloneLayout } from './layouts/StandaloneLayout';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OperatorDashboardPage } from './pages/OperatorDashboardPage';
import { ProductionQualityPage } from './pages/ProductionQualityPage';
import { ProfilePage } from './pages/ProfilePage';
import { QualityDashboardPage } from './pages/QualityDashboardPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { SuccessPage } from './pages/SuccessPage';
import { WizardPage } from './pages/WizardPage';

function RequireSession() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireRole() {
  const { user } = useAuth();
  if (!user?.roleConfirmed) return <Navigate to="/role" replace />;
  return <Outlet />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <ScrollReveal />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          className="page-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireSession />}>
          <Route element={<StandaloneLayout />}>
            <Route path="/role" element={<RoleSelectionPage />} />

            <Route element={<RequireRole />}>
              <Route path="/app/new" element={<WizardPage />} />
              <Route path="/app/success/:id" element={<SuccessPage />} />
              <Route path="/submit-7" element={<SuccessPage />} />
            </Route>
          </Route>

          <Route element={<RequireRole />}>
            <Route element={<DashboardLayout />}>
              <Route path="/app/operator" element={<OperatorDashboardPage />} />
              <Route path="/app/quality" element={<QualityDashboardPage />} />
              <Route path="/app/quality-view" element={<ProductionQualityPage />} />
              <Route path="/app/history" element={<HistoryPage />} />
              <Route path="/app/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Preloader />
        <AuthProvider>
          <ToastProvider>
            <SubmissionsProvider>
              <AppRoutes />
            </SubmissionsProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}

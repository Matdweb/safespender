import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import LoadingScreen from "@/components/LoadingScreen";
import { useFinancial } from "@/contexts/FinancialContext";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Calendar from "./pages/Calendar";
import Goals from "./pages/Goals";
import NotFound from "./pages/NotFound";
import FeatureTour from "@/components/tour/FeatureTour";

const queryClient = new QueryClient();

const OnboardingChecker = ({ children }: { children: React.ReactNode }) => {
  const { hasCompletedOnboarding, isCheckingOnboarding } = useFinancial();

  if (isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        open={true}
        onComplete={() => {
          // Mark that tour should start after onboarding
          localStorage.setItem('safespender-start-tour-after-onboarding', 'true');
          window.location.reload(); // Refresh to update the context
        }}
      />
    );
  }

  return <>{children}</>;
};

const TourStarter = () => {
  const { startTour, hasSeenTour } = useFeatureTour();

  useEffect(() => {
    const shouldStartTour = localStorage.getItem('safespender-start-tour-after-onboarding');
    if (shouldStartTour === 'true' && !hasSeenTour) {
      localStorage.removeItem('safespender-start-tour-after-onboarding');
      // Start tour after a brief delay to ensure page is loaded
      setTimeout(() => {
        startTour();
      }, 1000);
    }
  }, [startTour, hasSeenTour]);

  return null;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <ProtectedRoute>
                <FinancialProvider>
                  <OnboardingChecker>
                    <Index />
                  </OnboardingChecker>
                </FinancialProvider>
              </ProtectedRoute>
            ) : (
              <Landing />
            )
          } 
        />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <FinancialProvider>
                <OnboardingChecker>
                  <Calendar />
                </OnboardingChecker>
              </FinancialProvider>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute>
              <FinancialProvider>
                <OnboardingChecker>
                  <Goals />
                </OnboardingChecker>
              </FinancialProvider>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FeatureTour />
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

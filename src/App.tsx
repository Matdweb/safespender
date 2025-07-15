
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
                <Index />
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
              <Calendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute>
              <Goals />
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
            <FinancialProvider>
              <OnboardingChecker>
                <AppRoutes />
              </OnboardingChecker>
            </FinancialProvider>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

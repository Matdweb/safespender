
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
  const { hasCompletedOnboarding, isCheckingOnboarding, completeOnboarding } = useFinancial();

  if (isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        open={true}
        onComplete={() => {
          completeOnboarding();
        }}
      />
    );
  }

  return <>{children}</>;
};

const ProtectedRouteWithOnboarding = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <OnboardingChecker>
        {children}
      </OnboardingChecker>
    </ProtectedRoute>
  );
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
              <ProtectedRouteWithOnboarding>
                <Index />
              </ProtectedRouteWithOnboarding>
            ) : (
              <Landing />
            )
          } 
        />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRouteWithOnboarding>
              <Calendar />
            </ProtectedRouteWithOnboarding>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRouteWithOnboarding>
              <Goals />
            </ProtectedRouteWithOnboarding>
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
              <AppRoutes />
              <Toaster />
            </FinancialProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

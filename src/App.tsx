
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
import Index from "./pages/Index";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import Goals from "./pages/Goals";
import NotFound from "./pages/NotFound";

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
          // Onboarding completion is handled by the SummaryStep
          window.location.reload(); // Refresh to update the context
        }}
      />
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <FinancialProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <OnboardingChecker>
                        <Index />
                      </OnboardingChecker>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/calendar" 
                  element={
                    <ProtectedRoute>
                      <OnboardingChecker>
                        <Calendar />
                      </OnboardingChecker>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/goals" 
                  element={
                    <ProtectedRoute>
                      <OnboardingChecker>
                        <Goals />
                      </OnboardingChecker>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </FinancialProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

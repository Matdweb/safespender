
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useFinancialProfile } from '@/hooks/useFinancialData';

// Legacy exports for backward compatibility
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  recurringContribution?: number;
  contributionFrequency?: 'weekly' | 'biweekly' | 'monthly';
  icon?: string;
}

export interface SalaryConfig {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  daysOfMonth: number[];
  quarterlyAmounts: Array<{
    quarter: string;
    amount: number;
  }>;
}

// Simplified context for basic financial configuration
interface FinancialContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  isCheckingOnboarding: boolean;
  isFirstTimeUser: boolean;
  convertCurrency: (amount: number, targetCurrency: string) => number;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { data: financialProfile, isLoading: isLoadingProfile } = useFinancialProfile();
  
  const [currency, setCurrency] = useState('USD');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user has completed onboarding by checking if they have a financial profile
  useEffect(() => {
    if (user && !isLoadingProfile) {
      const hasProfile = !!financialProfile;
      setHasCompletedOnboarding(hasProfile);
      
      if (hasProfile) {
        setCurrency(financialProfile.base_currency);
      }
    } else if (!user) {
      setHasCompletedOnboarding(false);
    }
  }, [user, financialProfile, isLoadingProfile]);

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  const convertCurrency = (amount: number, targetCurrency: string) => {
    // Simple conversion rates (in a real app, use live rates)
    const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      CRC: 525,
      GBP: 0.73,
      CAD: 1.25
    };
    
    const fromRate = rates[currency] || 1;
    const toRate = rates[targetCurrency] || 1;
    
    return (amount / fromRate) * toRate;
  };

  const value: FinancialContextType = {
    currency,
    setCurrency,
    hasCompletedOnboarding,
    completeOnboarding,
    isCheckingOnboarding: isLoadingProfile,
    isFirstTimeUser: !hasCompletedOnboarding,
    convertCurrency,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

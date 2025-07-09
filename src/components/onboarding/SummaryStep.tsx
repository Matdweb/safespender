
import React from 'react';
import { OnboardingStepProps } from './types';
import { useFinancial } from '@/contexts/FinancialContext';
import { OnboardingData } from './OnboardingFlow';
import { Button } from '@/components/ui/button';

interface Props {
  data: OnboardingData;
  onNext: () => void;
  onBack?: () => void;
}

const SummaryStep = ({ data, onNext }: OnboardingStepProps) => {
  const { setCurrency, setSalary, addGoal, addTransaction, setStartDate } = useFinancial();

  const handleComplete = () => {
    console.log('🎯 Completing onboarding with data:', data);
    
    // Set app start date to today
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    
    // Set currency FIRST - this is critical for the base currency
    if (data.currency) {
      console.log('💰 Setting base currency:', data.currency);
      setCurrency(data.currency);
    }

    // Set salary configuration
    if (data.salary) {
      console.log('💰 Setting up salary:', data.salary);
      setSalary(data.salary);
    }

    // Add initial expenses
    if (data.expenses && data.expenses.length > 0) {
      console.log('💸 Adding initial expenses:', data.expenses);
      data.expenses.forEach(expense => {
        addTransaction({
          type: 'expense',
          amount: expense.amount,
          description: expense.description,
          date: today, // Use today as the date for initial expenses
          category: expense.category,
          isReserved: true, // Mark onboarding expenses as reserved
        });
      });
    }

    // Add initial savings goal
    if (data.goal) {
      console.log('🎯 Adding savings goal:', data.goal);
      addGoal({
        name: data.goal.name,
        targetAmount: data.goal.targetAmount,
        currentAmount: 0,
        recurringContribution: data.goal.recurringContribution,
        contributionFrequency: data.goal.contributionFrequency,
        icon: data.goal.icon,
      });
    }

    // Complete onboarding
    onNext();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Summary</h2>
      <p>Review your information before proceeding.</p>

      {data.currency && (
        <div className="border rounded-md p-4">
          <strong>Base Currency:</strong> {data.currency}
        </div>
      )}

      {data.salary && (
        <div className="border rounded-md p-4">
          <strong>Salary Frequency:</strong> {data.salary.frequency}
          <br />
          <strong>Pay Days:</strong> {data.salary.daysOfMonth.join(', ')}
          <br />
          <strong>Quarterly Amounts:</strong>
          <ul>
            {data.salary.quarterlyAmounts.map((q, index) => (
              <li key={index}>
                {q.quarter}: {q.amount}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.expenses && data.expenses.length > 0 && (
        <div className="border rounded-md p-4">
          <strong>Expenses:</strong>
          <ul>
            {data.expenses.map((expense, index) => (
              <li key={index}>
                {expense.description} - {expense.amount} ({expense.category})
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.goal && (
        <div className="border rounded-md p-4">
          <strong>Goal:</strong> {data.goal.name}
          <br />
          <strong>Target Amount:</strong> {data.goal.targetAmount}
          <br />
          <strong>Recurring Contribution:</strong> {data.goal.recurringContribution} ({data.goal.contributionFrequency})
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onNext}>
          Complete Onboarding
        </Button>
        <Button onClick={handleComplete}>Confirm</Button>
      </div>
    </div>
  );
};

export default SummaryStep;

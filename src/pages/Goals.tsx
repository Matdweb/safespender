
import React, { useState } from 'react';
import Header from '@/components/Header';
import GoalCard from '@/components/goals/GoalCard';
import AddGoalModal from '@/components/goals/AddGoalModal';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';

const Goals = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { goals, addGoal, updateGoal, deleteGoal } = useFinancial();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleAddGoal = (newGoal: any) => {
    addGoal({
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount || 0,
      recurringContribution: newGoal.recurringContribution || 0,
      contributionFrequency: newGoal.contributionFrequency || 'monthly',
      icon: newGoal.icon || '💰'
    });
  };

  const handleUpdateGoal = (updatedGoal: any) => {
    updateGoal(updatedGoal.id, updatedGoal);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                Your Savings Goals
              </h1>
              <p className="text-muted-foreground">
                Track your progress and stay motivated on your financial journey
              </p>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground hover-lift"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="animate-fade-in text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Let's build something together 🌱
              </h3>
              <p className="text-muted-foreground mb-6">
                Set your first savings goal and start your journey toward financial freedom. Every goal begins with a single step.
              </p>
              <Button 
                onClick={() => setShowAddModal(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground hover-lift"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal, index) => (
              <div 
                key={goal.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <GoalCard
                  goal={goal}
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                />
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {goals.length > 0 && (
          <div className="animate-slide-up bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {goals.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  ${goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  ${goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Target</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <AddGoalModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddGoal={handleAddGoal}
      />
    </div>
  );
};

export default Goals;

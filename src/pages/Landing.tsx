import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, TrendingUp, Target, AlertCircle, Moon, Sun, ArrowRight, CheckCircle, Smartphone, BarChart3, Clock } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const {
    user
  } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load theme from cookie on mount
  useEffect(() => {
    const savedTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
    const prefersDark = savedTheme === 'dark' || !savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);

    // Save to cookie
    document.cookie = `theme=${newMode ? 'dark' : 'light'}; path=/; max-age=${365 * 24 * 60 * 60}`;
  };
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const features = [{
    icon: DollarSign,
    title: "Free to Spend Today",
    description: "Real-time calculation of your available balance after all planned expenses and savings goals."
  }, {
    icon: TrendingUp,
    title: "Smart Income Forecasting",
    description: "Automatically adjusts to your pay cycle and predicts future income with intelligent algorithms."
  }, {
    icon: Target,
    title: "Goal-Based Savings",
    description: "Track, delay, or accelerate your savings goals dynamically based on your financial situation."
  }, {
    icon: AlertCircle,
    title: "Emergency Support",
    description: "Tap into future income or savings when you need extra money with smart recommendations."
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={scrollToFeatures} className="text-muted-foreground hover:text-primary transition-colors">
                Features
              </button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({
              behavior: 'smooth'
            })} className="text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </button>
            </nav>
            
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="rounded-full">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/login">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              🎯 Smart Budget Planning
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              Smarter Spending <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up animation-delay-150">
              Take control of your money with a calendar-based system that tracks your income, 
              expenses, and goals in one clear view.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-300">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/login">
                  Sign Up Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={scrollToFeatures}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Feature Showcase */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                📅 Our Secret Weapon
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                See Your Entire Financial Life <br />
                <span className="text-primary">On a Calendar</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Unlike traditional budgeting apps, SafeSpender shows you exactly when money 
                comes in and goes out, helping you make smarter spending decisions every day.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 min-w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Visual Timeline</h3>
                    <p className="text-muted-foreground">
                      See upcoming income, planned expenses, and savings goals all in one calendar view.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 min-w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Future Planning</h3>
                    <p className="text-muted-foreground">
                      Track programmed but not yet deducted expenses to understand your real available balance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 min-w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Smart Decisions</h3>
                    <p className="text-muted-foreground">
                      Know exactly how much money you can spend today without affecting future plans.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="w-16 h-16 text-primary mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Interactive Calendar Preview</p>
                      <p className="text-xs text-muted-foreground mt-1">Available in the app</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                ✨ Powerful Features
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Everything You Need for <br />
                <span className="text-primary">Financial Success</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => <Card key={index} className="hover-lift">
                  <CardHeader>
                    <div className="w-12 h-12 min-w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              💰 Simple Pricing
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Pricing Coming Soon
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're working on flexible pricing that grows with you. 
              Start free and upgrade when you're ready for premium features.
            </p>
            
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Early Access</CardTitle>
                <CardDescription>Get started with all features completely free</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">Free</div>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Calendar-based budgeting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Income & expense tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Savings goals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Smart notifications
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Start Your Journey Toward <br />
              <span className="text-primary">Financial Clarity</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who have taken control of their finances with SafeSpender.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/login">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link to="/login">Already have an account? Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Logo size="sm" />
            
            <nav className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </nav>
            
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="rounded-full">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">© 2025 SafeSpender. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};

export default Landing;

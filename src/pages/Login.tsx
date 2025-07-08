
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('demo@safespender.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to SafeSpender",
      });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Coming Soon!",
      description: "Google sign-in will be available in the next update",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Let's get your money under control
          </p>
        </div>
        {/* Login Card */}
        <Card className="animate-scale-in bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 transition-all duration-200 ${errors.email ? 'border-destructive focus:border-destructive' : ''
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 transition-all duration-200 ${errors.password ? 'border-destructive focus:border-destructive' : ''
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive animate-fade-in">{errors.password}</p>
                )}
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover-lift"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Start your flow'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full transition-all duration-200 hover-lift"
              onClick={handleGoogleSignIn}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>

            {/* Demo Credentials */}
            <div className="mt-6 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials:</p>
              <p className="text-xs text-center">
                <span className="font-mono">demo@safespender.com</span> / <span className="font-mono">demo123</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-scale-in bg-card/80 backdrop-blur-sm border-border/50 shadow-lg mt-4">
          {/* Logo */}
          <div className="text-center py-4 mb-8 animate-fade-in">
            <Logo size="lg" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

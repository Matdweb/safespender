-- Add feature tour completion tracking to financial_profiles table
ALTER TABLE public.financial_profiles 
ADD COLUMN has_completed_feature_tour BOOLEAN NOT NULL DEFAULT false;
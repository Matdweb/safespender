-- Create simplified salary table
CREATE TABLE public.salary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  schedule TEXT NOT NULL CHECK (schedule IN ('monthly', 'biweekly', 'yearly')),
  pay_dates INTEGER[] NOT NULL,
  paychecks DECIMAL[] NOT NULL,
  time_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT pay_dates_paychecks_length_match CHECK (array_length(pay_dates, 1) = array_length(paychecks, 1))
);

-- Enable Row Level Security
ALTER TABLE public.salary ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own salary" 
ON public.salary 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own salary" 
ON public.salary 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own salary" 
ON public.salary 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own salary" 
ON public.salary 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_salary_updated_at
BEFORE UPDATE ON public.salary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add missing columns and fix recurring expense logic in expenses table

-- First, check current schema and add any missing columns for proper recurring logic
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS next_occurrence_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS end_date DATE;

-- Create function to generate recurring expenses
CREATE OR REPLACE FUNCTION generate_recurring_expenses(
  user_id_param UUID,
  start_date_param DATE,
  end_date_param DATE
) RETURNS TABLE (
  id TEXT,
  description TEXT,
  amount NUMERIC,
  category TEXT,
  date DATE,
  is_recurring BOOLEAN,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE recurring_dates AS (
    -- Base case: start with expenses that are recurring
    SELECT 
      e.id::TEXT as expense_id,
      e.description,
      e.amount,
      e.category,
      CASE 
        WHEN e.day_of_month IS NOT NULL THEN 
          date_trunc('month', start_date_param)::DATE + (e.day_of_month - 1)
        ELSE start_date_param
      END as occurrence_date,
      e.is_recurring,
      e.user_id,
      e.recurring_type,
      e.recurring_interval,
      e.day_of_month
    FROM expenses e
    WHERE e.user_id = user_id_param 
      AND e.is_recurring = true
      AND (e.end_date IS NULL OR e.end_date >= start_date_param)
    
    UNION ALL
    
    -- Recursive case: generate next occurrences
    SELECT 
      rd.expense_id,
      rd.description,
      rd.amount,
      rd.category,
      CASE 
        WHEN rd.recurring_type = 'monthly' THEN 
          (rd.occurrence_date + INTERVAL '1 month')::DATE
        WHEN rd.recurring_type = 'weekly' THEN 
          (rd.occurrence_date + INTERVAL '7 days')::DATE
        WHEN rd.recurring_type = 'biweekly' THEN 
          (rd.occurrence_date + INTERVAL '14 days')::DATE
        WHEN rd.recurring_type = 'yearly' THEN 
          (rd.occurrence_date + INTERVAL '1 year')::DATE
        ELSE rd.occurrence_date + INTERVAL '1 month'
      END as occurrence_date,
      rd.is_recurring,
      rd.user_id,
      rd.recurring_type,
      rd.recurring_interval,
      rd.day_of_month
    FROM recurring_dates rd
    WHERE rd.occurrence_date < end_date_param
  )
  SELECT 
    'recurring-' || rd.expense_id || '-' || rd.occurrence_date::TEXT as id,
    rd.description,
    rd.amount,
    rd.category,
    rd.occurrence_date as date,
    rd.is_recurring,
    rd.user_id
  FROM recurring_dates rd
  WHERE rd.occurrence_date >= start_date_param 
    AND rd.occurrence_date <= end_date_param
  ORDER BY rd.occurrence_date;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for expenses table if it doesn't exist
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
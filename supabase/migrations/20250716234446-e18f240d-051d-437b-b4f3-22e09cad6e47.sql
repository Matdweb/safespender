-- Clean up duplicate gym transactions keeping only one per date
WITH ranked_transactions AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY date, description, amount, category, type, user_id 
      ORDER BY created_at ASC
    ) as rn
  FROM transactions 
  WHERE type = 'expense' 
    AND (description LIKE '%gym%' OR description LIKE '%Gym%')
    AND is_reserved = true
)
DELETE FROM transactions 
WHERE id IN (
  SELECT id FROM ranked_transactions WHERE rn > 1
);
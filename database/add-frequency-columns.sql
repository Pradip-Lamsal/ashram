-- Add frequency columns to donors table
ALTER TABLE donors 
ADD COLUMN IF NOT EXISTS frequency TEXT CHECK (frequency IN ('Daily', 'Monthly', 'Yearly')),
ADD COLUMN IF NOT EXISTS frequency_amount NUMERIC DEFAULT 0;

-- Comment: These columns are optional and used for recurring donation commitments.

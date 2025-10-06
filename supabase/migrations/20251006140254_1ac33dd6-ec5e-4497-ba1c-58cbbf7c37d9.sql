-- Add current_value column to financial_particulars table
ALTER TABLE public.financial_particulars 
ADD COLUMN current_value numeric DEFAULT 0 NOT NULL;

-- Update existing records to set current_value equal to cash (assuming current value equals cash for existing records)
UPDATE public.financial_particulars 
SET current_value = cash;
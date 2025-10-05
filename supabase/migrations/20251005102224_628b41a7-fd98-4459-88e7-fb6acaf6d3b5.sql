-- Add cash and investment columns to financial_particulars table
ALTER TABLE public.financial_particulars 
ADD COLUMN cash numeric DEFAULT 0 NOT NULL,
ADD COLUMN investment numeric DEFAULT 0 NOT NULL;

-- Update existing records to have amount split (for now, put all in cash)
UPDATE public.financial_particulars 
SET cash = amount, investment = 0 
WHERE cash = 0 AND investment = 0;
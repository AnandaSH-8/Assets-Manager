-- Add year column to financial_particulars table
ALTER TABLE public.financial_particulars 
ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now())::integer;

-- Update existing records to set year based on created_at
UPDATE public.financial_particulars 
SET year = EXTRACT(YEAR FROM created_at)::integer 
WHERE year = EXTRACT(YEAR FROM now())::integer;

-- Create index for better performance on year queries
CREATE INDEX idx_financial_particulars_year_month ON public.financial_particulars(year, month);
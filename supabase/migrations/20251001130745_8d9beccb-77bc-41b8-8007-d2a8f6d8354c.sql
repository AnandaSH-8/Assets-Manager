-- Add month field to financial_particulars table
ALTER TABLE public.financial_particulars 
ADD COLUMN month TEXT;

-- Add an index for better query performance on month
CREATE INDEX idx_financial_particulars_month ON public.financial_particulars(month);

-- Add comment to document the column
COMMENT ON COLUMN public.financial_particulars.month IS 'Month when the financial particular was added (e.g., January, February, etc.)';
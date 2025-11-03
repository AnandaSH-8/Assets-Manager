-- Add month_number column to financial_particulars
ALTER TABLE public.financial_particulars 
ADD COLUMN month_number INTEGER;

-- Update existing records to set month_number based on month text
UPDATE public.financial_particulars
SET month_number = CASE 
  WHEN month = 'January' THEN 1
  WHEN month = 'February' THEN 2
  WHEN month = 'March' THEN 3
  WHEN month = 'April' THEN 4
  WHEN month = 'May' THEN 5
  WHEN month = 'June' THEN 6
  WHEN month = 'July' THEN 7
  WHEN month = 'August' THEN 8
  WHEN month = 'September' THEN 9
  WHEN month = 'October' THEN 10
  WHEN month = 'November' THEN 11
  WHEN month = 'December' THEN 12
  ELSE NULL
END
WHERE month IS NOT NULL;
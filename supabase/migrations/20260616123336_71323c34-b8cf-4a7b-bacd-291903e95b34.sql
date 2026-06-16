
ALTER TABLE public.financial_particulars
  DROP CONSTRAINT IF EXISTS financial_particulars_amount_check;

ALTER TABLE public.financial_particulars
  ALTER COLUMN amount DROP DEFAULT,
  ALTER COLUMN cash DROP DEFAULT,
  ALTER COLUMN investment DROP DEFAULT,
  ALTER COLUMN current_value DROP DEFAULT;

ALTER TABLE public.financial_particulars
  ALTER COLUMN amount TYPE text USING amount::text,
  ALTER COLUMN cash TYPE text USING cash::text,
  ALTER COLUMN investment TYPE text USING investment::text,
  ALTER COLUMN current_value TYPE text USING current_value::text;

ALTER TABLE public.financial_particulars
  ALTER COLUMN amount SET DEFAULT '0',
  ALTER COLUMN cash SET DEFAULT '0',
  ALTER COLUMN investment SET DEFAULT '0',
  ALTER COLUMN current_value SET DEFAULT '0';

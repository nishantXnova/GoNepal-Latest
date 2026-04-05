-- Update guide_applications table with new KYC fields
ALTER TABLE public.guide_applications 
ADD COLUMN IF NOT EXISTS citizenship_number TEXT,
ADD COLUMN IF NOT EXISTS license_expiry_date DATE,
ADD COLUMN IF NOT EXISTS max_group_size INTEGER,
ADD COLUMN IF NOT EXISTS first_aid_certified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS high_altitude_exp TEXT,
ADD COLUMN IF NOT EXISTS daily_rate NUMERIC,
ADD COLUMN IF NOT EXISTS availability_text TEXT,
ADD COLUMN IF NOT EXISTS has_porter_contacts BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS previous_agency TEXT,
ADD COLUMN IF NOT EXISTS references_text TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN public.guide_applications.citizenship_number IS 'Nepal ID / Citizenship number';
COMMENT ON COLUMN public.guide_applications.first_aid_certified IS 'Whether the guide has Wilderness First Aid certification';
COMMENT ON COLUMN public.guide_applications.availability_text IS 'Simple text description of availability (e.g., Mon-Fri)';
COMMENT ON COLUMN public.guide_applications.references_text IS 'Paragraph describing previous work references';

-- Add title and consultation fields to chef_details table
ALTER TABLE public.chef_details
ADD COLUMN IF NOT EXISTS chef_title TEXT DEFAULT 'Chef' CHECK (chef_title IN ('Chef', 'Sous Chef', 'Executive Chef', 'Head Chef', 'Pastry Chef')),
ADD COLUMN IF NOT EXISTS offers_consultation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consultation_rate DECIMAL(10, 2);

-- Create an index for chef title filtering
CREATE INDEX IF NOT EXISTS chef_details_chef_title_idx ON public.chef_details(chef_title);
CREATE INDEX IF NOT EXISTS chef_details_offers_consultation_idx ON public.chef_details(offers_consultation);

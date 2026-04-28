-- Add service type field to bookings table to distinguish between catering and consultation
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'catering' CHECK (service_type IN ('catering', 'consultation')),
ADD COLUMN IF NOT EXISTS consultation_topic TEXT;

-- Create an index for service type filtering
CREATE INDEX IF NOT EXISTS bookings_service_type_idx ON public.bookings(service_type);

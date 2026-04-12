-- ============================================================================
-- STEP 1: CREATE ALL TABLES
-- ============================================================================

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('user', 'chef')),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chef_details table (extends profiles for chefs)
CREATE TABLE IF NOT EXISTS public.chef_details (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  cuisine_types TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  monthly_bookings_count INTEGER DEFAULT 0,
  max_monthly_bookings INTEGER DEFAULT 7,
  booking_advance_days INTEGER DEFAULT 30,
  hourly_rate DECIMAL(10, 2),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chef_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  guest_count INTEGER,
  dietary_restrictions TEXT,
  budget DECIMAL(10, 2),
  location_address TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'proposals_received', 'deal_locked', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  chef_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposed_price DECIMAL(10, 2) NOT NULL,
  menu_description TEXT,
  availability_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create deals table (locked agreements)
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  chef_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agreed_price DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  deposit_paid BOOLEAN DEFAULT FALSE,
  final_paid BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create saved_preferences table for users
CREATE TABLE IF NOT EXISTS public.saved_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chef_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- STEP 2: ENABLE RLS AND CREATE POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Chef details RLS policies
CREATE POLICY "chef_details_select_all" ON public.chef_details FOR SELECT USING (TRUE);
CREATE POLICY "chef_details_update_own" ON public.chef_details FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "chef_details_insert_own" ON public.chef_details FOR INSERT WITH CHECK (auth.uid() = id);

-- Bookings RLS policies (safe to reference proposals now)
CREATE POLICY "bookings_select_own_or_proposed" ON public.bookings FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT chef_id FROM public.proposals WHERE booking_id = bookings.id)
);
CREATE POLICY "bookings_insert_own" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update_own_or_assigned_chef" ON public.bookings FOR UPDATE USING (
  auth.uid() = user_id OR auth.uid() = chef_id
);

-- Proposals RLS policies
CREATE POLICY "proposals_select_booking_user_or_chef" ON public.proposals FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.bookings WHERE id = booking_id
  ) OR auth.uid() = chef_id
);
CREATE POLICY "proposals_insert_own" ON public.proposals FOR INSERT WITH CHECK (auth.uid() = chef_id);
CREATE POLICY "proposals_update_own_or_booking_user" ON public.proposals FOR UPDATE USING (
  auth.uid() = chef_id OR 
  auth.uid() IN (SELECT user_id FROM public.bookings WHERE id = booking_id)
);

-- Deals RLS policies
CREATE POLICY "deals_select_involved" ON public.deals FOR SELECT USING (
  auth.uid() = chef_id OR auth.uid() = user_id
);
CREATE POLICY "deals_insert_users_in_transaction" ON public.deals FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.bookings WHERE id = booking_id)
);
CREATE POLICY "deals_update_involved" ON public.deals FOR UPDATE USING (
  auth.uid() = chef_id OR auth.uid() = user_id
);

-- Chats RLS policies
CREATE POLICY "chats_select_involved" ON public.chats FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "chats_insert_own" ON public.chats FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Saved preferences RLS policies
CREATE POLICY "saved_preferences_select_own" ON public.saved_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_preferences_insert_own" ON public.saved_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_preferences_delete_own" ON public.saved_preferences FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_chef_id_idx ON public.bookings(chef_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS proposals_booking_id_idx ON public.proposals(booking_id);
CREATE INDEX IF NOT EXISTS proposals_chef_id_idx ON public.proposals(chef_id);
CREATE INDEX IF NOT EXISTS deals_booking_id_idx ON public.deals(booking_id);
CREATE INDEX IF NOT EXISTS chats_booking_id_idx ON public.chats(booking_id);
CREATE INDEX IF NOT EXISTS chef_details_cuisine_types_idx ON public.chef_details USING GIN(cuisine_types);

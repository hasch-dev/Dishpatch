-- MASTER TABLE (ALL ACCOUNTS)
create table if not exists master (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text check (user_type in ('user', 'chef')),
  email text,
  created_at timestamp default now()
);

-- USER PROFILE (ONLY NORMAL USERS)
create table if not exists user_profile (
  id uuid primary key references master(id) on delete cascade,
  display_name text,
  phone text,
  location_address text,
  created_at timestamp default now()
);

-- CHEF PROFILE (ONLY CHEFS)
create table if not exists chef_profile (
  id uuid primary key references master(id) on delete cascade,
  display_name text,
  bio text,
  location_address text,
  created_at timestamp default now()
);

-- CHEF DETAILS (EXTENDED INFO)
create table if not exists chef_details (
  id uuid primary key references chef_profile(id) on delete cascade,
  cuisine_types text[],
  experience_years int,
  session_rate decimal,
  chef_title text,
  offers_consultation boolean default false,
  consultation_rate decimal,
  created_at timestamp default now()
);

-- BOOKINGS (CREATED BY USERS)
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profile(id) on delete cascade,
  title text,
  event_date date,
  guest_count int,
  budget decimal,
  location_address text,
  status text default 'pending',
  created_at timestamp default now()
);

-- PROPOSALS (CHEFS APPLY TO BOOKINGS)
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  chef_id uuid references chef_profile(id) on delete cascade,
  proposed_price decimal,
  message text,
  status text default 'pending',
  created_at timestamp default now()
);

-- DEALS (WHEN USER ACCEPTS CHEF)
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  chef_id uuid references chef_profile(id) on delete cascade,
  user_id uuid references user_profile(id) on delete cascade,
  agreed_price decimal,
  deposit_paid boolean default false,
  final_paid boolean default false,
  deposit_amount decimal,
  created_at timestamp default now()
);
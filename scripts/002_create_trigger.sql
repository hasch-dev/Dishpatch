-- Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_type,
    display_name,
    email
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'user'),
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
    new.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- If user is a chef, create chef_details
  IF (new.raw_user_meta_data ->> 'user_type' = 'chef') THEN
    INSERT INTO public.chef_details (
      id,
      cuisine_types,
      experience_years
    )
    VALUES (
      new.id,
      COALESCE((new.raw_user_meta_data ->> 'cuisine_types')::TEXT[], '{}'),
      COALESCE((new.raw_user_meta_data ->> 'experience_years')::INTEGER, 0)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- This migration creates profiles for existing users who don't have one yet
-- (useful for users who signed up before the trigger was created)

INSERT INTO public.profiles (id, username, avatar_url, karma_points)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)) as username,
  COALESCE(au.raw_user_meta_data->>'avatar_url', '') as avatar_url,
  0 as karma_points
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Verify the trigger exists and recreate it if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

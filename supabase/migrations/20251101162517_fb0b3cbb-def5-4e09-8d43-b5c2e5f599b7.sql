-- Insert missing profile for existing user
INSERT INTO public.profiles (user_id, name, username)
VALUES (
  'd24176c9-e9db-42b2-849e-8033e6a67416'::uuid,
  'Ananda S Holla',
  'Ash'
)
ON CONFLICT (user_id) DO NOTHING;
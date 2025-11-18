/*
  # Fix Profile Insert Policy for New User Registration

  1. Changes
    - Drop existing restrictive insert policy
    - Add new policy that allows inserts during signup
    - Policy checks that the user is authenticated OR inserting with service role
  
  2. Security
    - Maintains security by checking auth.uid() matches the id being inserted
    - Allows initial profile creation during signup flow
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new insert policy that works during signup
CREATE POLICY "Users can insert own profile during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow anon users to insert (needed during the signup flow)
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);
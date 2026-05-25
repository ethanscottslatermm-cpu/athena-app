-- ─── 1. Add is_admin column ───────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- ─── 2. Grant admin to your account ───────────────────────────────────────────
-- Run this after the column exists. Replace the email if needed.
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'Ethan.scott.slatermm@gmail.com'
  LIMIT 1
);

-- ─── 3. Prevent users from self-elevating via client ──────────────────────────
-- Drop the existing broad update policy if present, then re-add it
-- with a WITH CHECK that locks is_admin to its current value.
-- Adjust the policy name below if yours differs.

-- Option: add a separate restrictive policy
CREATE POLICY "lock_is_admin"
  ON profiles
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

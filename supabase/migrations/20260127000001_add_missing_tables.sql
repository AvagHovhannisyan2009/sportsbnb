-- Add missing tables that the code expects

-- Profiles table (used by chat and other features)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text DEFAULT 'player',
  onboarding_completed boolean DEFAULT false,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  phone text,
  email text,
  city text,
  date_of_birth text,
  gender text,
  preferred_sports text[],
  skill_level text,
  business_name text,
  venue_name text,
  venue_address text,
  sports_offered text[],
  venue_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Profiles public view (for chat)
CREATE OR REPLACE VIEW profiles_public AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  username
FROM profiles
WHERE user_type IN ('player', 'owner');

-- Chat members table
CREATE TABLE IF NOT EXISTS chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now()
);

-- Venue hours/availability slots table
CREATE TABLE IF NOT EXISTS venue_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Venue policies table
CREATE TABLE IF NOT EXISTS venue_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create missing indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_chat_members_room_id ON chat_members(room_id);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX idx_venue_hours_venue_id ON venue_hours(venue_id);
CREATE INDEX idx_venue_policies_venue_id ON venue_policies(venue_id);

-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are visible to everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for chat_members
CREATE POLICY "Members can view their chat rooms" ON chat_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM chat_members WHERE room_id = chat_members.room_id
    )
  );

CREATE POLICY "Users can join chat rooms" ON chat_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for venue_hours
CREATE POLICY "Venue hours are visible to everyone" ON venue_hours
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage their venue hours" ON venue_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM venues WHERE venues.id = venue_hours.venue_id AND venues.owner_id = auth.uid()
    )
  );

-- Create RLS policies for venue_policies
CREATE POLICY "Policies are visible to everyone" ON venue_policies
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage their venue policies" ON venue_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM venues WHERE venues.id = venue_policies.venue_id AND venues.owner_id = auth.uid()
    )
  );

-- Apply triggers to new tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_hours_updated_at BEFORE UPDATE ON venue_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_policies_updated_at BEFORE UPDATE ON venue_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

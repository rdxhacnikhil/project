/*
  # Smart Event Management System Database Schema

  1. New Tables
    - `profiles` - User profiles with additional info
    - `categories` - Event categories
    - `events` - Main events table
    - `tickets` - Event tickets/bookings
    - `notifications` - User notifications
    - `revenue` - Revenue tracking
    - `feedbacks` - Event feedback
    - `questions` - Q&A system
    - `polls` - Poll responses

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Restrict access based on user roles and ownership

  3. Storage
    - Create buckets for event banners and profile pictures
*/

-- Create profiles table extending auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  profile_pic text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
  ('Technology'),
  ('Business'),
  ('Education'),
  ('Entertainment'),
  ('Sports'),
  ('Health'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id),
  custom_category text,
  date_time timestamptz NOT NULL,
  prize_money numeric DEFAULT 0,
  venue text NOT NULL,
  organizer_name text NOT NULL,
  organizer_details text,
  tags text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  website_url text,
  promo_video_url text,
  max_participants integer,
  banner_url text,
  is_registration_required boolean DEFAULT true,
  enable_qa boolean DEFAULT true,
  require_feedback boolean DEFAULT true,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'past', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  booked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('event_created', 'event_updated', 'event_cancelled', 'participant_question', 'system_alert')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create revenue table
CREATE TABLE IF NOT EXISTS revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  message text,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text,
  created_at timestamptz DEFAULT now()
);

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);

-- Events policies
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = user_id);

-- Tickets policies
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can book tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own tickets" ON tickets FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Revenue policies
CREATE POLICY "Anyone can view revenue" ON revenue FOR SELECT USING (true);
CREATE POLICY "Event owners can manage revenue" ON revenue FOR ALL USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = revenue.event_id 
    AND events.user_id = auth.uid()
  )
);

-- Feedbacks policies
CREATE POLICY "Anyone can view feedbacks" ON feedbacks FOR SELECT USING (true);
CREATE POLICY "Users can create own feedback" ON feedbacks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feedback" ON feedbacks FOR UPDATE USING (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Users can create questions" ON questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Event owners can update answers" ON questions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = questions.event_id 
    AND events.user_id = auth.uid()
  ) OR auth.uid() = user_id
);

-- Polls policies
CREATE POLICY "Anyone can view polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Users can create poll responses" ON polls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own poll responses" ON polls FOR UPDATE USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('event-banners', 'event-banners', true),
  ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for event banners
CREATE POLICY "Anyone can view event banners" ON storage.objects FOR SELECT USING (bucket_id = 'event-banners');
CREATE POLICY "Authenticated users can upload event banners" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'event-banners' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own event banners" ON storage.objects FOR UPDATE USING (
  bucket_id = 'event-banners' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own event banners" ON storage.objects FOR DELETE USING (
  bucket_id = 'event-banners' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for profile pictures
CREATE POLICY "Anyone can view profile pictures" ON storage.objects FOR SELECT USING (bucket_id = 'profile-pictures');
CREATE POLICY "Users can upload own profile picture" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update own profile picture" ON storage.objects FOR UPDATE USING (
  bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own profile picture" ON storage.objects FOR DELETE USING (
  bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
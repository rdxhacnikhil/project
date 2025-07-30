import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  name: string;
  email: string;
  profile_pic?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id?: string;
  custom_category?: string;
  date_time: string;
  prize_money: number;
  venue: string;
  organizer_name: string;
  organizer_details?: string;
  tags?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website_url?: string;
  promo_video_url?: string;
  max_participants?: number;
  banner_url?: string;
  is_registration_required: boolean;
  enable_qa: boolean;
  require_feedback: boolean;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  created_at: string;
  updated_at: string;
  categories?: Category;
  profiles?: Profile;
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  booked_at: string;
  events?: Event;
  profiles?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'event_created' | 'event_updated' | 'event_cancelled' | 'participant_question' | 'system_alert';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Revenue {
  id: string;
  event_id: string;
  amount: number;
  description?: string;
  created_at: string;
  events?: Event;
}

export interface Feedback {
  id: string;
  user_id: string;
  event_id: string;
  rating: number;
  message?: string;
  submitted_at: string;
  events?: Event;
  profiles?: Profile;
}

export interface Question {
  id: string;
  user_id: string;
  event_id: string;
  question: string;
  answer?: string;
  created_at: string;
  events?: Event;
  profiles?: Profile;
}
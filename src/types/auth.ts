/** Shared domain types used across auth, contexts, and hooks */

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  avatar_url: string | null;
  university: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  interactions: number;
  hours_active: number;
  rating: number;
  total_ratings: number;
}

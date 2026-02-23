export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          bio: string | null
          birthdate: string
          gender: string
          seeking_gender: string
          location: unknown | null
          location_name: string | null
          min_age: number | null
          max_age: number | null
          max_distance_km: number | null
          is_active: boolean | null
          is_verified: boolean | null
          is_banned: boolean | null
          profile_completed: boolean | null
          total_views: number | null
          total_likes_received: number | null
          view_to_like_ratio: number | null
          last_active_at: string | null
          response_rate: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bio?: string | null
          birthdate: string
          gender: string
          seeking_gender: string
          location?: unknown | null
          location_name?: string | null
          min_age?: number | null
          max_age?: number | null
          max_distance_km?: number | null
          is_active?: boolean | null
          is_verified?: boolean | null
          is_banned?: boolean | null
          profile_completed?: boolean | null
          total_views?: number | null
          total_likes_received?: number | null
          view_to_like_ratio?: number | null
          last_active_at?: string | null
          response_rate?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bio?: string | null
          birthdate?: string
          gender?: string
          seeking_gender?: string
          location?: unknown | null
          location_name?: string | null
          min_age?: number | null
          max_age?: number | null
          max_distance_km?: number | null
          is_active?: boolean | null
          is_verified?: boolean | null
          is_banned?: boolean | null
          profile_completed?: boolean | null
          last_active_at?: string | null
          response_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          id: string
          profile_id: string
          url: string
          storage_path: string
          display_order: number
          moderation_status: string
          moderation_labels: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          url: string
          storage_path: string
          display_order: number
          moderation_status?: string
          moderation_labels?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          url?: string
          storage_path?: string
          display_order?: number
          moderation_status?: string
          moderation_labels?: Json | null
        }
        Relationships: []
      }
      voice_intros: {
        Row: {
          id: string
          profile_id: string
          url: string
          storage_path: string
          duration_seconds: number | null
          moderation_status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          url: string
          storage_path: string
          duration_seconds?: number | null
          moderation_status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          url?: string
          storage_path?: string
          duration_seconds?: number | null
          moderation_status?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          swiped_id: string
          direction: string
          created_at: string
        }
        Insert: {
          id?: string
          swiper_id: string
          swiped_id: string
          direction: string
          created_at?: string
        }
        Update: {
          id?: string
          swiper_id?: string
          swiped_id?: string
          direction?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          profile_a_id: string
          profile_b_id: string
          unmatched_at: string | null
          unmatched_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_a_id: string
          profile_b_id: string
          unmatched_at?: string | null
          unmatched_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_a_id?: string
          profile_b_id?: string
          unmatched_at?: string | null
          unmatched_by?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          match_id: string
          last_message_at: string | null
          last_message_preview: string | null
          expires_at: string | null
          is_expired: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          last_message_at?: string | null
          last_message_preview?: string | null
          expires_at?: string | null
          is_expired?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          expires_at?: string | null
          is_expired?: boolean | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          read_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          read_at?: string | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          reason: string
          details: string | null
          status: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          reason: string
          details?: string | null
          status?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          reason?: string
          details?: string | null
          status?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          profile_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string | null
          tier: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          tier?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          tier?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_swipe_counts: {
        Row: {
          id: string
          profile_id: string
          swipe_date: string | null
          swipe_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          swipe_date?: string | null
          swipe_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          swipe_date?: string | null
          swipe_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type VoiceIntro = Database['public']['Tables']['voice_intros']['Row']
export type Swipe = Database['public']['Tables']['swipes']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Block = Database['public']['Tables']['blocks']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type DailySwipeCount = Database['public']['Tables']['daily_swipe_counts']['Row']

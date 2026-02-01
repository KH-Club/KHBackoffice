export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      camps: {
        Row: {
          id: number
          camp_id: number
          name: string | null
          location: string
          province: string | null
          director: string
          date: string
          img_src: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          camp_id: number
          name?: string | null
          location: string
          province?: string | null
          director: string
          date: string
          img_src?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          camp_id?: number
          name?: string | null
          location?: string
          province?: string | null
          director?: string
          date?: string
          img_src?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: "admin" | "editor" | "viewer"
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: "admin" | "editor" | "viewer"
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "admin" | "editor" | "viewer"
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: number
          title: string
          description: string | null
          event_date: string
          location: string | null
          img_src: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          event_date: string
          location?: string | null
          img_src?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          event_date?: string
          location?: string | null
          img_src?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
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
      user_role: "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Camp = Database["public"]["Tables"]["camps"]["Row"]
export type CampInsert = Database["public"]["Tables"]["camps"]["Insert"]
export type CampUpdate = Database["public"]["Tables"]["camps"]["Update"]

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export type Event = Database["public"]["Tables"]["events"]["Row"]
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"]
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"]

export type UserRole = Database["public"]["Enums"]["user_role"]

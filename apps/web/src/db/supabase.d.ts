export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          created_at: string | null
          document_id: string
          id: number
          name: string
          owner: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: number
          name: string
          owner: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: number
          name?: string
          owner?: string
        }
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

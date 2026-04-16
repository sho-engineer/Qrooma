export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Provider = 'openai' | 'anthropic' | 'google'
export type Side = 'a' | 'b' | 'c' | 'judge'
export type RunStatus = 'queued' | 'running' | 'done' | 'failed'
export type Mode = 'structured_debate' | 'free_talk'

export interface ConclusionCard {
  conclusion: string
  rationale: string
  risks: string[]
  disagreements: string[]
  unknowns: string[]
  next_actions: string[]
}

export interface Database {
  public: {
    Tables: {
      encrypted_api_keys: {
        Row: {
          id: string
          user_id: string
          provider: Provider
          encrypted_key: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: Provider
          encrypted_key: string
          created_at?: string
        }
        Update: {
          encrypted_key?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      room_settings: {
        Row: {
          room_id: string
          mode: Mode
          active_agent_count: 2 | 3
          side_a_provider: Provider
          side_a_model: string
          side_b_provider: Provider
          side_b_model: string
          side_c_provider: Provider
          side_c_model: string
          auto_run_on_user_message: boolean
        }
        Insert: {
          room_id: string
          mode?: Mode
          active_agent_count?: 2 | 3
          side_a_provider?: Provider
          side_a_model?: string
          side_b_provider?: Provider
          side_b_model?: string
          side_c_provider?: Provider
          side_c_model?: string
          auto_run_on_user_message?: boolean
        }
        Update: {
          mode?: Mode
          active_agent_count?: 2 | 3
          side_a_provider?: Provider
          side_a_model?: string
          side_b_provider?: Provider
          side_b_model?: string
          side_c_provider?: Provider
          side_c_model?: string
          auto_run_on_user_message?: boolean
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          room_id: string
          user_id: string | null
          role: 'user' | 'ai'
          side: Side | null
          content: string
          run_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id?: string | null
          role: 'user' | 'ai'
          side?: Side | null
          content: string
          run_id?: string | null
          created_at?: string
        }
        Update: {
          run_id?: string | null
        }
        Relationships: []
      }
      runs: {
        Row: {
          id: string
          room_id: string
          user_id: string
          status: RunStatus
          mode: Mode
          trigger_message_id: string | null
          trigger_run_id: string | null
          error_message: string | null
          conclusion: ConclusionCard | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          status?: RunStatus
          mode: Mode
          trigger_message_id?: string | null
          trigger_run_id?: string | null
          error_message?: string | null
          conclusion?: ConclusionCard | null
          created_at?: string
        }
        Update: {
          status?: RunStatus
          trigger_run_id?: string | null
          error_message?: string | null
          conclusion?: ConclusionCard | null
        }
        Relationships: []
      }
      run_steps: {
        Row: {
          id: string
          run_id: string
          step_type: string
          side: Side | null
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          run_id: string
          step_type: string
          side?: Side | null
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          [key: string]: never
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

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
          username: string | null
          avatar_url: string | null
          bio: string | null
          karma_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          karma_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          karma_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string
          company: string
          description: string | null
          category: string | null
          location: string | null
          job_type: 'remote' | 'hybrid' | 'onsite'
          status: 'active' | 'expired' | 'filled'
          trust_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title: string
          company: string
          description?: string | null
          category?: string | null
          location?: string | null
          job_type?: 'remote' | 'hybrid' | 'onsite'
          status?: 'active' | 'expired' | 'filled'
          trust_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string
          company?: string
          description?: string | null
          category?: string | null
          location?: string | null
          job_type?: 'remote' | 'hybrid' | 'onsite'
          status?: 'active' | 'expired' | 'filled'
          trust_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          job_posting_id: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_posting_id: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_posting_id?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          job_posting_id: string
          parent_comment_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_posting_id: string
          parent_comment_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_posting_id?: string
          parent_comment_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      comment_votes: {
        Row: {
          id: string
          user_id: string
          comment_id: string
          vote_type: 'helpful' | 'not_helpful'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comment_id: string
          vote_type: 'helpful' | 'not_helpful'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comment_id?: string
          vote_type?: 'helpful' | 'not_helpful'
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          user_id: string
          job_posting_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          job_posting_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          job_posting_id?: string
          created_at?: string
        }
      }
    }
  }
}

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
      applications: {
        Row: {
          applied_date: string
          employer_id: string | null
          id: string
          job_id: string
          status: string
          user_id: string
        }
        Insert: {
          applied_date?: string
          employer_id?: string | null
          id?: string
          job_id: string
          status?: string
          user_id: string
        }
        Update: {
          applied_date?: string
          employer_id?: string | null
          id?: string
          job_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_applications_employer_id"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_applications_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_applications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_log: {
        Row: {
          action: string
          created_at: string
          id: string
          job_id: string
          new_status: string | null
          notes: string | null
          performed_at: string
          performed_by: string
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          job_id: string
          new_status?: string | null
          notes?: string | null
          performed_at?: string
          performed_by: string
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          job_id?: string
          new_status?: string | null
          notes?: string | null
          performed_at?: string
          performed_by?: string
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      candidate_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      candidate_resumes: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_size: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          founded_year: number | null
          id: string
          industry: string | null
          linkedin_url: string | null
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          status: string
          twitter_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          status?: string
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: string
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          candidate_id: string
          employer_id: string
          id: string
          last_message: string | null
          last_message_at: string
          unread_count: number
        }
        Insert: {
          candidate_id: string
          employer_id: string
          id?: string
          last_message?: string | null
          last_message_at?: string
          unread_count?: number
        }
        Update: {
          candidate_id?: string
          employer_id?: string
          id?: string
          last_message?: string | null
          last_message_at?: string
          unread_count?: number
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_deadline: string | null
          application_type: string
          application_value: string | null
          applications: number | null
          approval_date: string | null
          approved_by: string | null
          company: string
          company_size: string | null
          created_at: string | null
          description: string
          employer_id: string | null
          employment_type: string
          experience_level: string
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          last_reviewed_at: string | null
          location: string
          logo: string | null
          rejected_by: string | null
          rejection_date: string | null
          rejection_reason: string | null
          remote: boolean | null
          requirements: string[]
          review_notes: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          status: string
          tech_stack: string[]
          title: string
          updated_at: string | null
          views: number | null
          visa_sponsorship: boolean | null
        }
        Insert: {
          application_deadline?: string | null
          application_type?: string
          application_value?: string | null
          applications?: number | null
          approval_date?: string | null
          approved_by?: string | null
          company: string
          company_size?: string | null
          created_at?: string | null
          description: string
          employer_id?: string | null
          employment_type: string
          experience_level: string
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          last_reviewed_at?: string | null
          location: string
          logo?: string | null
          rejected_by?: string | null
          rejection_date?: string | null
          rejection_reason?: string | null
          remote?: boolean | null
          requirements?: string[]
          review_notes?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          tech_stack?: string[]
          title: string
          updated_at?: string | null
          views?: number | null
          visa_sponsorship?: boolean | null
        }
        Update: {
          application_deadline?: string | null
          application_type?: string
          application_value?: string | null
          applications?: number | null
          approval_date?: string | null
          approved_by?: string | null
          company?: string
          company_size?: string | null
          created_at?: string | null
          description?: string
          employer_id?: string | null
          employment_type?: string
          experience_level?: string
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          last_reviewed_at?: string | null
          location?: string
          logo?: string | null
          rejected_by?: string | null
          rejection_date?: string | null
          rejection_reason?: string | null
          remote?: boolean | null
          requirements?: string[]
          review_notes?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          tech_stack?: string[]
          title?: string
          updated_at?: string | null
          views?: number | null
          visa_sponsorship?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_jobs_employer_id"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
          sent_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
          sent_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          category_id: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          reading_time: number | null
          slug: string | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          reading_time?: number | null
          slug?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          reading_time?: number | null
          slug?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          profile_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          profile_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string
          saved_date: string
          user_id: string
        }
        Insert: {
          id?: string
          job_id: string
          saved_date?: string
          user_id: string
        }
        Update: {
          id?: string
          job_id?: string
          saved_date?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          status: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_amount: number | null
          subscription_currency: string | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_amount?: number | null
          subscription_currency?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_amount?: number | null
          subscription_currency?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_approve_job: {
        Args: {
          job_id: string
          approval_reason?: string
          review_notes?: string
        }
        Returns: boolean
      }
      admin_batch_approve_jobs: {
        Args: { job_ids: string[]; approval_reason?: string }
        Returns: {
          job_id: string
          success: boolean
          error_message: string
        }[]
      }
      admin_create_company: {
        Args: {
          company_name: string
          company_description?: string
          company_industry?: string
          company_website?: string
          company_logo_url?: string
          company_location?: string
          company_size?: string
          company_founded_year?: number
          company_email?: string
          company_phone?: string
          company_linkedin_url?: string
          company_twitter_url?: string
        }
        Returns: string
      }
      admin_create_job: {
        Args: {
          job_title: string
          job_company: string
          job_location: string
          job_description: string
          job_requirements: string[]
          job_employment_type: string
          job_experience_level: string
          job_salary_min?: number
          job_salary_max?: number
          job_salary_currency?: string
          job_tech_stack?: string[]
          job_visa_sponsorship?: boolean
          job_remote?: boolean
          job_company_size?: string
          job_application_deadline?: string
          job_logo?: string
          job_status?: string
          job_application_type?: string
          job_application_value?: string
          job_employer_id?: string
        }
        Returns: string
      }
      admin_create_user: {
        Args: {
          user_email: string
          user_password: string
          user_full_name?: string
          user_username?: string
          user_role?: string
        }
        Returns: string
      }
      admin_delete_company: {
        Args: { company_id: string }
        Returns: boolean
      }
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      admin_get_job: {
        Args: { job_id: string }
        Returns: {
          id: string
          title: string
          company: string
          location: string
          description: string
          requirements: string[]
          salary_min: number
          salary_max: number
          salary_currency: string
          employment_type: string
          experience_level: string
          tech_stack: string[]
          visa_sponsorship: boolean
          remote: boolean
          company_size: string
          application_deadline: string
          logo: string
          status: string
          application_type: string
          application_value: string
          employer_id: string
          created_at: string
          updated_at: string
        }[]
      }
      admin_get_job_approval_history: {
        Args: { job_id: string }
        Returns: {
          id: string
          action: string
          performed_by: string
          performed_at: string
          reason: string
          previous_status: string
          new_status: string
          notes: string
          performer_name: string
        }[]
      }
      admin_reject_job: {
        Args: {
          job_id: string
          rejection_reason: string
          review_notes?: string
        }
        Returns: boolean
      }
      admin_update_company: {
        Args: {
          company_id: string
          company_name: string
          company_description?: string
          company_industry?: string
          company_website?: string
          company_logo_url?: string
          company_location?: string
          company_size?: string
          company_founded_year?: number
          company_email?: string
          company_phone?: string
          company_linkedin_url?: string
          company_twitter_url?: string
          company_status?: string
        }
        Returns: boolean
      }
      admin_update_job: {
        Args: {
          job_id: string
          job_title: string
          job_company: string
          job_location: string
          job_description: string
          job_requirements: string[]
          job_employment_type: string
          job_experience_level: string
          job_salary_min?: number
          job_salary_max?: number
          job_salary_currency?: string
          job_tech_stack?: string[]
          job_visa_sponsorship?: boolean
          job_remote?: boolean
          job_company_size?: string
          job_application_deadline?: string
          job_logo?: string
          job_status?: string
          job_application_type?: string
          job_application_value?: string
        }
        Returns: boolean
      }
      admin_update_job_status: {
        Args: { job_id: string; new_status: string }
        Returns: boolean
      }
      admin_update_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: boolean
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_admin_companies: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          industry: string
          website: string
          logo_url: string
          location: string
          company_size: string
          founded_year: number
          email: string
          phone: string
          linkedin_url: string
          twitter_url: string
          status: string
          created_at: string
          updated_at: string
          created_by: string
        }[]
      }
      get_admin_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          company: string
          location: string
          created_at: string
          status: string
          applications: number
          description: string
          requirements: string[]
          salary_min: number
          salary_max: number
          employment_type: string
          experience_level: string
          tech_stack: string[]
          employer_id: string
          is_featured: boolean
          views: number
        }[]
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string
          role: string
          status: string
          created_at: string
          last_sign_in_at: string
        }[]
      }
      get_current_user_auth_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          is_authenticated: boolean
          is_admin: boolean
          email: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_details: {
        Args: { user_id: string }
        Returns: {
          id: string
          email: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employer" | "candidate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "employer", "candidate"],
    },
  },
} as const

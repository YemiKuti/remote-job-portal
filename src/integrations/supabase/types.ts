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
          location: string
          logo: string | null
          remote: boolean | null
          requirements: string[]
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
          location: string
          logo?: string | null
          remote?: boolean | null
          requirements?: string[]
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
          location?: string
          logo?: string | null
          remote?: boolean | null
          requirements?: string[]
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
        Relationships: []
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
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
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
      admin_delete_company: {
        Args: { company_id: string }
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
      admin_update_job_status: {
        Args: { job_id: string; new_status: string }
        Returns: boolean
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

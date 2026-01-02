export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      affiliate_sales: {
        Row: {
          affiliate_id: string
          commission_value: number | null
          created_at: string
          customer_info: Json | null
          id: string
          order_value: number
          products_sold: Json | null
          store_id: string | null
        }
        Insert: {
          affiliate_id: string
          commission_value?: number | null
          created_at?: string
          customer_info?: Json | null
          id?: string
          order_value: number
          products_sold?: Json | null
          store_id?: string | null
        }
        Update: {
          affiliate_id?: string
          commission_value?: number | null
          created_at?: string
          customer_info?: Json | null
          id?: string
          order_value?: number
          products_sold?: Json | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_sales_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          active: boolean
          code: string
          commission_rate: number | null
          created_at: string
          email: string | null
          id: string
          name: string
          points: number
          sales_count: number
          store_id: string | null
          total_sales: number
          updated_at: string
          user_id: string | null
          valedoce_balance: number | null
        }
        Insert: {
          active?: boolean
          code: string
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          points?: number
          sales_count?: number
          store_id?: string | null
          total_sales?: number
          updated_at?: string
          user_id?: string | null
          valedoce_balance?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          points?: number
          sales_count?: number
          store_id?: string | null
          total_sales?: number
          updated_at?: string
          user_id?: string | null
          valedoce_balance?: number | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean | null
          content: string
          created_at: string | null
          id: string
          order: number | null
          store_id: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          order?: number | null
          store_id?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          order?: number | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          description: string | null
          discount_type: string
          discount_value: number
          expiry_date: string | null
          id: string
          min_order_value: number | null
          store_id: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          description?: string | null
          discount_type: string
          discount_value: number
          expiry_date?: string | null
          id?: string
          min_order_value?: number | null
          store_id?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expiry_date?: string | null
          id?: string
          min_order_value?: number | null
          store_id?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          affiliate_code: string | null
          affiliate_id: string | null
          change_amount: string | null
          complement: string | null
          coupon_code: string | null
          created_at: string | null
          custom_cake_details: Json | null
          customer_cpf: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_fee: number | null
          delivery_method: string
          discount_amount: number | null
          district: string | null
          id: string
          items: Json
          latitude: number | null
          longitude: number | null
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          need_change: boolean | null
          order_code: string
          payment_method: string
          payment_status: string | null
          pix_expires_at: string | null
          pix_qr_code: string | null
          pix_qr_code_base64: string | null
          reference: string | null
          store_id: string | null
          subtotal: number
          total: number
          transaction_details: Json | null
          updated_at: string | null
          valedoce_discount: number | null
        }
        Insert: {
          address?: string | null
          affiliate_code?: string | null
          affiliate_id?: string | null
          change_amount?: string | null
          complement?: string | null
          coupon_code?: string | null
          created_at?: string | null
          custom_cake_details?: Json | null
          customer_cpf?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_fee?: number | null
          delivery_method: string
          discount_amount?: number | null
          district?: string | null
          id?: string
          items: Json
          latitude?: number | null
          longitude?: number | null
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          need_change?: boolean | null
          order_code: string
          payment_method: string
          payment_status?: string | null
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          reference?: string | null
          store_id?: string | null
          subtotal: number
          total: number
          transaction_details?: Json | null
          updated_at?: string | null
          valedoce_discount?: number | null
        }
        Update: {
          address?: string | null
          affiliate_code?: string | null
          affiliate_id?: string | null
          change_amount?: string | null
          complement?: string | null
          coupon_code?: string | null
          created_at?: string | null
          custom_cake_details?: Json | null
          customer_cpf?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number | null
          delivery_method?: string
          discount_amount?: number | null
          district?: string | null
          id?: string
          items?: Json
          latitude?: number | null
          longitude?: number | null
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          need_change?: boolean | null
          order_code?: string
          payment_method?: string
          payment_status?: string | null
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          reference?: string | null
          store_id?: string | null
          subtotal?: number
          total?: number
          transaction_details?: Json | null
          updated_at?: string | null
          valedoce_discount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          max_purchase_quantity: number | null
          name: string
          price: number
          search_vector: unknown
          stock: number | null
          store_id: string | null
          updated_at: string | null
          valedoce_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          max_purchase_quantity?: number | null
          name: string
          price: number
          search_vector?: unknown
          stock?: number | null
          store_id?: string | null
          updated_at?: string | null
          valedoce_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          max_purchase_quantity?: number | null
          name?: string
          price?: number
          search_vector?: unknown
          stock?: number | null
          store_id?: string | null
          updated_at?: string | null
          valedoce_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_hours: {
        Row: {
          close_time: string
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string
          store_id: string | null
          updated_at: string
        }
        Insert: {
          close_time: string
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time: string
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          close_time?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_hours_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address: string | null
          always_open: boolean | null
          banner_rotation_interval: number | null
          custom_cake_message: string | null
          delivery_fee: number | null
          footer_message: string | null
          free_delivery_banners: Json | null
          free_delivery_fallback_bg_color: string | null
          free_delivery_fallback_enabled: boolean | null
          free_delivery_fallback_text_color: string | null
          free_delivery_message: string | null
          free_delivery_threshold: number | null
          id: string
          logo_url: string | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          show_free_delivery_banner: boolean | null
          social_media: Json | null
          store_closed_message: string | null
          store_id: string | null
          store_name: string
          welcome_message: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          always_open?: boolean | null
          banner_rotation_interval?: number | null
          custom_cake_message?: string | null
          delivery_fee?: number | null
          footer_message?: string | null
          free_delivery_banners?: Json | null
          free_delivery_fallback_bg_color?: string | null
          free_delivery_fallback_enabled?: boolean | null
          free_delivery_fallback_text_color?: string | null
          free_delivery_message?: string | null
          free_delivery_threshold?: number | null
          id?: string
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          show_free_delivery_banner?: boolean | null
          social_media?: Json | null
          store_closed_message?: string | null
          store_id?: string | null
          store_name: string
          welcome_message?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          always_open?: boolean | null
          banner_rotation_interval?: number | null
          custom_cake_message?: string | null
          delivery_fee?: number | null
          footer_message?: string | null
          free_delivery_banners?: Json | null
          free_delivery_fallback_bg_color?: string | null
          free_delivery_fallback_enabled?: boolean | null
          free_delivery_fallback_text_color?: string | null
          free_delivery_message?: string | null
          free_delivery_threshold?: number | null
          id?: string
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          show_free_delivery_banner?: boolean | null
          social_media?: Json | null
          store_closed_message?: string | null
          store_id?: string | null
          store_name?: string
          welcome_message?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_users: {
        Row: {
          created_at: string
          id: string
          role: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_users_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          store_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          store_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          store_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      valedoce_settings: {
        Row: {
          created_at: string | null
          default_reward: number | null
          email_notifications: boolean | null
          id: string
          store_id: string | null
          updated_at: string | null
          valedoce_value: number | null
        }
        Insert: {
          created_at?: string | null
          default_reward?: number | null
          email_notifications?: boolean | null
          id?: string
          store_id?: string | null
          updated_at?: string | null
          valedoce_value?: number | null
        }
        Update: {
          created_at?: string | null
          default_reward?: number | null
          email_notifications?: boolean | null
          id?: string
          store_id?: string | null
          updated_at?: string | null
          valedoce_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valedoce_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      valedoce_transactions: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          product_id: string | null
          type: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          type: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "valedoce_transactions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valedoce_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_code: { Args: never; Returns: string }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_store_access: { Args: { _store_id: string }; Returns: boolean }
      is_store_owner: { Args: { _store_id: string }; Returns: boolean }
      search_products: {
        Args: {
          category_filter?: string
          featured_only?: boolean
          limit_count?: number
          offset_count?: number
          search_term?: string
        }
        Returns: {
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          image_url: string
          max_purchase_quantity: number
          name: string
          price: number
          search_rank: number
          stock: number
          updated_at: string
        }[]
      }
      user_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      store_role: "owner" | "manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
      store_role: ["owner", "manager", "employee"],
    },
  },
} as const

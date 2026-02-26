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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          key_type: string
          key_value: string
          last_used_at: string | null
          name: string
          updated_at: string | null
          usage_count: number | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key_type: string
          key_value: string
          last_used_at?: string | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key_type?: string
          key_value?: string
          last_used_at?: string | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_memory: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          memory_key: string
          memory_value: Json
          updated_at: string | null
          workflow_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          memory_key: string
          memory_value: Json
          updated_at?: string | null
          workflow_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          memory_key?: string
          memory_value?: Json
          updated_at?: string | null
          workflow_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          categories: number[] | null
          content: string | null
          created_at: string | null
          date: string | null
          excerpt: string | null
          featured_image: string | null
          featured_image_local: string | null
          featured_media: number | null
          format: string | null
          id: number
          link: string | null
          modified: string | null
          seo_meta: Json | null
          slug: string
          status: string | null
          sticky: boolean | null
          tags: number[] | null
          title: string
          type: string | null
          updated_at: string | null
          wp_id: number | null
        }
        Insert: {
          author?: string | null
          categories?: number[] | null
          content?: string | null
          created_at?: string | null
          date?: string | null
          excerpt?: string | null
          featured_image?: string | null
          featured_image_local?: string | null
          featured_media?: number | null
          format?: string | null
          id?: number
          link?: string | null
          modified?: string | null
          seo_meta?: Json | null
          slug: string
          status?: string | null
          sticky?: boolean | null
          tags?: number[] | null
          title: string
          type?: string | null
          updated_at?: string | null
          wp_id?: number | null
        }
        Update: {
          author?: string | null
          categories?: number[] | null
          content?: string | null
          created_at?: string | null
          date?: string | null
          excerpt?: string | null
          featured_image?: string | null
          featured_image_local?: string | null
          featured_media?: number | null
          format?: string | null
          id?: number
          link?: string | null
          modified?: string | null
          seo_meta?: Json | null
          slug?: string
          status?: string | null
          sticky?: boolean | null
          tags?: number[] | null
          title?: string
          type?: string | null
          updated_at?: string | null
          wp_id?: number | null
        }
        Relationships: []
      }
      cron_jobs: {
        Row: {
          created_at: string | null
          error_message: string | null
          execution_status: string | null
          id: string
          job_type: string
          last_run: string | null
          name: string | null
          next_run: string | null
          property_id: string | null
          settings: Json | null
          site_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          execution_status?: string | null
          id?: string
          job_type: string
          last_run?: string | null
          name?: string | null
          next_run?: string | null
          property_id?: string | null
          settings?: Json | null
          site_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          execution_status?: string | null
          id?: string
          job_type?: string
          last_run?: string | null
          name?: string | null
          next_run?: string | null
          property_id?: string | null
          settings?: Json | null
          site_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cron_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          plain_content: string | null
          subject: string
          template_type: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          plain_content?: string | null
          subject: string
          template_type?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          plain_content?: string | null
          subject?: string
          template_type?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_visibility: {
        Row: {
          created_at: string | null
          feature_id: string
          id: string
          is_visible: boolean | null
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          feature_id: string
          id?: string
          is_visible?: boolean | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          feature_id?: string
          id?: string
          is_visible?: boolean | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_visibility_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          article_type: string | null
          blog_post_url: string | null
          content: string | null
          created_at: string | null
          featured_image_url: string | null
          generation_settings: Json | null
          id: string
          language: string | null
          main_keyword: string | null
          published: boolean | null
          published_to_blog: boolean | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          article_type?: string | null
          blog_post_url?: string | null
          content?: string | null
          created_at?: string | null
          featured_image_url?: string | null
          generation_settings?: Json | null
          id?: string
          language?: string | null
          main_keyword?: string | null
          published?: boolean | null
          published_to_blog?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          article_type?: string | null
          blog_post_url?: string | null
          content?: string | null
          created_at?: string | null
          featured_image_url?: string | null
          generation_settings?: Json | null
          id?: string
          language?: string | null
          main_keyword?: string | null
          published?: boolean | null
          published_to_blog?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      pack_prices: {
        Row: {
          id: number
          in_stock: boolean | null
          is_active: boolean | null
          last_updated: string | null
          pack_price: number
          pack_size: number
          price_per_pouch: number
          product_id: number
          shipping_cost: number | null
          vendor_name: string
          vendor_url: string | null
        }
        Insert: {
          id?: number
          in_stock?: boolean | null
          is_active?: boolean | null
          last_updated?: string | null
          pack_price: number
          pack_size: number
          price_per_pouch: number
          product_id: number
          shipping_cost?: number | null
          vendor_name: string
          vendor_url?: string | null
        }
        Update: {
          id?: number
          in_stock?: boolean | null
          is_active?: boolean | null
          last_updated?: string | null
          pack_price?: number
          pack_size?: number
          price_per_pouch?: number
          product_id?: number
          shipping_cost?: number | null
          vendor_name?: string
          vendor_url?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string
          permission_name: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_name: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_name?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          current_pack_price: number | null
          id: number
          is_active: boolean | null
          min_price_reduction: number | null
          pack_price: number | null
          pack_size: number | null
          price_drop_threshold: number | null
          product_id: number
          target_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          current_pack_price?: number | null
          id?: number
          is_active?: boolean | null
          min_price_reduction?: number | null
          pack_price?: number | null
          pack_size?: number | null
          price_drop_threshold?: number | null
          product_id: number
          target_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          current_pack_price?: number | null
          id?: number
          is_active?: boolean | null
          min_price_reduction?: number | null
          pack_price?: number | null
          pack_size?: number | null
          price_drop_threshold?: number | null
          product_id?: number
          target_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_vendor_prices: {
        Row: {
          buy_url: string | null
          created_at: string | null
          id: number
          in_stock: boolean | null
          price: number
          product_id: number | null
          shipping_cost: number | null
          updated_at: string | null
          vendor_id: number | null
        }
        Insert: {
          buy_url?: string | null
          created_at?: string | null
          id?: number
          in_stock?: boolean | null
          price: number
          product_id?: number | null
          shipping_cost?: number | null
          updated_at?: string | null
          vendor_id?: number | null
        }
        Update: {
          buy_url?: string | null
          created_at?: string | null
          id?: number
          in_stock?: boolean | null
          price?: number
          product_id?: number | null
          shipping_cost?: number | null
          updated_at?: string | null
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_vendor_prices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      products_us: {
        Row: {
          brand: string
          created_at: string | null
          description: string | null
          flavour: string | null
          format: string | null
          id: number
          image_url: string | null
          name: string
          page_url: string | null
          price: number | null
          strength_group: string | null
          updated_at: string | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          description?: string | null
          flavour?: string | null
          format?: string | null
          id?: number
          image_url?: string | null
          name: string
          page_url?: string | null
          price?: number | null
          strength_group?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          description?: string | null
          flavour?: string | null
          format?: string | null
          id?: number
          image_url?: string | null
          name?: string
          page_url?: string | null
          price?: number | null
          strength_group?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          is_approved: boolean | null
          product_id: number
          rating: number
          review_text: string
          updated_at: string | null
          user_id: string
          vendor_id: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          product_id: number
          rating: number
          review_text: string
          updated_at?: string | null
          user_id: string
          vendor_id: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          product_id?: number
          rating?: number
          review_text?: string
          updated_at?: string | null
          user_id?: string
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_comments: {
        Row: {
          commenter_email: string
          commenter_name: string
          content: string
          created_at: string | null
          id: string
          reply_to: string | null
          salary_id: string
          share_id: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          commenter_email: string
          commenter_name: string
          content: string
          created_at?: string | null
          id?: string
          reply_to?: string | null
          salary_id: string
          share_id: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          commenter_email?: string
          commenter_name?: string
          content?: string
          created_at?: string | null
          id?: string
          reply_to?: string | null
          salary_id?: string
          share_id?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_comments_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "salary_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      shareholders: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          percentage: number
          updated_at: string | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          percentage: number
          updated_at?: string | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          percentage?: number
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      signups: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          source: string | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_media_accounts: {
        Row: {
          access_token: string | null
          access_token_secret: string | null
          account_id: string | null
          account_name: string
          api_key: string | null
          api_secret: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_connected: boolean | null
          last_posted_at: string | null
          metadata: Json | null
          platform: string
          refresh_token: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          access_token?: string | null
          access_token_secret?: string | null
          account_id?: string | null
          account_name: string
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_connected?: boolean | null
          last_posted_at?: string | null
          metadata?: Json | null
          platform: string
          refresh_token?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          access_token?: string | null
          access_token_secret?: string | null
          account_id?: string | null
          account_name?: string
          api_key?: string | null
          api_secret?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_connected?: boolean | null
          last_posted_at?: string | null
          metadata?: Json | null
          platform?: string
          refresh_token?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_posts: {
        Row: {
          account_id: string
          content: string
          content_type: string
          created_at: string | null
          error_message: string | null
          id: string
          media_urls: string[] | null
          metadata: Json | null
          platform: string
          post_id: string | null
          post_url: string | null
          posted_at: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          content: string
          content_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform: string
          post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          content?: string
          content_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform?: string
          post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_media_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          is_master_admin: boolean | null
          permissions: Json | null
          role: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          is_master_admin?: boolean | null
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          is_master_admin?: boolean | null
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      trustpilot_reviews: {
        Row: {
          created_at: string | null
          customer_name: string
          has_reply: boolean | null
          headline: string | null
          id: string
          rating: number
          reply_date: string | null
          reply_text: string | null
          reply_title: string | null
          review_date: string | null
          review_text: string
          review_url: string
          updated_at: string | null
          vendor_id: number
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          has_reply?: boolean | null
          headline?: string | null
          id?: string
          rating: number
          reply_date?: string | null
          reply_text?: string | null
          reply_title?: string | null
          review_date?: string | null
          review_text: string
          review_url: string
          updated_at?: string | null
          vendor_id: number
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          has_reply?: boolean | null
          headline?: string | null
          id?: string
          rating?: number
          reply_date?: string | null
          reply_text?: string | null
          reply_title?: string | null
          review_date?: string | null
          review_text?: string
          review_url?: string
          updated_at?: string | null
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "trustpilot_reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      unmapped_products: {
        Row: {
          created_at: string | null
          id: number
          image_url: string | null
          mapped_product_id: number | null
          other_stores: Json | null
          product_name: string
          source_prices: Json | null
          source_url: string | null
          source_vendor: string
          source_vendor_id: number | null
          status: string | null
          total_stores: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          image_url?: string | null
          mapped_product_id?: number | null
          other_stores?: Json | null
          product_name: string
          source_prices?: Json | null
          source_url?: string | null
          source_vendor: string
          source_vendor_id?: number | null
          status?: string | null
          total_stores?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          image_url?: string | null
          mapped_product_id?: number | null
          other_stores?: Json | null
          product_name?: string
          source_prices?: Json | null
          source_url?: string | null
          source_vendor?: string
          source_vendor_id?: number | null
          status?: string | null
          total_stores?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unmapped_products_mapped_product_id_fkey"
            columns: ["mapped_product_id"]
            isOneToOne: false
            referencedRelation: "wp_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unmapped_products_source_vendor_id_fkey"
            columns: ["source_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      us_products: {
        Row: {
          brand: string | null
          created_at: string | null
          description: string | null
          flavour: string | null
          format: string | null
          id: number
          image_url: string | null
          nicotine_mg_pouch: number | null
          page_url: string | null
          product_title: string | null
          quantity: number | null
          short_description: string | null
          strength: string | null
          td_element: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          flavour?: string | null
          format?: string | null
          id?: number
          image_url?: string | null
          nicotine_mg_pouch?: number | null
          page_url?: string | null
          product_title?: string | null
          quantity?: number | null
          short_description?: string | null
          strength?: string | null
          td_element?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          flavour?: string | null
          format?: string | null
          id?: number
          image_url?: string | null
          nicotine_mg_pouch?: number | null
          page_url?: string | null
          product_title?: string | null
          quantity?: number | null
          short_description?: string | null
          strength?: string | null
          td_element?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      us_vendor_product_mapping: {
        Row: {
          created_at: string | null
          id: string
          product_id: number
          updated_at: string | null
          us_vendor_id: string
          vendor_product: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: number
          updated_at?: string | null
          us_vendor_id: string
          vendor_product: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: number
          updated_at?: string | null
          us_vendor_id?: string
          vendor_product?: string
        }
        Relationships: [
          {
            foreignKeyName: "us_vendor_product_mapping_us_vendor_id_fkey"
            columns: ["us_vendor_id"]
            isOneToOne: false
            referencedRelation: "us_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      us_vendor_products: {
        Row: {
          created_at: string | null
          id: string
          price_10pack: number | null
          price_1pack: number | null
          price_20pack: number | null
          price_25pack: number | null
          price_30pack: number | null
          price_3pack: number | null
          price_50pack: number | null
          price_5pack: number | null
          product_url: string | null
          stock_status: string | null
          updated_at: string | null
          us_product_id: number
          us_vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_10pack?: number | null
          price_1pack?: number | null
          price_20pack?: number | null
          price_25pack?: number | null
          price_30pack?: number | null
          price_3pack?: number | null
          price_50pack?: number | null
          price_5pack?: number | null
          product_url?: string | null
          stock_status?: string | null
          updated_at?: string | null
          us_product_id: number
          us_vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price_10pack?: number | null
          price_1pack?: number | null
          price_20pack?: number | null
          price_25pack?: number | null
          price_30pack?: number | null
          price_3pack?: number | null
          price_50pack?: number | null
          price_5pack?: number | null
          product_url?: string | null
          stock_status?: string | null
          updated_at?: string | null
          us_product_id?: number
          us_vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "us_vendor_products_us_product_id_fkey"
            columns: ["us_product_id"]
            isOneToOne: false
            referencedRelation: "us_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "us_vendor_products_us_vendor_id_fkey"
            columns: ["us_vendor_id"]
            isOneToOne: false
            referencedRelation: "us_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      us_vendor_products_new: {
        Row: {
          brand: string | null
          created_at: string | null
          id: number
          name: string
          price_10pack: number | null
          price_1pack: number | null
          price_20pack: number | null
          price_25pack: number | null
          price_30pack: number | null
          price_3pack: number | null
          price_50pack: number | null
          price_5pack: number | null
          stock_status: string | null
          updated_at: string | null
          url: string | null
          us_vendor_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          id?: number
          name: string
          price_10pack?: number | null
          price_1pack?: number | null
          price_20pack?: number | null
          price_25pack?: number | null
          price_30pack?: number | null
          price_3pack?: number | null
          price_50pack?: number | null
          price_5pack?: number | null
          stock_status?: string | null
          updated_at?: string | null
          url?: string | null
          us_vendor_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          id?: number
          name?: string
          price_10pack?: number | null
          price_1pack?: number | null
          price_20pack?: number | null
          price_25pack?: number | null
          price_30pack?: number | null
          price_3pack?: number | null
          price_50pack?: number | null
          price_5pack?: number | null
          stock_status?: string | null
          updated_at?: string | null
          url?: string | null
          us_vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "us_vendor_products_new_us_vendor_id_fkey"
            columns: ["us_vendor_id"]
            isOneToOne: false
            referencedRelation: "us_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      us_vendors: {
        Row: {
          api_endpoint: string | null
          created_at: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          id: string
          price: number
          product_id: string
          product_image: string | null
          product_name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          price: number
          product_id: string
          product_image?: string | null
          product_name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          price?: number
          product_id?: string
          product_image?: string | null
          product_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_filter_preferences: {
        Row: {
          created_at: string | null
          id: string
          pack_size: string | null
          price_sort: string | null
          review_sort: string | null
          shipping_filter: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pack_size?: string | null
          price_sort?: string | null
          review_sort?: string | null
          shipping_filter?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pack_size?: string | null
          price_sort?: string | null
          review_sort?: string | null
          shipping_filter?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_workspaces: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          role: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_analytics: {
        Row: {
          event_data: Json | null
          event_type: string
          id: number
          product_id: number | null
          product_name: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_ip: string | null
          vendor_id: number | null
          vendor_name: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: never
          product_id?: number | null
          product_name?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_ip?: string | null
          vendor_id?: number | null
          vendor_name?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: never
          product_id?: number | null
          product_name?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_ip?: string | null
          vendor_id?: number | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      vendor_product_mapping: {
        Row: {
          created_at: string | null
          id: string
          product_id: number
          updated_at: string | null
          vendor_id: number
          vendor_product: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: number
          updated_at?: string | null
          vendor_id: number
          vendor_product: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: number
          updated_at?: string | null
          vendor_id?: number
          vendor_product?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_product_mapping_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          price_100pack: string | null
          price_10pack: string | null
          price_15pack: string | null
          price_1pack: string | null
          price_20pack: string | null
          price_25pack: string | null
          price_30pack: string | null
          price_3pack: string | null
          price_50pack: string | null
          price_5pack: string | null
          stock_quantity: number | null
          stock_status: string | null
          updated_at: string | null
          url: string | null
          vendor_id: number
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price_100pack?: string | null
          price_10pack?: string | null
          price_15pack?: string | null
          price_1pack?: string | null
          price_20pack?: string | null
          price_25pack?: string | null
          price_30pack?: string | null
          price_3pack?: string | null
          price_50pack?: string | null
          price_5pack?: string | null
          stock_quantity?: number | null
          stock_status?: string | null
          updated_at?: string | null
          url?: string | null
          vendor_id: number
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price_100pack?: string | null
          price_10pack?: string | null
          price_15pack?: string | null
          price_1pack?: string | null
          price_20pack?: string | null
          price_25pack?: string | null
          price_30pack?: string | null
          price_3pack?: string | null
          price_50pack?: string | null
          price_5pack?: string | null
          stock_quantity?: number | null
          stock_status?: string | null
          updated_at?: string | null
          url?: string | null
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          currency: string | null
          cutoff_time: string | null
          delivery_speed: string | null
          description: string | null
          free_shipping_threshold: number | null
          id: number
          is_active: boolean | null
          logo_url: string | null
          name: string
          needs_currency_conversion: boolean | null
          offer_description: string | null
          offer_type: string | null
          offer_value: number | null
          rating: number | null
          review_count: number | null
          same_day_available: boolean | null
          same_day_location: string | null
          shipping_cost: number | null
          shipping_info: string | null
          shipping_methods: string | null
          trustpilot_score: number | null
          trustpilot_url: string | null
          updated_at: string | null
          website: string | null
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          cutoff_time?: string | null
          delivery_speed?: string | null
          description?: string | null
          free_shipping_threshold?: number | null
          id?: number
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          needs_currency_conversion?: boolean | null
          offer_description?: string | null
          offer_type?: string | null
          offer_value?: number | null
          rating?: number | null
          review_count?: number | null
          same_day_available?: boolean | null
          same_day_location?: string | null
          shipping_cost?: number | null
          shipping_info?: string | null
          shipping_methods?: string | null
          trustpilot_score?: number | null
          trustpilot_url?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          cutoff_time?: string | null
          delivery_speed?: string | null
          description?: string | null
          free_shipping_threshold?: number | null
          id?: number
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          needs_currency_conversion?: boolean | null
          offer_description?: string | null
          offer_type?: string | null
          offer_value?: number | null
          rating?: number | null
          review_count?: number | null
          same_day_available?: boolean | null
          same_day_location?: string | null
          shipping_cost?: number | null
          shipping_info?: string | null
          shipping_methods?: string | null
          trustpilot_score?: number | null
          trustpilot_url?: string | null
          updated_at?: string | null
          website?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: number
          product_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: number
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          company_logo_url: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          company_logo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          company_logo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wp_product_mapping: {
        Row: {
          created_at: string | null
          id: string
          supabase_product_id: number
          supabase_product_name: string
          updated_at: string | null
          wp_product_id: number
          wp_product_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          supabase_product_id: number
          supabase_product_name: string
          updated_at?: string | null
          wp_product_id: number
          wp_product_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          supabase_product_id?: number
          supabase_product_name?: string
          updated_at?: string | null
          wp_product_id?: number
          wp_product_name?: string
        }
        Relationships: []
      }
      wp_products: {
        Row: {
          content: string | null
          created_at: string | null
          excerpt: string | null
          height: number | null
          id: number
          image_filename: string | null
          image_local_path: string | null
          image_title: string | null
          image_url: string | null
          length: number | null
          manage_stock: string | null
          name: string
          price: number | null
          sale_price: number | null
          sku: string | null
          status: string | null
          stock: number | null
          stock_status: string | null
          type: string | null
          updated_at: string | null
          weight: number | null
          width: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          height?: number | null
          id: number
          image_filename?: string | null
          image_local_path?: string | null
          image_title?: string | null
          image_url?: string | null
          length?: number | null
          manage_stock?: string | null
          name: string
          price?: number | null
          sale_price?: number | null
          sku?: string | null
          status?: string | null
          stock?: number | null
          stock_status?: string | null
          type?: string | null
          updated_at?: string | null
          weight?: number | null
          width?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          height?: number | null
          id?: number
          image_filename?: string | null
          image_local_path?: string | null
          image_title?: string | null
          image_url?: string | null
          length?: number | null
          manage_stock?: string | null
          name?: string
          price?: number | null
          sale_price?: number | null
          sku?: string | null
          status?: string | null
          stock?: number | null
          stock_status?: string | null
          type?: string | null
          updated_at?: string | null
          weight?: number | null
          width?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

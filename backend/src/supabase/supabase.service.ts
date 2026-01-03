import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase!: SupabaseClient;
  private supabaseAdmin!: SupabaseClient;

  async onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️  Supabase credentials not configured. Storage features will be disabled.');
      return;
    }

    // Client with anon key (for public operations)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client with service role key (for backend operations that bypass RLS)
    if (supabaseServiceRoleKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
      console.log('✅ Supabase admin client initialized (with service role key)');
    } else {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not configured. Using anon key instead.');
      this.supabaseAdmin = this.supabase;
    }

    console.log('✅ Supabase client initialized');
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env');
    }
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error('Supabase admin client not initialized');
    }
    return this.supabaseAdmin;
  }

  /**
   * Upload file to Supabase Storage (uses admin client to bypass RLS)
   * @param bucket - Storage bucket name
   * @param path - File path within bucket (e.g., "members/photos/filename.jpg")
   * @param file - File buffer
   * @param contentType - MIME type
   */
  async uploadFile(bucket: string, path: string, file: Buffer, contentType: string) {
    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return data;
  }

  /**
   * Get public URL for a file
   * @param bucket - Storage bucket name
   * @param path - File path within bucket
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Download file from Supabase Storage (uses admin client)
   * @param bucket - Storage bucket name
   * @param path - File path within bucket
   */
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete file from Supabase Storage (uses admin client)
   * @param bucket - Storage bucket name
   * @param path - File path within bucket
   */
  async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    return true;
  }

  /**
   * List files in a bucket path (uses admin client)
   * @param bucket - Storage bucket name
   * @param path - Directory path within bucket
   */
  async listFiles(bucket: string, path: string = '') {
    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .list(path);

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a storage bucket
   * @param bucketName - Name of the bucket to create
   * @param isPublic - Whether the bucket should be publicly accessible
   */
  async createBucket(bucketName: string, isPublic: boolean = false) {
    const { data, error } = await this.supabase.storage.createBucket(bucketName, {
      public: isPublic,
    });

    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }

    return data;
  }
}

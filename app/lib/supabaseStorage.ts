import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

/**
 * Service for handling Supabase storage operations
 */
export const StorageService = {
  /**
   * Ensures a bucket exists in Supabase storage
   * @param bucketName Name of the bucket to ensure
   * @returns Boolean indicating if the bucket exists or was created
   */
  async ensureBucket(bucketName: string): Promise<boolean> {
    try {
      // Check if bucket exists
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName);
      
      if (bucketError && bucketError.message.includes('not found')) {
        console.log(`Creating ${bucketName} bucket...`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024 // 10MB limit
        });
        
        if (createError) {
          console.error(`Failed to create ${bucketName} bucket:`, createError);
          return false;
        }
        return true;
      } else if (bucketError) {
        console.error(`Error checking ${bucketName} bucket:`, bucketError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  },

  /**
   * Ensures a folder exists in a bucket
   * @param bucketName Name of the bucket
   * @param folderPath Path of the folder to ensure
   * @returns Boolean indicating if the folder exists or was created
   */
  async ensureFolder(bucketName: string, folderPath: string): Promise<boolean> {
    try {
      // Normalize folder path to ensure it ends with a slash
      const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      
      // Create an empty file to represent the folder
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(`${normalizedPath}.folder`, new Uint8Array(0), {
          contentType: 'application/x-directory',
          upsert: true
        });
      
      if (error && !error.message.includes('already exists')) {
        console.error(`Error creating folder ${normalizedPath}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring folder exists:', error);
      return false;
    }
  },

  /**
   * Upload a file to Supabase storage with fallback methods
   * @param bucketName Name of the bucket
   * @param filePath Path where the file should be stored
   * @param fileUri Local URI of the file to upload
   * @param contentType MIME type of the file
   * @returns Object with success status and URL or error
   */
  async uploadWithFallback(
    bucketName: string,
    filePath: string,
    fileUri: string,
    contentType: string
  ): Promise<{ success: boolean; url?: string; error?: Error }> {
    try {
      // Try the primary upload method using base64
      try {
        console.log(`Reading file as base64: ${fileUri}`);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Decode Base64 to ArrayBuffer
        const fileData = decode(fileBase64);
        
        console.log(`Uploading to ${bucketName}/${filePath}`);
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, fileData, {
            contentType,
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        return { success: true, url: urlData?.publicUrl };
      } catch (primaryError) {
        console.warn('Primary upload method failed, trying fallback:', primaryError);
        
        // Fallback method: Use fetch to upload the file
        const formData = new FormData();
        formData.append('file', {
          uri: fileUri,
          name: filePath.split('/').pop(),
          type: contentType,
        } as any);
        
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase URL or key not configured');
        }
        
        const response = await fetch(
          `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'x-upsert': 'true',
            },
            body: formData,
          }
        );
        
        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        return { success: true, url: urlData?.publicUrl };
      }
    } catch (error) {
      console.error('Upload failed with all methods:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown upload error') 
      };
    }
  }
}; 

// Add a default export to satisfy Expo Router's requirements
// This file is not meant to be used as a route component
export default function SupabaseStorage() {
  return null;
} 
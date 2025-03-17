import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from 'expo-image-manipulator';
import { StorageService } from '@/app/lib/supabaseStorage';

// Get Supabase URL from environment or configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export const downloadFile = async (url: string) => {
try {
    const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url), {});
    return uri;
} catch (error) {
    console.error('Download file error:', error);
    return null;
}
};


const getLocalFilePath = (url: string) => {
    const fileName = url.split('/').pop();
    return `${FileSystem.documentDirectory}${fileName}`;
};

/**
 * Generate a thumbnail from an image URI
 * @param uri Original image URI
 * @returns URI of the generated thumbnail
 */
export const generateThumbnail = async (uri: string): Promise<string | null> => {
  try {
    console.log('Generating thumbnail for:', uri);
    
    // Check if ImageManipulator is available
    if (!ImageManipulator.manipulateAsync) {
      console.warn('ImageManipulator.manipulateAsync is not available, returning original URI');
      return uri;
    }
    
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 300 } }], // Resize to 300px width, maintaining aspect ratio
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('Thumbnail generated:', result.uri);
    return result.uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    // Return the original URI if thumbnail generation fails
    return uri;
  }
};

export const uploadFile = async (
  folderName: string,
  fileUri: string,
  isImage: boolean = true
): Promise<{ success: boolean; data?: string; msg?: string; thumbnailPath?: string }> => {
  try {
    // Validate the fileUri
    if (!fileUri) {
      console.error('Invalid file URI provided');
      return { success: false, msg: "Invalid file URI" };
    }

    // Ensure the uploads bucket exists
    const bucketExists = await StorageService.ensureBucket('uploads');
    if (!bucketExists) {
      console.error('Failed to ensure uploads bucket exists');
      return { success: false, msg: "Storage configuration error" };
    }

    // Get file extension
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || (isImage ? 'png' : 'mp4');
    
    // Generate a unique file path
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fileName = `${folderName}/${uniqueId}.${fileExt}`;
    let thumbnailFileName = '';

    try {
      // Ensure the folder exists
      await StorageService.ensureFolder('uploads', folderName);
      
      // Upload the file using the robust upload method with fallbacks
      const uploadResult = await StorageService.uploadWithFallback(
        'uploads',
        fileName,
        fileUri,
        isImage ? `image/${fileExt}` : 'video/mp4'
      );
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error?.message || 'Upload failed');
      }
      
      console.log('File uploaded successfully:', fileName);
      
      // If it's an image, generate and upload a thumbnail
      if (isImage) {
        try {
          const thumbnailUri = await generateThumbnail(fileUri);
          
          if (thumbnailUri) {
            // Define the thumbnail path
            thumbnailFileName = `${folderName}/thumbnails/${uniqueId}_thumb.jpg`;
            
            // Ensure thumbnails folder exists
            await StorageService.ensureFolder('uploads', `${folderName}/thumbnails`);
            
            // Upload the thumbnail
            const thumbResult = await StorageService.uploadWithFallback(
              'uploads',
              thumbnailFileName,
              thumbnailUri,
              'image/jpeg'
            );
            
            if (thumbResult.success) {
              console.log('Thumbnail uploaded successfully:', thumbnailFileName);
              console.log('Thumbnail URL:', thumbResult.url);
            } else {
              console.error('Thumbnail upload failed:', thumbResult.error);
              thumbnailFileName = ''; // Reset if upload failed
            }
          }
        } catch (thumbErr) {
          console.error('Error processing thumbnail:', thumbErr);
          // Continue even if thumbnail generation fails
          thumbnailFileName = '';
        }
      }

      // Return the fileName and thumbnailFileName
      return { 
        success: true, 
        data: fileName,
        thumbnailPath: thumbnailFileName || undefined
      };
    } catch (error) {
      console.error('File processing error:', error);
      return { success: false, msg: 'Error processing file' };
    }
  } catch (error) {
    console.error('Upload service error:', error);
    return { success: false, msg: 'Unexpected error while uploading file' };
  }
};

/**
 * Upload a profile avatar image to Supabase storage
 * @param userId The user ID to associate with the avatar
 * @param fileUri The local URI of the image file to upload
 * @returns Object with success status and either the public URL or error message
 */
export const uploadProfileAvatar = async (
  userId: string,
  fileUri: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!fileUri) {
      console.error('Invalid file URI provided for avatar upload');
      return { success: false, error: "Invalid file URI" };
    }

    console.log('Starting avatar upload for user:', userId);
    
    // Generate a unique file path for the avatar
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`;
    
    // Try primary upload method
    try {
      console.log('Reading avatar file:', fileUri);
      // Read file as Base64
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Decode Base64 to ArrayBuffer
      const fileData = decode(fileBase64);

      console.log('Uploading avatar to Supabase:', fileName);
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, fileData, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }
    } catch (primaryError) {
      console.warn('Primary upload method failed, trying fallback:', primaryError);
      
      // Fallback method: Use fetch to upload the file
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: fileUri,
          name: fileName.split('/').pop(),
          type: `image/${fileExt}`,
        } as any);
        
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase URL or key not configured');
        }
        
        const response = await fetch(
          `${supabaseUrl}/storage/v1/object/public/profiles/${fileName}`,
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
      } catch (fallbackError) {
        console.error('Fallback upload also failed:', fallbackError);
        return { 
          success: false, 
          error: 'Failed to upload avatar with both primary and fallback methods' 
        };
      }
    }

    // Get the public URL for the uploaded avatar
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);
    
    console.log('Avatar uploaded successfully, URL:', urlData?.publicUrl);
    return { success: true, url: urlData?.publicUrl };
  } catch (error) {
    console.error('Avatar upload service error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error while uploading avatar';
    return { success: false, error: errorMessage };
  }
};

export const getUserImageSrc = (imagePath: string | null | undefined) => {
  if (imagePath) {
    return getSupabaseFileUrl(imagePath);
  } else {
    return null;
  }
};

export const getSupabaseFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  // If it's already a full URL, return it
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Clean the path to ensure we don't have duplicate path segments
  const cleanPath = filePath.replace(/^https:\/\/[^/]+\/storage\/v1\/object\/public\/uploads\//, '')
                           .replace(/^uploads\//, '');
  
  // Construct the full URL with the correct format
  const fullUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${cleanPath}`;
  
  // Log the URL for debugging
  console.log('Constructed URL:', fullUrl);
  
  return fullUrl;
};

/**
 * Get the thumbnail URL for an image
 * @param imagePath Original image path
 * @returns Thumbnail URL or original URL if thumbnail doesn't exist
 */
export const getThumbnailUrl = (imagePath: string): string => {
  console.log('getThumbnailUrl called with:', imagePath);
  
  if (!imagePath) {
    console.log('Empty image path provided, returning empty string');
    return '';
  }
  
  // If it's already a thumbnail or not an image, return as is
  if (imagePath.includes('_thumb.') || 
      imagePath.match(/\.(mp4|mov|avi|3gp|mkv)$/i)) {
    console.log('Path is already a thumbnail or video, returning as is');
    return getSupabaseFileUrl(imagePath);
  }
  
  // For now, return the original image URL
  // This ensures we always show an image even if the thumbnail isn't available
  return getSupabaseFileUrl(imagePath);
}
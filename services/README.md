# Image Service

This service provides utilities for handling image uploads, downloads, and processing in the application.

## Features

- Upload profile avatars to Supabase Storage
- Generate thumbnails for images
- Upload general files to Supabase Storage
- Get public URLs for stored files
- Handle file downloads

## Setup

1. Make sure you have the required dependencies installed:

```bash
npm install base64-arraybuffer expo-file-system expo-image-manipulator
```

2. Set up the Supabase storage buckets by running the SQL script in `supabase/storage_setup.sql` in the Supabase SQL Editor.

## Usage

### Uploading a Profile Avatar

```typescript
import { uploadProfileAvatar } from '@/services/imageservice';

// In your component or service
const handleAvatarUpload = async (userId: string, imageUri: string) => {
  const result = await uploadProfileAvatar(userId, imageUri);
  
  if (result.success) {
    console.log('Avatar uploaded successfully:', result.url);
    // Update user profile with the avatar URL
    return result.url;
  } else {
    console.error('Avatar upload failed:', result.error);
    return null;
  }
};
```

### Uploading General Files

```typescript
import { uploadFile } from '@/services/imageservice';

// In your component or service
const handleFileUpload = async (folderName: string, fileUri: string, isImage: boolean = true) => {
  const result = await uploadFile(folderName, fileUri, isImage);
  
  if (result.success) {
    console.log('File uploaded successfully:', result.data);
    // The result.data contains the file path in the storage
    // If it's an image, result.thumbnailPath may contain the thumbnail path
    return result.data;
  } else {
    console.error('File upload failed:', result.msg);
    return null;
  }
};
```

### Getting a File URL

```typescript
import { getSupabaseFileUrl, getThumbnailUrl } from '@/services/imageservice';

// Get the full URL for a file
const fileUrl = getSupabaseFileUrl('path/to/file.jpg');

// Get the thumbnail URL for an image
const thumbnailUrl = getThumbnailUrl('path/to/file.jpg');
```

### Downloading a File

```typescript
import { downloadFile } from '@/services/imageservice';

// Download a file to local storage
const localUri = await downloadFile('https://example.com/file.jpg');
```

## Storage Structure

- `profiles/avatars/`: User profile avatars
- `uploads/`: General file uploads
  - `uploads/{folderName}/`: Organized by folder
  - `uploads/{folderName}/thumbnails/`: Thumbnails for images

## Security

The storage buckets are configured with Row Level Security (RLS) policies to ensure that:

1. Users can only upload, update, and delete their own profile images
2. Public files are viewable by everyone
3. Authenticated users can upload files to the uploads bucket
4. System folders are protected from user modifications

## Error Handling

All functions in the image service return objects with success/error information to help with proper error handling in your application. 
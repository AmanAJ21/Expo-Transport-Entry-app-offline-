import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import * as ImageManipulator from 'expo-image-manipulator';
import * as SecureStore from 'expo-secure-store';

export interface ImageSaveResult {
  success: boolean;
  uri?: string;
  error?: string;
}

/**
 * Save an image to the device's document directory
 * @param imageUri - The URI of the image to save
 * @param fileName - Optional custom filename (will generate one if not provided)
 * @returns Promise with save result
 */
export const saveImageToDevice = async (
  imageUri: string,
  fileName?: string
): Promise<ImageSaveResult> => {
  try {
    // Generate filename if not provided
    const timestamp = new Date().getTime();
    const finalFileName = fileName || `image_${timestamp}.jpg`;
    
    // Create the destination path
    const destinationUri = `${FileSystem.documentDirectory}${finalFileName}`;
    
    // Copy the image to the destination
    await FileSystem.copyAsync({
      from: imageUri,
      to: destinationUri,
    });
    
    return {
      success: true,
      uri: destinationUri,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Request camera and media library permissions
 * @returns Promise with permission status
 */
export const requestImagePermissions = async (): Promise<boolean> => {
  try {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraPermission.status === 'granted' && mediaLibraryPermission.status === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

/**
 * Pick an image from the device's media library
 * @returns Promise with image picker result
 */
export const pickImageFromLibrary = async (): Promise<ImagePicker.ImagePickerResult> => {
  return await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });
};

/**
 * Take a photo using the device's camera
 * @returns Promise with image picker result
 */
export const takePhoto = async (): Promise<ImagePicker.ImagePickerResult> => {
  return await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });
};

/**
 * Get all saved images from the document directory
 * @returns Promise with array of image URIs
 */
export const getSavedImages = async (): Promise<string[]> => {
  try {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg') || 
      file.toLowerCase().endsWith('.png')
    );
    
    return imageFiles.map(file => `${FileSystem.documentDirectory}${file}`);
  } catch (error) {
    console.error('Error getting saved images:', error);
    return [];
  }
};

/**
 * Delete a specific image from device storage
 * @param imageUri - The URI of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImage = async (imageUri: string): Promise<ImageSaveResult> => {
  try {
    await FileSystem.deleteAsync(imageUri);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
};

/**
 * Delete all saved images from device storage
 * @returns Promise with deletion result and count of deleted images
 */
export const deleteAllImages = async (): Promise<ImageSaveResult & { deletedCount?: number }> => {
  try {
    const images = await getSavedImages();
    let deletedCount = 0;
    
    for (const imageUri of images) {
      try {
        await FileSystem.deleteAsync(imageUri);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete image: ${imageUri}`, error);
      }
    }
    
    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete images',
    };
  }
};

/**
 * Convert a local image URI to a base64 data URL
 * @param uri - The local image URI
 * @returns Promise with base64 data URL string
 */
export const uriToBase64 = async (uri: string): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return `data:image/png;base64,${base64}`;
};

const PROFILE_IMAGE_BASE64_KEY = 'profile_image_base64';

/**
 * Save a single profile image as base64 data URL in AsyncStorage
 * @param imageUri - The URI of the image to save
 * @returns Promise with save result
 */
export const saveProfileImage = async (imageUri: string): Promise<ImageSaveResult> => {
  try {
    // Convert the image to PNG using expo-image-manipulator
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      { format: ImageManipulator.SaveFormat.PNG }
    );
    // Convert to base64 data URL
    const base64DataUrl = await uriToBase64(manipResult.uri);
    // Save to SecureStore
    await FileSystem.deleteAsync(manipResult.uri, { idempotent: true }); // Clean up temp file
    await SecureStore.setItemAsync(PROFILE_IMAGE_BASE64_KEY, base64DataUrl);
    return {
      success: true,
      uri: base64DataUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Get the saved profile image as a base64 data URL from AsyncStorage
 * @returns Promise with base64 data URL or null if not found
 */
export const getProfileImage = async (): Promise<string | null> => {
  try {
    const base64DataUrl = await SecureStore.getItemAsync(PROFILE_IMAGE_BASE64_KEY);
    return base64DataUrl || null;
  } catch (error) {
    console.error('Error getting profile image:', error);
    return null;
  }
};

/**
 * Delete the saved profile image
 * @returns Promise with deletion result
 */
export const deleteProfileImage = async (): Promise<ImageSaveResult> => {
  try {
    const profileImageUri = await getProfileImage();
    if (profileImageUri) {
      await FileSystem.deleteAsync(profileImageUri);
    }
    
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete profile image',
    };
  }
};
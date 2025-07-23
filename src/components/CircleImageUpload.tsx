import React, { useState } from "react";
import { View, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import {
  pickImageFromLibrary,
  takePhoto,
  requestImagePermissions,
} from "../utils/imageUtils";

interface CircleImageUploadProps {
  imageUri?: string | null;
  onImageSelected: (uri: string) => void;
  size?: number;
  showCameraButton?: boolean;
}

export default function CircleImageUpload({
  imageUri,
  onImageSelected,
  size = 120,
  showCameraButton = true,
}: CircleImageUploadProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImagePicker = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        { text: "Camera", onPress: handleTakePhoto },
        { text: "Gallery", onPress: handlePickFromGallery },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleTakePhoto = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestImagePermissions();
      if (!hasPermission) {
        Alert.alert("Permission Required", "Camera and photo library access is required");
        return;
      }

      const result = await takePhoto();
      if (!result.canceled && result.assets[0]) {
        setImageError(false);
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestImagePermissions();
      if (!hasPermission) {
        Alert.alert("Permission Required", "Photo library access is required");
        return;
      }

      const result = await pickImageFromLibrary();
      if (!result.canceled && result.assets[0]) {
        setImageError(false);
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Main Circle Container */}
      <TouchableOpacity
        onPress={handleImagePicker}
        disabled={loading}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surface,
          borderWidth: 3,
          borderColor: colors.primary,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          elevation: 6,
        }}
      >
        {imageUri && !imageError ? (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: colors.surface,
          }}>
            <Ionicons 
              name="person" 
              size={size * 0.5} 
              color={colors.textSecondary} 
            />
          </View>
        )}

        {/* Overlay for loading state */}
        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: size / 2,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Camera Button */}
      {showCameraButton && (
        <TouchableOpacity
          onPress={handleImagePicker}
          disabled={loading}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: (size * 0.35) / 2,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: colors.background,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons 
            name="camera" 
            size={size * 0.18} 
            color="white" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
import { Link } from "expo-router";
import React from "react";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export default function Header({ title, showBackButton = false }: HeaderProps) {
  const { top } = useSafeAreaInsets();
  const { theme, colors, toggleTheme } = useTheme();
  const router = useRouter();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return 'sunny';
      case 'dark': return 'moon';
      case 'system': return 'phone-portrait';
      default: return 'sunny';
    }
  };

  return (
    <View style={{
      paddingTop: Platform.OS === 'ios' ? top : 0,
    }}>
      <View
        style={{
          backgroundColor: colors.background,
          paddingHorizontal: 16,
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side - Back button or empty space */}
        <View style={{ width: 60, flexDirection: 'row', justifyContent: 'flex-start' }}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.back(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
                borderRadius: 20,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: 'bold',
            }}
            numberOfLines={1}
          >
            {title || "ACME"}
          </Text>
        </View>

        {/* Right side - Theme toggle */}
        <View style={{ width: 60, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleTheme(); }}
            style={{
              backgroundColor: colors.surface,
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={getThemeIcon()}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
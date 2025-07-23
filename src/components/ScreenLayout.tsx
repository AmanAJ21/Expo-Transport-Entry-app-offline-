import React from "react";
import { View, StatusBar, Platform } from "react-native";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";
import { useTheme } from "../contexts/ThemeContext";

interface ScreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

export default function ScreenLayout({ 
  children, 
  title, 
  showBackButton = false 
}: ScreenLayoutProps) {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    }}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />
      <Header title={title} showBackButton={showBackButton} />
      <View style={{ flex: 1 }}>
        {children}
      </View>
      <BottomNavigation />
    </View>
  );
}
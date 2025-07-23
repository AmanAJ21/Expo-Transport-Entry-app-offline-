import { Link, usePathname } from "expo-router";
import React from "react";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import * as Haptics from 'expo-haptics';

interface NavItem {
    href: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
}

const navItems: NavItem[] = [
    { href: "/", icon: "home", label: "Home" },
    { href: "/owner", icon: "person", label: "Owner" },
    { href: "/transport", icon: "car", label: "Transport" },
    { href: "/report", icon: "document-text", label: "Report" },
    { href: "/settings", icon: "settings", label: "Settings" },
];

export default function BottomNavigation() {
    const { bottom } = useSafeAreaInsets();
    const pathname = usePathname();
    const { colors } = useTheme();

    return (
        <View
            style={{
                backgroundColor: colors.background,
                paddingBottom: bottom || 8,
            }}
        >
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 4
            }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href} asChild>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    paddingVertical: 6,
                                }}
                                activeOpacity={0.7}
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{ marginBottom: 4 }}>
                                        <Ionicons
                                            name={isActive ? item.icon : `${item.icon}-outline` as keyof typeof Ionicons.glyphMap}
                                            size={24}
                                            color={isActive ? colors.primary : colors.textSecondary}
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            color: isActive ? colors.primary : colors.textSecondary,
                                            fontSize: 12,
                                            fontWeight: isActive ? '600' : '500'
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    );
                })}
            </View>
        </View>
    );
}
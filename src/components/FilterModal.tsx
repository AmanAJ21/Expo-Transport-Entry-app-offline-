import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
  initialFilters?: any;
  statusOptions?: string[];
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  onReset,
  initialFilters = {},
  statusOptions = ["pending", "completed", "cancelled", "in-transit", "delivered"],
}: FilterModalProps) {
  const { colors, theme } = useTheme();
  const [search, setSearch] = useState(initialFilters.search || "");
  const [startDate, setStartDate] = useState<Date | null>(initialFilters.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialFilters.endDate || null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [minAmount, setMinAmount] = useState(initialFilters.minAmount || "");
  const [maxAmount, setMaxAmount] = useState(initialFilters.maxAmount || "");
  const [status, setStatus] = useState(initialFilters.status || "");
  const [sort, setSort] = useState(initialFilters.sort || "date_desc");

  const handleApply = () => {
    onApply({
      startDate,
      endDate,
      minAmount,
      maxAmount,
      status,
      sort,
    });
    onClose();
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setMinAmount("");
    setMaxAmount("");
    setStatus("");
    setSort("date_desc");
    onReset();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[
        styles.modal,
        { backgroundColor: colors.background }
      ]}>
        <View style={styles.header}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>Filter</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          {/* Sort Feature */}
          <Text style={[styles.label, { color: colors.text }]}>Sort by</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {[
              { label: 'Date: Newest', value: 'date_desc' },
              { label: 'Date: Oldest', value: 'date_asc' },
              { label: 'Amount: High to Low', value: 'amount_desc' },
              { label: 'Amount: Low to High', value: 'amount_asc' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={{
                  backgroundColor: sort === opt.value ? colors.primary || '#2563eb' : colors.surface,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: sort === opt.value ? colors.primary || '#2563eb' : colors.cardBorder,
                }}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSort(opt.value); }}
              >
                <Text style={{ color: sort === opt.value ? 'white' : colors.text }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Date Range */}
          <Text style={[styles.label, { color: colors.text }]}>Date Range</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <TouchableOpacity
              style={[styles.input, { flex: 1, backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowStartPicker(true); }}
            >
              <Text style={{ color: startDate ? colors.text : colors.textSecondary }}>
                {startDate ? startDate.toLocaleDateString() : "Start Date"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.input, { flex: 1, backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowEndPicker(true); }}
            >
              <Text style={{ color: endDate ? colors.text : colors.textSecondary }}>
                {endDate ? endDate.toLocaleDateString() : "End Date"}
              </Text>
            </TouchableOpacity>
          </View>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
              themeVariant={theme === "dark" ? "dark" : "light"}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
              themeVariant={theme === "dark" ? "dark" : "light"}
            />
          )}
          {/* Amount Range */}
          <Text style={[styles.label, { color: colors.text }]}>Amount Range</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <TextInput
              style={[
                styles.input,
                { flex: 1, color: colors.text, backgroundColor: colors.surface, borderColor: colors.cardBorder }
              ]}
              placeholder="Min"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={minAmount}
              onChangeText={setMinAmount}
            />
            <TextInput
              style={[
                styles.input,
                { flex: 1, color: colors.text, backgroundColor: colors.surface, borderColor: colors.cardBorder }
              ]}
              placeholder="Max"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={maxAmount}
              onChangeText={setMaxAmount}
            />
          </View>
          {/* Status */}
          {statusOptions && statusOptions.length > 0 && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {statusOptions.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={{
                      backgroundColor: status === opt ? colors.primary || '#2563eb' : colors.surface,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      marginRight: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: status === opt ? colors.primary || '#2563eb' : colors.cardBorder,
                    }}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStatus(opt); }}
                  >
                    <Text style={{ color: status === opt ? 'white' : colors.text }}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 16,
          borderTopWidth: 1,
          borderColor: colors.cardBorder,
          backgroundColor: colors.background
        }}>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleReset(); }} style={[styles.button, { backgroundColor: colors.surface }]}> 
            <Text style={{ color: colors.text, fontWeight: '700' }}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleApply(); }} style={[styles.button, { backgroundColor: colors.primary || '#2563eb' }]}> 
            <Text style={{ color: 'white', fontWeight: '700' }}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f1f4',
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
  },
}); 
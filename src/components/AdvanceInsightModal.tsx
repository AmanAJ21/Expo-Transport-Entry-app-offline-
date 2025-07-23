import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import AdvancePieChart from "./AdvancePieChart";
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";

interface TransportBillData {
  bill: string;
  uniqueId: string;
  syncId: string;
  date: Date | string;
  ms: string;
  gstno: string;
  otherDetail: string;
  srno: number;
  lrno: number;
  lrDate: Date | string;
  from: string;
  to: string;
  vehicleNo: string;
  invoiceNo: string;
  consignorConsignee: string;
  handleCharges: number;
  detention: number;
  freight: number;
  total: number;
  status: string;
}

interface AdvanceInsightModalProps {
  visible: boolean;
  onClose: () => void;
  stats: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    inTransit: number;
    delivered: number;
  };
  bills: TransportBillData[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24',
  completed: '#10b981',
  cancelled: '#ef4444',
  'in-transit': '#3b82f6',
  delivered: '#6366f1',
};

// Helper to get financial year string for a date
function getFinancialYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = d.getMonth();
  // If Jan/Feb/Mar, it's part of previous FY
  if (month < 3) {
    return `${year - 1}-${String(year).slice(-2)}`;
  } else {
    return `${year}-${String(year + 1).slice(-2)}`;
  }
}

export default function AdvanceInsightModal({
  visible,
  onClose,
  stats,
  bills,
}: AdvanceInsightModalProps) {
  const { colors } = useTheme();
  // Get all financial years from bills
  const financialYears = useMemo(() => {
    const set = new Set<string>(bills.map(b => getFinancialYear(b.date)));
    return Array.from(set).filter(Boolean).sort().reverse();
  }, [bills]);
  const [selectedFY, setSelectedFY] = useState<string>(financialYears[0] || getFinancialYear(new Date()));

  // Filter bills by selected financial year
  const filteredBills = useMemo(() => {
    if (!selectedFY) return [];
    // Parse start and end
    const [startYear, endYearShort] = selectedFY.split('-');
    const start = new Date(Number(startYear), 3, 1); // April 1
    const end = new Date(Number(startYear) + 1, 2, 31, 23, 59, 59, 999); // March 31 next year
    return bills.filter(b => {
      const d = typeof b.date === 'string' ? new Date(b.date) : b.date;
      return d instanceof Date && !isNaN(d.getTime()) && d >= start && d <= end;
    });
  }, [bills, selectedFY]);

  // Pie chart data
  const pieData = [
    { value: filteredBills.filter(b => b.status === 'pending').length, color: STATUS_COLORS.pending, label: 'Pending' },
    { value: filteredBills.filter(b => b.status === 'completed').length, color: STATUS_COLORS.completed, label: 'Completed' },
    { value: filteredBills.filter(b => b.status === 'cancelled').length, color: STATUS_COLORS.cancelled, label: 'Cancelled' },
    { value: filteredBills.filter(b => b.status === 'in-transit').length, color: STATUS_COLORS['in-transit'], label: 'In-Transit' },
    { value: filteredBills.filter(b => b.status === 'delivered').length, color: STATUS_COLORS.delivered, label: 'Delivered' },
  ].filter(d => d.value > 0);

  // Top owner and transport
  const topOwner = useMemo(() => {
    const count: Record<string, number> = {};
    filteredBills.forEach(b => {
      if (b.consignorConsignee) count[b.consignorConsignee] = (count[b.consignorConsignee] || 0) + 1;
    });
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [filteredBills]);
  const topTransport = useMemo(() => {
    const count: Record<string, number> = {};
    filteredBills.forEach(b => {
      if (b.vehicleNo) count[b.vehicleNo] = (count[b.vehicleNo] || 0) + 1;
    });
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [filteredBills]);

  // Monthly totals for bar chart (Apr to Mar)
  const monthlyTotals = useMemo(() => {
    const arr = Array(12).fill(0);
    filteredBills.forEach(b => {
      const d = typeof b.date === 'string' ? new Date(b.date) : b.date;
      if (d instanceof Date && !isNaN(d.getTime())) {
        // Map Apr=0, ..., Mar=11
        let idx = d.getMonth() - 3;
        if (idx < 0) idx += 12;
        arr[idx]++;
      }
    });
    return arr;
  }, [filteredBills]);
  const monthLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

  // Bar chart scaling
  const maxBarHeight = 100;
  const maxValue = Math.max(...monthlyTotals, 1); // avoid division by zero

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.modal, { backgroundColor: colors.background }]}> 
        <View style={styles.header}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>Advance Insight</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Year Picker */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>Select Financial Year</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {financialYears.map((fy, i) => (
                <TouchableOpacity
                  key={fy}
                  style={{
                    backgroundColor: selectedFY === fy ? colors.primary : colors.surface,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: selectedFY === fy ? colors.primary : colors.cardBorder,
                  }}
                  onPress={() => setSelectedFY(fy)}
                >
                  <Text style={{ color: selectedFY === fy ? 'white' : colors.text }}>{fy}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Pie Chart */}
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 16 }}>Bill Status Distribution</Text>
          <AdvancePieChart data={pieData} size={180} />
          {/* Monthly Bar Chart */}
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginTop: 32, marginBottom: 16 }}>Bills Per Month</Text>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Svg width={320} height={140}>
              <G y={120}>
                {monthlyTotals.map((val, i) => {
                  const barHeight = val === 0 ? 2 : (val / maxValue) * maxBarHeight;
                  // Ensure label is always visible
                  const labelY = -barHeight - 6 < -maxBarHeight - 16 ? -maxBarHeight - 16 : -barHeight - 6;
                  return (
                    <React.Fragment key={i}>
                      <Rect
                        x={i * 25 + 10}
                        y={-barHeight}
                        width={16}
                        height={barHeight}
                        fill={colors.primary}
                        rx={4}
                      />
                      {/* Value label above bar */}
                      <SvgText
                        x={i * 25 + 18}
                        y={labelY}
                        fontSize={12}
                        fill={colors.text}
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {val}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
                {/* Month labels */}
                {monthLabels.map((label, i) => (
                  <SvgText
                    key={label}
                    x={i * 25 + 18}
                    y={16}
                    fontSize={10}
                    fill={colors.textSecondary}
                    textAnchor="middle"
                  >
                    {label}
                  </SvgText>
                ))}
              </G>
            </Svg>
          </View>
          {/* Top Owner/Transport */}
          <View style={{ marginTop: 32 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Top Owner</Text>
            {topOwner ? (
              <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 4 }}>{topOwner.name} ({topOwner.count} bills)</Text>
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 4 }}>No data</Text>
            )}
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 8 }}>Top Transport</Text>
            {topTransport ? (
              <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 4 }}>{topTransport.name} ({topTransport.count} bills)</Text>
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 4 }}>No data</Text>
            )}
          </View>
        </ScrollView>
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
}); 
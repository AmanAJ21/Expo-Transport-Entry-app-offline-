import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  FlatList,
  Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import AddBillModal from "./AddBillModal";
import { 
  TransportBillData, 
  BillStatus, 
  getAllTransportBills, 
  getTransportBillsCountByStatus 
} from "../utils/dataUtils";
import * as Haptics from 'expo-haptics';

interface BillsListProps {
  title?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  onBillPress?: (bill: TransportBillData) => void;
  showFinancialBreakdown?: boolean;
  mode?: 'transport' | 'owner';
  showAddButton?: boolean;
}

export default function BillsList({
  title = "Bills",
  emptyMessage = "No bills found",
  searchPlaceholder = "Search bills...",
  onBillPress,
  showFinancialBreakdown = true,
  mode = 'transport',
  showAddButton = true,
}: BillsListProps) {
  const { colors } = useTheme();
  const [bills, setBills] = useState<TransportBillData[]>([]);
  const [filteredBills, setFilteredBills] = useState<TransportBillData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BillStatus | "all">("all");
  const [statusCounts, setStatusCounts] = useState<Record<BillStatus, number>>({
    pending: 0,
    completed: 0,
    cancelled: 0,
    'in-transit': 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadBills();
    loadStatusCounts();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchQuery, selectedStatus]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const result = await getAllTransportBills();
      if (result.success && result.data) {
        setBills(result.data);
      } else {
        Alert.alert("Error", result.error || "Failed to load bills");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const loadStatusCounts = async () => {
    try {
      const result = await getTransportBillsCountByStatus();
      if (result.success && result.data) {
        setStatusCounts(result.data);
      }
    } catch (error) {
      console.error("Failed to load status counts:", error);
    }
  };

  const filterBills = () => {
    let filtered = bills;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(bill => bill.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bill => 
        bill.ms.toLowerCase().includes(query) ||
        bill.gstno.toLowerCase().includes(query) ||
        bill.from.toLowerCase().includes(query) ||
        bill.to.toLowerCase().includes(query) ||
        bill.vehicleNo.toLowerCase().includes(query) ||
        bill.invoiceNo.toLowerCase().includes(query) ||
        bill.consignorConsignee.toLowerCase().includes(query) ||
        bill.otherDetail.toLowerCase().includes(query) ||
        bill.bill.toString().includes(query) ||
        bill.lrno.toString().includes(query) ||
        bill.srno.toString().includes(query)
      );
    }

    setFilteredBills(filtered);
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in-transit': return '#3B82F6';
      case 'delivered': return '#10B981';
      case 'completed': return '#059669';
      case 'cancelled': return '#EF4444';
      default: return colors.textSecondary;
    }
  };

  const handleBillPress = (bill: TransportBillData) => {
    if (onBillPress) {
      onBillPress(bill);
    }
  };

  const handleBillAdded = (newBill: TransportBillData) => {
    // Refresh the bills list after adding a new bill
    loadBills();
    loadStatusCounts();
  };

  const renderBillItem = ({ item }: { item: TransportBillData }) => (
    <TouchableOpacity 
      style={{
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleBillPress(item); }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>
          Bill #{item.bill}
        </Text>
        <View style={{
          backgroundColor: getStatusColor(item.status),
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
          {item.ms}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          GST: {item.gstno}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          {item.from} → {item.to}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          Vehicle: {item.vehicleNo} | LR: {item.lrno} | Invoice: {item.invoiceNo}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          Consignor/Consignee: {item.consignorConsignee}
        </Text>
        
        {showFinancialBreakdown && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Freight</Text>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                ₹{item.freight.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Handle Charges</Text>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                ₹{item.handleCharges.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Detention</Text>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                ₹{item.detention.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>
                ₹{item.total.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {!showFinancialBreakdown && (
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginTop: 4 }}>
            Total: ₹{item.total.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const statusFilters: Array<{ key: BillStatus | "all", label: string }> = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in-transit", label: "In Transit" },
    { key: "delivered", label: "Delivered" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View style={{ marginBottom: 16 }}>
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              padding: 12,
              color: colors.text,
              fontSize: 16,
            }}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSearchQuery(""); }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <View style={{ marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSelectedStatus(filter.key); }}
                style={{
                  backgroundColor: selectedStatus === filter.key ? '#3B82F6' : colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{
                  color: selectedStatus === filter.key ? 'white' : colors.text,
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bills List: Only show after user searches or filters */}
      {(searchQuery.trim().length > 0 || selectedStatus !== 'all') && (
        <View style={{ flex: 1, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>
              {title} ({filteredBills.length})
            </Text>
            {showAddButton && (
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowAddModal(true); }}
                style={{
                  backgroundColor: '#3B82F6',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 140,
                  paddingHorizontal: 0,
                  paddingVertical: 10,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 4, flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">
                  Add Bill
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="hourglass" size={32} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading {title.toLowerCase()}...</Text>
            </View>
          ) : filteredBills.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="document-outline" size={48} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
                {emptyMessage}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredBills}
              renderItem={renderBillItem}
              keyExtractor={(item) => item.bill.toString()}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Add Bill Modal */}
      <AddBillModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onBillAdded={handleBillAdded}
        title={`Add New ${mode === 'transport' ? 'Transport' : 'Owner'} Bill`}
        mode={mode}
      />
    </View>
  );
}
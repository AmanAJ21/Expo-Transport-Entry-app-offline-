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
import AddOwnerDataModal from "./AddOwnerDataModal";
import { 
  OwnerData, 
  getAllOwnerData, 
  saveOwnerData 
} from "../utils/dataUtils";
import * as Haptics from 'expo-haptics';

interface OwnerDataListProps {
  title?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  onOwnerDataPress?: (ownerData: OwnerData) => void;
  showAddButton?: boolean;
}

export default function OwnerDataList({
  title = "Owner Records",
  emptyMessage = "No owner records found",
  searchPlaceholder = "Search owner records...",
  onOwnerDataPress,
  showAddButton = true,
}: OwnerDataListProps) {
  const { colors } = useTheme();
  const [ownerData, setOwnerData] = useState<OwnerData[]>([]);
  const [filteredData, setFilteredData] = useState<OwnerData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadOwnerData();
  }, []);

  useEffect(() => {
    filterData();
  }, [ownerData, searchQuery]);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const result = await getAllOwnerData();
      if (result.success && result.data) {
        setOwnerData(result.data);
      } else {
        Alert.alert("Error", result.error || "Failed to load owner data");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load owner data");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = ownerData;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(data => 
        data.ownerNameAndAddress.toLowerCase().includes(query) ||
        data.vehicleNo.toLowerCase().includes(query) ||
        data.from.toLowerCase().includes(query) ||
        data.to.toLowerCase().includes(query) ||
        data.driverNameAndMob.toLowerCase().includes(query) ||
        data.brokerName.toLowerCase().includes(query) ||
        data.licenceNo.toLowerCase().includes(query) ||
        data.chasisNo.toLowerCase().includes(query) ||
        data.engineNo.toLowerCase().includes(query) ||
        data.panNo.toLowerCase().includes(query) ||
        data.brokerPanNo.toLowerCase().includes(query) ||
        data.id.toString().includes(query) ||
        data.lrno.toString().includes(query) ||
        data.srno.toString().includes(query)
      );
    }

    setFilteredData(filtered);
  };

  const handleOwnerDataPress = (data: OwnerData) => {
    if (onOwnerDataPress) {
      onOwnerDataPress(data);
    }
  };

  const handleOwnerDataAdded = (newOwnerData: OwnerData) => {
    // Refresh the owner data list after adding a new record
    loadOwnerData();
  };

  const renderOwnerDataItem = ({ item }: { item: OwnerData }) => (
    <TouchableOpacity 
      style={{
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleOwnerDataPress(item); }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>
          ID #{item.id}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          {item.date.toLocaleDateString()}
        </Text>
      </View>
      
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
          {item.ownerNameAndAddress}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          Vehicle: {item.vehicleNo} | Contact: {item.contactNo}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          {item.from} → {item.to}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          Driver: {item.driverNameAndMob}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
          LR: {item.lrno} | SR: {item.srno} | Packages: {item.packages}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Lorry Hire</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
              ₹{item.totalLorryHireRs.toLocaleString()}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Balance</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
              ₹{item.balanceAmt.toLocaleString()}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Weight</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
              {item.wtKgs} kg
            </Text>
          </View>
        </View>

        {item.remarks && (
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>
            {item.remarks}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

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
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Owner Data List: Only show after user searches */}
      {searchQuery.trim().length > 0 && (
        <View style={{ flex: 1, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>
              {title} ({filteredData.length})
            </Text>
            {showAddButton && (
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowAddModal(true); }}
                style={{
                  backgroundColor: '#10B981',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  overflow: 'hidden',
                  maxWidth: 180,
                }}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 4, flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">
                  Add Record
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="hourglass" size={32} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading owner data...</Text>
            </View>
          ) : filteredData.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="folder-outline" size={48} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
                {emptyMessage}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                Try adjusting your search criteria
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderOwnerDataItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Add Owner Data Modal */}
      <AddOwnerDataModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onOwnerDataAdded={handleOwnerDataAdded}
        title="Add New Owner Record"
      />
    </View>
  );
}
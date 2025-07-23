import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Share, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import ScreenLayout from "../components/ScreenLayout";
import { TransportBillData, getAllTransportBills, deleteTransportBill } from "../utils/dataUtils";
import FilterModal from "../components/FilterModal";
import AddBillModal from "../components/AddBillModal";
import BillDetailModal from "../components/BillDetailModal";
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfileImage } from "../utils/imageUtils";
import PrintButton from "../components/PrintButton";
import { Platform } from "react-native";
import generateTransportTemplate from "@/components/TransportTemplate";

// Profile and Bank data interfaces
interface ProfileData {
  companyName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  panNumber: string;
  logo?: string;
}

interface BankData {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
}

export default function TransportScreen() {
  const { colors } = useTheme();
  // Financial year state
  const today = new Date();
  const fyStart = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  const [selectedYear, setSelectedYear] = useState(fyStart);
  const [bills, setBills] = useState<TransportBillData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: null, endDate: null, minAmount: "", maxAmount: "", status: "", sort: "date_desc" });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<TransportBillData | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editBill, setEditBill] = useState<TransportBillData | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 10;
  // Profile and bank data for PDF generation
  const [profileData, setProfileData] = useState<ProfileData>({
    companyName: '',
    ownerName: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    panNumber: '',
  });
  const [bankData, setBankData] = useState<BankData>({
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getAllTransportBills(),
      loadProfileData(),
      loadBankData(),
      loadProfileImage()
    ]).then(([billsResult]) => {
      if (billsResult.success && billsResult.data) setBills(billsResult.data);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setIsLoading(false);
    });
  }, []);

  // Load profile data from AsyncStorage
  const loadProfileData = async () => {
    try {
      const data = await AsyncStorage.getItem('profile_data');
      if (data) {
        const parsedData = JSON.parse(data);
        setProfileData(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    return null;
  };

  // Load bank data from AsyncStorage
  const loadBankData = async () => {
    try {
      const data = await AsyncStorage.getItem('bank_data');
      if (data) {
        const parsedData = JSON.parse(data);
        setBankData(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading bank data:', error);
    }
    return null;
  };

  // Load profile image
  const loadProfileImage = async () => {
    try {
      const savedImage = await getProfileImage();
      setProfileImage(savedImage);
      return savedImage;
    } catch (error) {
      console.error('Error loading profile image:', error);
      return null;
    }
  };

  // Calculate start and end date for selected financial year
  const startDate = useMemo(() => new Date(selectedYear, 3, 1), [selectedYear]); // April 1
  const endDate = useMemo(() => new Date(selectedYear + 1, 2, 31, 23, 59, 59, 999), [selectedYear]); // March 31 next year

  // Filter bills by year, filter modal, search query, and sort
  const filteredBills = useMemo(() => {
    let data = bills.filter(b => {
      const date = new Date(b.date);
      return date >= startDate && date <= endDate;
    });

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      data = data.filter(b =>
        // Search in multiple fields
        String(b.bill).toLowerCase().includes(query) ||
        (b.ms && b.ms.toLowerCase().includes(query)) ||
        (b.vehicleNo && b.vehicleNo.toLowerCase().includes(query)) ||
        (b.from && b.from.toLowerCase().includes(query)) ||
        (b.to && b.to.toLowerCase().includes(query)) ||
        (b.total && String(b.total).includes(query)) ||
        (b.consignorConsignee && b.consignorConsignee.toLowerCase().includes(query)) ||
        (b.invoiceNo && b.invoiceNo.toLowerCase().includes(query))
      );
    }

    if (filters.startDate) {
      data = data.filter(b => new Date(b.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      data = data.filter(b => new Date(b.date) <= new Date(filters.endDate));
    }
    if (filters.minAmount) {
      data = data.filter(b => (b.total || 0) >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      data = data.filter(b => (b.total || 0) <= parseFloat(filters.maxAmount));
    }
    if (filters.status) {
      data = data.filter(b => (b.status || "").toLowerCase() === filters.status.toLowerCase());
    }
    // Sort
    if (filters.sort === 'date_desc') {
      data = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (filters.sort === 'date_asc') {
      data = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (filters.sort === 'amount_desc') {
      data = data.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else if (filters.sort === 'amount_asc') {
      data = data.sort((a, b) => (a.total || 0) - (b.total || 0));
    }
    return data;
  }, [bills, startDate, endDate, filters, searchQuery]);

  // Count active filters for badge
  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
    filters.status,
    filters.sort !== 'date_desc' ? filters.sort : null
  ].filter(Boolean).length;

  // Get current page bills
  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  // Add this function to refresh data after adding
  const refreshBills = () => {
    getAllTransportBills().then(result => {
      if (result.success && result.data) setBills(result.data);
    });
  };

  // Add this function to handle delete
  const handleDelete = async (item: TransportBillData) => {
    Alert.alert(
      "Delete Bill",
      "Are you sure you want to delete this bill? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            const result = await deleteTransportBill(item.bill);
            if (result.success) {
              refreshBills();
              setDetailModalVisible(false);
            } else {
              Alert.alert("Error", result.error || "Failed to delete bill");
            }
          }
        }
      ]
    );
  };

  // Generate shareable content for transport bill
  const generateTransportShareContent = (item: TransportBillData) => {
    return `TRANSPORT BILL DETAILS (#${item.bill})
------------------------------------------
Date: ${new Date(item.date).toLocaleDateString()}
M/S: ${item.ms || '-'}
GST No: ${item.gstno || '-'}
Status: ${item.status || '-'}

ROUTE & VEHICLE
------------------------------------------
From: ${item.from || '-'}
To: ${item.to || '-'}
Vehicle No: ${item.vehicleNo || '-'}
Invoice No: ${item.invoiceNo || '-'}
Consignor/Consignee: ${item.consignorConsignee || '-'}

CHARGES & AMOUNTS
------------------------------------------
Handle Charges: ${item.handleCharges || '-'}
Detention: ${item.detention || '-'}
Freight: ${item.freight || '-'}
Total: ₹${item.total?.toLocaleString() || '0'}`;
  };

  // Generate and view invoice for transport bill
  const handleGeneratePdf = async (item: TransportBillData) => {
    try {
      setPdfGenerating(true);

      // Convert profileImage to base64 data URL if it's a file URI
      let printableProfileImage = profileImage;
      if (profileImage && profileImage.startsWith('file://')) {
        try {
          const ext = profileImage.split('.').pop()?.toLowerCase();
          if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png') {
            Alert.alert('Unsupported image type', 'Please use a PNG or JPEG image for your logo.');
            printableProfileImage = null;
          } else {
            const base64 = await FileSystem.readAsStringAsync(profileImage, { encoding: FileSystem.EncodingType.Base64 });
            const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
            printableProfileImage = `data:${mime};base64,${base64}`;
            // Debug: log the first 100 characters
            console.log('Logo data URL:', printableProfileImage.substring(0, 100));
          }
        } catch (e) {
          console.warn('Could not convert profile image to base64:', e);
          // Fallback to default logo
          printableProfileImage = 'https://drive.google.com/thumbnail?id=1F7iJaGUYxqnxsaImMbaSTskWge5rdz2o&sz=w200';
        }
      }

      // Generate HTML content using the TransportTemplate component
      const htmlContent = generateTransportTemplate({
        bill: item,
        profileData,
        bankData,
        profileImage: printableProfileImage
      });

      // For web platforms, use a direct approach
      if (Platform.OS === 'web') {
        try {
          // Create a new window for the invoice
          const invoiceWindow = window.open('', '_blank');

          if (!invoiceWindow) {
            Alert.alert(
              'Popup Blocked',
              'Please allow popups for this site to view and print the invoice.'
            );
            setPdfGenerating(false);
            return;
          }

          // Write the HTML content to the new window
          invoiceWindow.document.open();
          invoiceWindow.document.write(htmlContent);
          invoiceWindow.document.close();

          // Focus the window
          invoiceWindow.focus();

          setPdfGenerating(false);
        } catch (error) {
          console.error('Error creating invoice view:', error);
          Alert.alert('Error', 'Failed to create invoice view. Please try again.');
          setPdfGenerating(false);
        }
        return;
      }

      // For mobile platforms, use direct sharing of HTML content
      try {
        // Create a temporary HTML file
        const htmlFilePath = `${FileSystem.cacheDirectory}bill_${item.bill}.html`;

        // Write the HTML content to the file
        await FileSystem.writeAsStringAsync(htmlFilePath, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8
        });

        // Check if sharing is available
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable) {
          // Share the HTML file
          await Sharing.shareAsync(htmlFilePath, {
            mimeType: 'text/html',
            dialogTitle: `Transport Bill #${item.bill}`,
            UTI: 'public.html'
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device.');
        }
      } catch (error) {
        console.error('Error sharing HTML:', error);
        Alert.alert('Error', 'Failed to share bill. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Handle share action for transport bill
  const handleShareTransportBill = async (item: TransportBillData) => {
    try {
      const content = generateTransportShareContent(item);
      const title = `Transport Bill #${item.bill}`;

      const result = await Share.share({
        message: content,
        title: title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      // Fallback to clipboard if sharing fails
      try {
        const content = generateTransportShareContent(item);
        await Clipboard.setStringAsync(content);
        Alert.alert('Copied to clipboard', 'Bill details have been copied to your clipboard.');
      } catch (clipboardError) {
        Alert.alert('Error', 'Failed to share bill details.');
      }
    }
  };

  return (
    <ScreenLayout title="Transport" showBackButton={true}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Search bar with filter icon (top) - Absolute positioned */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: colors.background,
          paddingTop: 12,
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 8,
              paddingHorizontal: 12,
              height: 44,
            }}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, color: colors.text, fontSize: 16 }}
                placeholder="Search bills, customers, amount"
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={{
                marginLeft: 10,
                backgroundColor: colors.surface,
                borderRadius: 8,
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="options" size={22} color={colors.text} />
              {activeFilterCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: '#ef4444',
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                }}>
                  <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={f => setFilters(f)}
          onReset={() => setFilters({ startDate: null, endDate: null, minAmount: "", maxAmount: "", status: "", sort: "date_desc" })}
          initialFilters={filters}
          statusOptions={["pending", "completed", "cancelled", "in-transit", "delivered"]}
        />

        {/* Bill List (cards) below filters */}
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <Ionicons name="sync" size={48} color={colors.primary} style={{ marginBottom: 16, opacity: 0.8 }} />
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>Loading bills...</Text>
          </View>
        ) : filteredBills.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="document-outline" size={72} color="#bfc4d1" style={{ marginBottom: 16 }} />
            <Text style={{ color: '#22223b', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>No Bills Found</Text>
            <Text style={{ color: '#6c6c80', fontSize: 16, textAlign: 'center', marginHorizontal: 24 }}>
              Create your first transport bill to get started
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: 80, // Add padding for the search bar
              paddingBottom: 80 // Padding for bottom controls
            }}>
            {currentBills.map(item => (
              <TouchableOpacity
                key={item.bill}
                activeOpacity={0.85}
                onPress={() => { setSelectedBill(item); setDetailModalVisible(true); }}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 18,
                  marginHorizontal: 16,
                  marginBottom: 18,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 5,
                  borderWidth: 1,
                  borderColor:
                    item.status === 'completed' ? '#22c55e' :
                      item.status === 'pending' ? '#f59e42' :
                        item.status === 'cancelled' ? '#ef4444' :
                          item.status === 'in-transit' ? '#3b82f6' :
                            item.status === 'delivered' ? '#6366f1' :
                              colors.primary || '#2563eb',
                  borderLeftWidth: 4,
                }}
              >
                {/* Row 1 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  {/* Left: Bill # and Date */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Bill #{item.bill}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  {/* Center: ms */}
                  <View style={{ flex: 2, alignItems: 'center' }}>
                    <Text style={{ color: colors.primary || '#2563eb', fontSize: 16, fontWeight: '700' }} numberOfLines={1} ellipsizeMode="tail">{item.ms}</Text>
                  </View>
                  {/* Right: Amount and Status */}
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>₹{item.total?.toLocaleString() || '0'}</Text>
                    {item.status && (
                      <View style={{
                        marginTop: 4,
                        backgroundColor:
                          item.status === 'completed' ? '#22c55e' :
                            item.status === 'pending' ? '#f59e42' :
                              item.status === 'cancelled' ? '#ef4444' :
                                item.status === 'in-transit' ? '#3b82f6' :
                                  item.status === 'delivered' ? '#6366f1' :
                                    colors.primary || '#2563eb',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' }}>{item.status}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {/* Row 2: Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#2563eb',
                      borderRadius: 8,
                      paddingVertical: 8,
                      marginRight: 6
                    }}
                    onPress={() => {
                      setSelectedBill(item);
                      setDetailModalVisible(true);
                    }}
                  >
                    <Ionicons name="eye" size={18} color={'white'} style={{ marginRight: 4 }} />
                    <Text style={{ color: 'white', fontWeight: '600' }}>View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f59e42',
                      borderRadius: 8,
                      paddingVertical: 8,
                      marginRight: 6
                    }}
                    onPress={() => {
                      setEditBill(item);
                      setEditModalVisible(true);
                    }}
                  >
                    <Ionicons name="create" size={18} color={'white'} style={{ marginRight: 4 }} />
                    <Text style={{ color: 'white', fontWeight: '600' }}>Update</Text>
                  </TouchableOpacity>

                  <PrintButton
                    bill={item}
                    profileData={profileData}
                    bankData={bankData}
                    profileImage={profileImage}
                    style={{
                      flex: 1,
                      marginRight: 6
                    }}
                    label="PDF"
                    isLoading={pdfGenerating}
                    onPrintStart={() => setPdfGenerating(true)}
                    onPrintEnd={() => setPdfGenerating(false)}
                  />

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#7c3aed',
                      borderRadius: 8,
                      paddingVertical: 8
                    }}
                    onPress={() => handleShareTransportBill(item)}
                  >
                    <Ionicons name="share-social" size={18} color={'white'} style={{ marginRight: 4 }} />
                    <Text style={{ color: 'white', fontWeight: '600' }}>Share</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            <BillDetailModal
              visible={detailModalVisible}
              onClose={() => setDetailModalVisible(false)}
              bill={selectedBill}
              type="transport"
              onUpdate={() => { setEditBill(selectedBill); setEditModalVisible(true); setDetailModalVisible(false); }}
              onDelete={() => handleDelete(selectedBill)}
              onGeneratePdf={handleGeneratePdf}
            />
          </ScrollView>
        )}

        {/* Pagination controls */}
        {filteredBills.length > 0 && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 12,
            backgroundColor: colors.background,
          }}>
            <TouchableOpacity
              onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: 8,
                backgroundColor: currentPage === 1 ? colors.surface : colors.primary,
                borderRadius: 8,
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? colors.textSecondary : 'white'} />
            </TouchableOpacity>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 12,
              backgroundColor: colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                Page {currentPage} of {totalPages} ({filteredBills.length} bills)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: 8,
                backgroundColor: currentPage === totalPages ? colors.surface : colors.primary,
                borderRadius: 8,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? colors.textSecondary : 'white'} />
            </TouchableOpacity>
          </View>
        )}

        {/* Financial year selector and Add Bill button (bottom) */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
          backgroundColor: colors.background,
        }}>
          <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={{ padding: 8 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>
            FY {selectedYear}-{selectedYear + 1}
          </Text>
          <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={{ padding: 8 }}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary || '#2563eb',
              borderRadius: 16,
              paddingHorizontal: 32,
              paddingVertical: 14,
              marginLeft: 12
            }}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>+ Add Bill</Text>
          </TouchableOpacity>
        </View>

        <AddBillModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onBillAdded={() => {
            setAddModalVisible(false);
            refreshBills();
          }}
          title="Add New Transport Bill"
          initialData={null}
        />

        <AddBillModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          onBillAdded={() => {
            setEditModalVisible(false);
            refreshBills();
          }}
          title="Update Transport Bill"
          initialData={editBill}
        />
      </View>
    </ScreenLayout>
  );
}
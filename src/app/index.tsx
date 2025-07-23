import * as React from "react";
import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Alert, ScrollView, Modal, TextInput } from "react-native";
import ScreenLayout from "../components/ScreenLayout";
import CircleImageUpload from "../components/CircleImageUpload";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import {
  saveProfileImage,
  getProfileImage,
} from "../utils/imageUtils";
import { getAllTransportBills, TransportBillData } from "../utils/dataUtils";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import AdvanceInsightModal from "../components/AdvanceInsightModal";

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

export default function HomeScreen() {
  const { colors } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile and Bank state
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

  // Bill/Insight state
  const [bills, setBills] = useState<TransportBillData[]>([]);
  const [billStats, setBillStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    inTransit: 0,
    delivered: 0,
  });

  // Modal states
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [advanceInsightVisible, setAdvanceInsightVisible] = useState(false);

  useEffect(() => {
    loadProfileImage();
    loadProfileData();
    loadBankData();
    loadBills();
  }, []);

  // Load profile data from AsyncStorage
  const loadProfileData = async () => {
    try {
      const data = await AsyncStorage.getItem('profile_data');
      if (data) {
        setProfileData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // Load bank data from AsyncStorage
  const loadBankData = async () => {
    try {
      const data = await AsyncStorage.getItem('bank_data');
      if (data) {
        setBankData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading bank data:', error);
    }
  };

  const loadProfileImage = async () => {
    const savedImage = await getProfileImage();
    setProfileImage(savedImage);
  };

  const handleImageSelected = (uri: string) => {
    setSelectedImage(uri);
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const result = await saveProfileImage(selectedImage);
      if (result.success) {
        Alert.alert("Success", "Profile image saved successfully!");
        setProfileImage(result.uri || selectedImage);
        setSelectedImage(null);
      } else {
        Alert.alert("Error", result.error || "Failed to save image");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save image");
    } finally {
      setLoading(false);
    }
  };

  const loadBills = async () => {
    const result = await getAllTransportBills();
    if (result.success && result.data) {
      setBills(result.data);
      const stats = {
        total: result.data.length,
        pending: result.data.filter(b => b.status === 'pending').length,
        completed: result.data.filter(b => b.status === 'completed').length,
        cancelled: result.data.filter(b => b.status === 'cancelled').length,
        inTransit: result.data.filter(b => b.status === 'in-transit').length,
        delivered: result.data.filter(b => b.status === 'delivered').length,
      };
      setBillStats(stats);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getWelcomeSubtext = () => {
    if (!profileImage) {
      return "Add your profile picture to get started";
    }
    return "Ready to manage your profile";
  };

  return (
    <ScreenLayout title="Home" showBackButton={false}>
      <ScrollView className="flex-1 p-4">
        {/* Circle Image Upload Section */}
        <View style={{ marginBottom: 24, alignItems: 'center' }}>
          <CircleImageUpload
            imageUri={selectedImage || profileImage}
            onImageSelected={handleImageSelected}
            size={150}
            showCameraButton={true}
          />

          {selectedImage && (
            <View style={{ 
              flexDirection: 'row', 
              gap: 12, 
              marginTop: 24, 
              width: '100%',
              paddingHorizontal: 16
            }}>
              <TouchableOpacity
                onPress={handleSaveImage}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                disabled={loading}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {loading ? "Saving..." : "Save Image"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                disabled={loading}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Welcome Section */}
        <View style={{ 
          marginBottom: 24, 
          alignItems: 'center',
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}>
          <Text
            style={{ 
              fontSize: 28, 
              fontWeight: 'bold', 
              marginBottom: 8,
              color: colors.text 
            }}
          >
            {getWelcomeMessage()}!
          </Text>
          <Text
            style={{ 
              fontSize: 16, 
              textAlign: 'center', 
              marginBottom: 4,
              color: colors.textSecondary 
            }}
          >
            {getWelcomeSubtext()}
          </Text>
        </View>

        {/* Advance Insight Card */}
        <TouchableOpacity
          onPress={() => setAdvanceInsightVisible(true)}
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            alignItems: 'center',
            marginBottom: 24,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Ionicons name="analytics" size={24} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Advance Insight</Text>
        </TouchableOpacity>
        {/* Bill Insight Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
            paddingHorizontal: 4
          }}>
            Bill Insight
          </Text>
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: colors.textSecondary }}>Total</Text>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{billStats.total}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: colors.textSecondary }}>Pending</Text>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{billStats.pending}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: colors.textSecondary }}>Completed</Text>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{billStats.completed}</Text>
            </View>
          </View>
        </View>
        {/* Advance Insight Section (inline, can be removed if only modal is needed) */}
        {/* Profile and Bank Information Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
            paddingHorizontal: 4
          }}>
            Business Information
          </Text>

          {/* Company Profile Card */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="business" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Company Profile</Text>
              </View>
              <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>View/Edit</Text>
              </TouchableOpacity>
            </View>

            {profileData.companyName ? (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '500', marginBottom: 4 }}>{profileData.companyName}</Text>
                {profileData.address && <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>{profileData.address}</Text>}
                {profileData.phone && <Text style={{ color: colors.textSecondary }}>Phone: {profileData.phone}</Text>}

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primary,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                    marginTop: 12
                  }}
                  onPress={async () => {
                    try {
                      const content = `Company Name: ${profileData.companyName}
Address: ${profileData.address}
Phone: ${profileData.phone}
Email: ${profileData.email}
GST Number: ${profileData.gstNumber}
PAN Number: ${profileData.panNumber}`;

                      await Clipboard.setStringAsync(content);
                      Alert.alert('Success', 'Profile information copied to clipboard');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to copy profile information');
                    }
                  }}
                >
                  <Ionicons name="copy" size={18} color="white" style={{ marginRight: 6 }} />
                  <Text style={{ color: 'white', fontWeight: '600' }}>Copy Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: 8, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>No company profile set up yet</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8
                  }}
                  onPress={() => setProfileModalVisible(true)}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Set Up Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bank Details Card */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="card" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Bank Details</Text>
              </View>
              <TouchableOpacity onPress={() => setBankModalVisible(true)}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>View/Edit</Text>
              </TouchableOpacity>
            </View>

            {bankData.bankName ? (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '500', marginBottom: 4 }}>{bankData.bankName} - {bankData.branchName}</Text>
                {bankData.accountName && <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Account: {bankData.accountName}</Text>}
                {bankData.accountNumber && <Text style={{ color: colors.textSecondary }}>A/C No: {bankData.accountNumber}</Text>}

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primary,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                    marginTop: 12
                  }}
                  onPress={async () => {
                    try {
                      const content = `Bank Name: ${bankData.bankName}
Branch: ${bankData.branchName}
Account Name: ${bankData.accountName}
Account Number: ${bankData.accountNumber}
IFSC Code: ${bankData.ifscCode}`;

                      await Clipboard.setStringAsync(content);
                      Alert.alert('Success', 'Bank information copied to clipboard');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to copy bank information');
                    }
                  }}
                >
                  <Ionicons name="copy" size={18} color="white" style={{ marginRight: 6 }} />
                  <Text style={{ color: 'white', fontWeight: '600' }}>Copy Bank Details</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: 8, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>No bank details set up yet</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8
                  }}
                  onPress={() => setBankModalVisible(true)}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Set Up Bank Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
      {/* Advance Insight Modal */}
      <AdvanceInsightModal
        visible={advanceInsightVisible}
        onClose={() => setAdvanceInsightVisible(false)}
        stats={billStats}
        bills={bills || []}
      />
      {/* Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} activeOpacity={1} onPress={() => setProfileModalVisible(false)} />
          <View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: colors.card,
            padding: 20,
            maxHeight: '90%',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            overflow: 'hidden',
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1, textAlign: 'center' }}>Company Profile</Text>
                <TouchableOpacity onPress={() => setProfileModalVisible(false)} style={{ position: 'absolute', right: 0, top: 0, padding: 4 }}>
                  <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Company Name</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={profileData.companyName}
                  onChangeText={(text) => setProfileData({ ...profileData, companyName: text })}
                  placeholder="Enter company name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Owner Name</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={profileData.ownerName}
                  onChangeText={(text) => setProfileData({ ...profileData, ownerName: text })}
                  placeholder="Enter owner name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Address</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text,
                    height: 80,
                    textAlignVertical: 'top'
                  }}
                  value={profileData.address}
                  onChangeText={(text) => setProfileData({ ...profileData, address: text })}
                  placeholder="Enter company address"
                  placeholderTextColor={colors.textSecondary}
                  multiline={true}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Phone Number</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Email</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={profileData.email}
                  onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                  placeholder="Enter email address"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>GST Number</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={profileData.gstNumber}
                  onChangeText={(text) => setProfileData({ ...profileData, gstNumber: text })}
                  placeholder="Enter GST number"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>PAN Number</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={profileData.panNumber}
                  onChangeText={(text) => setProfileData({ ...profileData, panNumber: text })}
                  placeholder="Enter PAN number"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 14,
                    alignItems: 'center'
                  }}
                  onPress={() => setProfileModalVisible(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    padding: 14,
                    alignItems: 'center'
                  }}
                  onPress={async () => {
                    try {
                      await AsyncStorage.setItem('profile_data', JSON.stringify(profileData));
                      setProfileModalVisible(false);
                      Alert.alert('Success', 'Profile information saved successfully');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to save profile information');
                    }
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Bank Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bankModalVisible}
        onRequestClose={() => setBankModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} activeOpacity={1} onPress={() => setBankModalVisible(false)} />
          <View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: colors.card,
            padding: 20,
            maxHeight: '90%',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            overflow: 'hidden',
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1, textAlign: 'center' }}>Bank Details</Text>
                <TouchableOpacity onPress={() => setBankModalVisible(false)} style={{ position: 'absolute', right: 0, top: 0, padding: 4 }}>
                  <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Account Name</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={bankData.accountName}
                  onChangeText={(text) => setBankData({ ...bankData, accountName: text })}
                  placeholder="Enter account name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Account Number</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={bankData.accountNumber}
                  onChangeText={(text) => setBankData({ ...bankData, accountNumber: text })}
                  placeholder="Enter account number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Bank Name</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={bankData.bankName}
                  onChangeText={(text) => setBankData({ ...bankData, bankName: text })}
                  placeholder="Enter bank name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Branch Name</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={bankData.branchName}
                  onChangeText={(text) => setBankData({ ...bankData, branchName: text })}
                  placeholder="Enter branch name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>IFSC Code</Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text
                  }}
                  value={bankData.ifscCode}
                  onChangeText={(text) => setBankData({ ...bankData, ifscCode: text })}
                  placeholder="Enter IFSC code"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 14,
                    alignItems: 'center'
                  }}
                  onPress={() => setBankModalVisible(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    padding: 14,
                    alignItems: 'center'
                  }}
                  onPress={async () => {
                    try {
                      await AsyncStorage.setItem('bank_data', JSON.stringify(bankData));
                      setBankModalVisible(false);
                      Alert.alert('Success', 'Bank information saved successfully');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to save bank information');
                    }
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}





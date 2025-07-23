import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenLayout from "../components/ScreenLayout";
import { useTheme } from "../contexts/ThemeContext";
import { deleteAllImages, getSavedImages } from "../utils/imageUtils";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllTransportBills,
  getAllOwnerData,
  exportAllData,
  importAllData,
  deleteAllTransportBills,
  deleteAllOwnerData,
  clearAllData
} from "../utils/dataUtils";
import { ProfileData, BankData } from '../models/types';

const SectionHeader = ({ icon, title }: { icon: keyof typeof Ionicons.glyphMap, title: string }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: 6 }} />
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
    </View>
  );
};

const ModalHeader = ({ title, onClose }: { title: string, onClose: () => void }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1, textAlign: 'center' }}>{title}</Text>
      <TouchableOpacity onPress={onClose} style={{ position: 'absolute', right: 0, top: 0, padding: 4 }}>
        <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const [imageCount, setImageCount] = useState(0);
  const [billCount, setBillCount] = useState(0);
  const [ownerDataCount, setOwnerDataCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    companyName: '', ownerName: '', address: '', phone: '', email: '', gstNumber: '', panNumber: '',
  });
  const [bankData, setBankData] = useState<BankData>({
    accountName: '', accountNumber: '', bankName: '', branchName: '', ifscCode: '',
  });
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);

  useEffect(() => {
    loadDataCounts();
    loadProfileData();
    loadBankData();
  }, []);

  const loadProfileData = async () => {
    try {
      const data = await AsyncStorage.getItem('profile_data');
      if (data) setProfileData(JSON.parse(data));
    } catch (error) { }
  };
  const saveProfileData = async (data: ProfileData) => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('profile_data', JSON.stringify(data));
      setProfileData(data);
      setProfileModalVisible(false);
      Alert.alert('Success', 'Profile information saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile information');
    } finally { setLoading(false); }
  };
  const loadBankData = async () => {
    try {
      const data = await AsyncStorage.getItem('bank_data');
      if (data) setBankData(JSON.parse(data));
    } catch (error) { }
  };
  const saveBankData = async (data: BankData) => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('bank_data', JSON.stringify(data));
      setBankData(data);
      setBankModalVisible(false);
      Alert.alert('Success', 'Bank information saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save bank information');
    } finally { setLoading(false); }
  };
  const loadDataCounts = async () => {
    try {
      const [images, bills, ownerData] = await Promise.all([
        getSavedImages(),
        getAllTransportBills(),
        getAllOwnerData()
      ]);
      setImageCount(images.length);
      setBillCount(bills.success ? bills.data?.length || 0 : 0);
      setOwnerDataCount(ownerData.success ? ownerData.data?.length || 0 : 0);
    } catch { }
  };

  // --- Data Management Actions ---
  const handleDelete = async (type: 'images' | 'bills' | 'owner' | 'all') => {
    setIsDeleting(true);
    try {
      let result;
      if (type === 'images') result = await deleteAllImages();
      else if (type === 'bills') result = await deleteAllTransportBills();
      else if (type === 'owner') result = await deleteAllOwnerData();
      else result = await clearAllData();
      if (result.success) {
        Alert.alert('Success', `Successfully deleted ${type === 'all' ? 'all data' : type}.`);
        await loadDataCounts();
      } else {
        Alert.alert('Error', result.error || `Failed to delete ${type}`);
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getThemeDisplayText = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'System';
    }
  };

  return (
    <ScreenLayout title="Settings" showBackButton={true}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ gap: 32 }}>

          {/* Profile Section */}
          <View>
            <SectionHeader icon="person" title="Profile Settings" />
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => setProfileModalVisible(true)}
                style={{ backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                accessibilityLabel="Edit Company Profile"
                testID="edit-company-profile"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="business" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  <View>
                    <Text style={{ color: colors.text, fontSize: 16 }}>Company Profile</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{profileData.companyName ? profileData.companyName : 'Not set'}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBankModalVisible(true)}
                style={{ backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                accessibilityLabel="Edit Bank Details"
                testID="edit-bank-details"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="card" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  <View>
                    <Text style={{ color: colors.text, fontSize: 16 }}>Bank Details</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{bankData.bankName ? bankData.bankName : 'Not set'}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* General Section */}
          <View>
            <SectionHeader icon="settings" title="General Settings" />
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={{ backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                accessibilityLabel="Toggle Theme"
                testID="toggle-theme"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="color-palette" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  <Text style={{ color: colors.text, fontSize: 16 }}>Theme</Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{getThemeDisplayText()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Data Management Section */}
          <View>
            <SectionHeader icon="trash" title="Data Management" />
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleDelete('bills')}
                disabled={isDeleting}
                style={{ backgroundColor: billCount > 0 ? '#DC2626' : colors.card, borderColor: billCount > 0 ? '#DC2626' : colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: isDeleting ? 0.6 : 1 }}
                accessibilityLabel="Delete Transport Bills"
                testID="delete-transport-bills"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="document-text" size={20} color={billCount > 0 ? 'white' : colors.primary} style={{ marginRight: 12 }} />
                  <Text style={{ color: billCount > 0 ? 'white' : colors.text, fontSize: 16, fontWeight: billCount > 0 ? '600' : 'normal' }}>Delete Transport Bills</Text>
                </View>
                <Text style={{ color: billCount > 0 ? 'rgba(255,255,255,0.8)' : colors.textSecondary, fontSize: 14 }}>{billCount} bills</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete('owner')}
                disabled={isDeleting}
                style={{ backgroundColor: ownerDataCount > 0 ? '#DC2626' : colors.card, borderColor: ownerDataCount > 0 ? '#DC2626' : colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: isDeleting ? 0.6 : 1 }}
                accessibilityLabel="Delete Owner Records"
                testID="delete-owner-records"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="folder" size={20} color={ownerDataCount > 0 ? 'white' : colors.primary} style={{ marginRight: 12 }} />
                  <Text style={{ color: ownerDataCount > 0 ? 'white' : colors.text, fontSize: 16, fontWeight: ownerDataCount > 0 ? '600' : 'normal' }}>Delete Owner Records</Text>
                </View>
                <Text style={{ color: ownerDataCount > 0 ? 'rgba(255,255,255,0.8)' : colors.textSecondary, fontSize: 14 }}>{ownerDataCount} records</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete('all')}
                disabled={isDeleting}
                style={{ backgroundColor: (billCount + ownerDataCount) > 0 ? '#7F1D1D' : colors.card, borderColor: (billCount + ownerDataCount) > 0 ? '#7F1D1D' : colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: isDeleting ? 0.6 : 1 }}
                accessibilityLabel="Delete Everything"
                testID="delete-everything"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="nuclear" size={20} color={(billCount + ownerDataCount) > 0 ? 'white' : colors.primary} style={{ marginRight: 12 }} />
                  <Text style={{ color: (billCount + ownerDataCount) > 0 ? 'white' : colors.text, fontSize: 16, fontWeight: (billCount + ownerDataCount) > 0 ? '600' : 'normal' }}>{isDeleting ? 'Deleting...' : 'Delete Everything'}</Text>
                </View>
                <Text style={{ color: (billCount + ownerDataCount) > 0 ? 'rgba(255,255,255,0.8)' : colors.textSecondary, fontSize: 14 }}>{billCount + ownerDataCount} items</Text>
              </TouchableOpacity>
              {isDeleting && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    setLoading(true);
                    // Check if there is any data to export
                    const bills = await getAllTransportBills();
                    const owners = await getAllOwnerData();
                    if ((bills.success ? bills.data?.length : 0) === 0 && (owners.success ? owners.data?.length : 0) === 0) {
                      Alert.alert('Nothing to Export', 'There is no data to export.');
                      setLoading(false);
                      return;
                    }
                    const result = await exportAllData();
                    if (result.success && result.data) {
                      const fileUri = FileSystem.documentDirectory + 'myapp_export.json';
                      await FileSystem.writeAsStringAsync(fileUri, result.data, { encoding: FileSystem.EncodingType.UTF8 });
                      await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
                    } else {
                      Alert.alert('Export Failed', result.error || 'Could not export data');
                    }
                  } catch {
                    Alert.alert('Export Failed', 'Could not export data');
                  } finally { setLoading(false); }
                }}
                style={{ backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}
                accessibilityLabel="Export All Data"
                testID="export-all-data"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cloud-download" size={20} color={'white'} style={{ marginRight: 12 }} />
                  <Text style={{ color: 'white', fontSize: 16 }}>Export All Data</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 14 }}>JSON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    setLoading(true);
                    const picker = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
                    const uri = picker.assets && picker.assets[0]?.uri;
                    if (uri) {
                      const json = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
                      let parsed;
                      try {
                        parsed = JSON.parse(json);
                      } catch {
                        Alert.alert('Import Failed', 'The selected file is not valid JSON.');
                        setLoading(false);
                        return;
                      }
                      if (!parsed || !Array.isArray(parsed.owner_data) || !Array.isArray(parsed.transport_bills)) {
                        Alert.alert('Import Failed', 'The file does not contain valid app data.');
                        setLoading(false);
                        return;
                      }
                      if (parsed.owner_data.length === 0 && parsed.transport_bills.length === 0) {
                        Alert.alert('Import Failed', 'The file contains no data to import.');
                        setLoading(false);
                        return;
                      }
                      const result = await importAllData(json);
                      if (result.success) {
                        Alert.alert('Import Success', `Imported ${parsed.owner_data.length} owner records and ${parsed.transport_bills.length} bills.`);
                        await loadDataCounts();
                      } else {
                        Alert.alert('Import Failed', result.error || 'Could not import data');
                      }
                    }
                  } catch {
                    Alert.alert('Import Failed', 'Could not import data');
                  } finally { setLoading(false); }
                }}
                style={{ backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}
                accessibilityLabel="Import All Data"
                testID="import-all-data"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cloud-upload" size={20} color={'white'} style={{ marginRight: 12 }} />
                  <Text style={{ color: 'white', fontSize: 16 }}>Import All Data</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 14 }}>JSON</Text>
              </TouchableOpacity>
              {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />}
            </View>
          </View>
        </View>
      </ScrollView>

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
              {/* Profile Form */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Company Name</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={profileData.companyName} onChangeText={text => setProfileData({ ...profileData, companyName: text })} placeholder="Enter company name" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Owner Name</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={profileData.ownerName} onChangeText={text => setProfileData({ ...profileData, ownerName: text })} placeholder="Enter owner name" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Address</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text, height: 80, textAlignVertical: 'top' }} value={profileData.address} onChangeText={text => setProfileData({ ...profileData, address: text })} placeholder="Enter company address" placeholderTextColor={colors.textSecondary} multiline />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Phone Number</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={profileData.phone} onChangeText={text => setProfileData({ ...profileData, phone: text })} placeholder="Enter phone number" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Email</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={profileData.email} onChangeText={text => setProfileData({ ...profileData, email: text })} placeholder="Enter email address" placeholderTextColor={colors.textSecondary} keyboardType="email-address" />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>GST Number</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={profileData.gstNumber} onChangeText={text => setProfileData({ ...profileData, gstNumber: text })} placeholder="Enter GST number" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>PAN Number</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={profileData.panNumber} onChangeText={text => setProfileData({ ...profileData, panNumber: text })} placeholder="Enter PAN number" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 14, alignItems: 'center' }} onPress={() => setProfileModalVisible(false)}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: 'center' }} onPress={() => saveProfileData(profileData)}>
                  {loading ? <ActivityIndicator size="small" color="white" /> : <Text style={{ color: 'white', fontWeight: '600' }}>Save</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Bank Modal */}
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
              {/* Bank Form */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Account Name</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={bankData.accountName} onChangeText={text => setBankData({ ...bankData, accountName: text })} placeholder="Enter account name" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Account Number</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={bankData.accountNumber} onChangeText={text => setBankData({ ...bankData, accountNumber: text })} placeholder="Enter account number" placeholderTextColor={colors.textSecondary} keyboardType="number-pad" />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Bank Name</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={bankData.bankName} onChangeText={text => setBankData({ ...bankData, bankName: text })} placeholder="Enter bank name" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>Branch Name</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={bankData.branchName} onChangeText={text => setBankData({ ...bankData, branchName: text })} placeholder="Enter branch name" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.text, marginBottom: 4, fontWeight: '500' }}>IFSC Code</Text>
                <TextInput style={{ backgroundColor: colors.background, borderColor: colors.cardBorder, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text }} value={bankData.ifscCode} onChangeText={text => setBankData({ ...bankData, ifscCode: text })} placeholder="Enter IFSC code" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 14, alignItems: 'center' }} onPress={() => setBankModalVisible(false)}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: 'center' }} onPress={() => saveBankData(bankData)}>
                  {loading ? <ActivityIndicator size="small" color="white" /> : <Text style={{ color: 'white', fontWeight: '600' }}>Save</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
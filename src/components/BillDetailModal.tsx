import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import * as Clipboard from 'expo-clipboard';
import PrintButton from "./PrintButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfileImage } from "../utils/imageUtils";
import generateOwnerTemplate from './OwnerTemplate';
import type { ProfileData, BankData } from './TransportTemplate';
import * as Haptics from 'expo-haptics';

interface BillDetailModalProps {
  visible: boolean;
  onClose: () => void;
  bill: any; // OwnerData or TransportBillData
  type: 'owner' | 'transport';
  onUpdate?: () => void;
  onDelete?: () => void;
  onGeneratePdf?: (bill: any) => void;
}

export default function BillDetailModal({ visible, onClose, bill, type, onUpdate, onDelete, onGeneratePdf }: BillDetailModalProps) {
  const { colors } = useTheme();
  const [profileData, setProfileData] = useState<ProfileData>({
    companyName: '',
    ownerName: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    logo: ''
  });
  const [bankData, setBankData] = useState<BankData>({
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    ifscCode: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load data when modal becomes visible
  React.useEffect(() => {
    if (visible && type === 'transport') {
      loadData();
    }
  }, [visible, type]);
  
  // Load profile and bank data
  const loadData = async () => {
    try {
      // Load profile data
      const profileDataStr = await AsyncStorage.getItem('profile_data');
      if (profileDataStr) {
        setProfileData(JSON.parse(profileDataStr));
      }
      
      // Load bank data
      const bankDataStr = await AsyncStorage.getItem('bank_data');
      if (bankDataStr) {
        setBankData(JSON.parse(bankDataStr));
      }
      
      // Load profile image
      const image = await getProfileImage();
      setProfileImage(image);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  if (!bill) return null;

  // Helper to render a section header
  const renderSectionHeader = (label: string) => (
    <Text style={{ color: colors.primary || '#2563eb', fontWeight: '700', fontSize: 15, marginTop: 18, marginBottom: 8 }}>{label}</Text>
  );

  // Helper to render a field
  const renderField = (label: string, value: any, isKey?: boolean) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: isKey ? 18 : 16, fontWeight: isKey ? '700' : '600' }}>{value || '-'}</Text>
    </View>
  );

  // Helper to get status color
  const getStatusColor = (status: string) => {
    if (status === 'completed') return '#22c55e';
    if (status === 'pending') return '#f59e42';
    if (status === 'cancelled') return '#ef4444';
    if (status === 'in-transit') return '#3b82f6';
    if (status === 'delivered') return '#6366f1';
    return colors.primary || '#2563eb';
  };
  
  // Generate shareable content for owner bill
  const generateOwnerShareContent = () => {
    if (!bill) return '';
    
    return `BILL DETAILS (ID #${bill.id})
------------------------------------------
Date: ${new Date(bill.date).toLocaleDateString()}
Owner: ${bill.ownerNameAndAddress || '-'}
Vehicle No: ${bill.vehicleNo || '-'}
From: ${bill.from || '-'}
To: ${bill.to || '-'}
Contact: ${bill.contactNo || '-'}
Status: ${bill.status || '-'}

AMOUNTS
------------------------------------------
Total Lorry Hire: ₹${bill.totalLorryHireRs?.toLocaleString() || '0'}
Lorry Hire Amount: ${bill.lorryHireAmount || '-'}
Other Charges: ${bill.otherChargesHamliDetentionHeight || '-'}
Balance Amount: ${bill.balanceAmt || '-'}

PARTY & BROKER
------------------------------------------
PAN No: ${bill.panNo || '-'}
Broker Name: ${bill.brokerName || '-'}
Broker PAN No: ${bill.brokerPanNo || '-'}

DRIVER & VEHICLE
------------------------------------------
Driver: ${bill.driverNameAndMob || '-'}
Licence No: ${bill.licenceNo || '-'}
Chasis No: ${bill.chasisNo || '-'}
Engine No: ${bill.engineNo || '-'}

GOODS
------------------------------------------
Packages: ${bill.packages || '-'}
Description: ${bill.description || '-'}
Weight (kg): ${bill.wtKgs || '-'}

REMARKS
------------------------------------------
${bill.remarks || 'No remarks'}`;
  };
  
  // Generate shareable content for transport bill
  const generateTransportShareContent = () => {
    if (!bill) return '';
    
    return `TRANSPORT BILL DETAILS (#${bill.bill})
------------------------------------------
Date: ${new Date(bill.date).toLocaleDateString()}
M/S: ${bill.ms || '-'}
GST No: ${bill.gstno || '-'}
Status: ${bill.status || '-'}

ROUTE & VEHICLE
------------------------------------------
From: ${bill.from || '-'}
To: ${bill.to || '-'}
Vehicle No: ${bill.vehicleNo || '-'}
Invoice No: ${bill.invoiceNo || '-'}
Consignor/Consignee: ${bill.consignorConsignee || '-'}

CHARGES & AMOUNTS
------------------------------------------
Handle Charges: ${bill.handleCharges || '-'}
Detention: ${bill.detention || '-'}
Freight: ${bill.freight || '-'}
Total: ₹${bill.total?.toLocaleString() || '0'}`;
  };
  
  // Handle share action
  const handleShare = async () => {
    try {
      const content = type === 'owner' ? generateOwnerShareContent() : generateTransportShareContent();
      const title = type === 'owner' ? `Owner Bill #${bill.id}` : `Transport Bill #${bill.bill}`;
      
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
        const content = type === 'owner' ? generateOwnerShareContent() : generateTransportShareContent();
        await Clipboard.setStringAsync(content);
        Alert.alert('Copied to clipboard', 'Bill details have been copied to your clipboard.');
      } catch (clipboardError) {
        Alert.alert('Error', 'Failed to share bill details.');
      }
    }
  };

  // Action buttons
  const renderActions = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f59e42' }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onUpdate && onUpdate(); }}>
        <Ionicons name="create" size={18} color={'white'} style={{ marginRight: 5 }} />
        <Text style={{ color: 'white', fontWeight: '600', flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">Update</Text>
      </TouchableOpacity>
      {type === 'transport' ? (
        <PrintButton
          bill={bill}
          profileData={profileData}
          bankData={bankData}
          profileImage={profileImage}
          style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
          label="PDF"
          isLoading={isLoading}
          onPrintStart={() => setIsLoading(true)}
          onPrintEnd={() => setIsLoading(false)}
        />
      ) : (
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: '#10b981' }]} 
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsLoading(true);
            try {
              const htmlContent = generateOwnerTemplate({
                bill,
                profileData,
                bankData,
                profileImage
              });
              if (Platform.OS === 'web') {
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                  alert('Please allow popups for this site to print the invoice.');
                  setIsLoading(false);
                  return;
                }
                printWindow.document.open();
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                const printScript = printWindow.document.createElement('script');
                printScript.textContent = `window.onload = function() { setTimeout(function() { window.print(); }, 500); };`;
                printWindow.document.head.appendChild(printScript);
                printWindow.focus();
              } else {
                const Print = require('expo-print');
                const Sharing = require('expo-sharing');
                const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
                const isSharingAvailable = await Sharing.isAvailableAsync();
                if (isSharingAvailable) {
                  await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Owner Bill #${bill.id}`,
                    UTI: 'com.adobe.pdf'
                  });
                } else {
                  alert('Sharing is not available on this device. PDF saved at: ' + uri);
                }
              }
            } catch (error) {
              alert('Failed to generate or share PDF. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <Ionicons name="document" size={18} color={'white'} style={{ marginRight: 4 }} />
          <Text style={{ color: 'white', fontWeight: '600', flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">{isLoading ? 'Loading...' : 'PDF'}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#7c3aed' }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleShare(); }}>
        <Ionicons name="share-social" size={18} color={'white'} style={{ marginRight: 4 }} />
        <Text style={{ color: 'white', fontWeight: '600', flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">Share</Text>
      </TouchableOpacity>
      {onDelete && (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDelete(); }}>
          <Ionicons name="trash" size={18} color={'white'} style={{ marginRight: 4 }} />
          <Text style={{ color: 'white', fontWeight: '600', flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render all fields for owner or transport
  const renderDetails = () => {
    if (type === 'owner') {
      return (
        <>
          {renderSectionHeader('Bill Info')}
          {renderField('ID', bill.id, true)}
          {renderField('Date', new Date(bill.date).toLocaleDateString())}
          {renderField('Owner Name', bill.ownerNameAndAddress, true)}
          {renderField('Vehicle No', bill.vehicleNo)}
          {renderField('From', bill.from)}
          {renderField('To', bill.to)}
          {renderField('Contact No', bill.contactNo)}
          {renderSectionHeader('Amounts')}
          {renderField('Total Lorry Hire', `₹${bill.totalLorryHireRs?.toLocaleString() || '0'}`, true)}
          {renderField('Lorry Hire Amount', bill.lorryHireAmount)}
          {renderField('Other Charges', bill.otherChargesHamliDetentionHeight)}
          {renderField('Balance Amount', bill.balanceAmt)}
          {renderSectionHeader('Party & Broker')}
          {renderField('PAN No', bill.panNo)}
          {renderField('Broker Name', bill.brokerName)}
          {renderField('Broker PAN No', bill.brokerPanNo)}
          {renderSectionHeader('Driver & Vehicle')}
          {renderField('Driver Name & Mob', bill.driverNameAndMob)}
          {renderField('Licence No', bill.licenceNo)}
          {renderField('Chasis No', bill.chasisNo)}
          {renderField('Engine No', bill.engineNo)}
          {renderSectionHeader('Insurance')}
          {renderField('Insurance Co', bill.insuranceCo)}
          {renderField('Policy No', bill.policyNo)}
          {renderField('Policy Date', bill.policyDate ? new Date(bill.policyDate).toLocaleDateString() : '')}
          {renderSectionHeader('Goods')}
          {renderField('Packages', bill.packages)}
          {renderField('Description', bill.description)}
          {renderField('Weight (kg)', bill.wtKgs)}
          {renderSectionHeader('Advances & Dates')}
          {renderField('Advance 1', bill.advAmt1)}
          {renderField('Advance Date 1', bill.advDate1 ? new Date(bill.advDate1).toLocaleDateString() : '')}
          {renderField('Advance 2', bill.advAmt2)}
          {renderField('Advance Date 2', bill.advDate2 ? new Date(bill.advDate2).toLocaleDateString() : '')}
          {renderField('Advance 3', bill.advAmt3)}
          {renderField('Advance Date 3', bill.advDate3 ? new Date(bill.advDate3).toLocaleDateString() : '')}
          {renderField('Final NEFT/IMPS ID', bill.finalNeftImpsIdno)}
          {renderField('Final Date', bill.finalDate ? new Date(bill.finalDate).toLocaleDateString() : '')}
          {renderField('Delivery Date', bill.deliveryDate ? new Date(bill.deliveryDate).toLocaleDateString() : '')}
          {renderSectionHeader('Remarks')}
          {renderField('Remarks', bill.remarks)}
        </>
      );
    } else {
      return (
        <>
          {renderSectionHeader('Bill Info')}
          {renderField('Bill #', bill.bill, true)}
          {renderField('Date', new Date(bill.date).toLocaleDateString())}
          {renderField('M/S', bill.ms, true)}
          {renderField('GST No', bill.gstno)}
          {renderField('Other Detail', bill.otherDetail)}
          {renderSectionHeader('Numbers & Dates')}
          {renderField('SR No', bill.srno)}
          {renderField('LR No', bill.lrno)}
          {renderField('LR Date', bill.lrDate ? new Date(bill.lrDate).toLocaleDateString() : '')}
          {renderSectionHeader('Route & Vehicle')}
          {renderField('From', bill.from)}
          {renderField('To', bill.to)}
          {renderField('Vehicle No', bill.vehicleNo)}
          {renderField('Invoice No', bill.invoiceNo)}
          {renderField('Consignor/Consignee', bill.consignorConsignee)}
          {renderSectionHeader('Charges & Amounts')}
          {renderField('Handle Charges', bill.handleCharges)}
          {renderField('Detention', bill.detention)}
          {renderField('Freight', bill.freight)}
          {renderField('Total', `₹${bill.total?.toLocaleString() || '0'}`, true)}
          {renderSectionHeader('Status')}
          {renderField('Status', bill.status)}
        </>
      );
    }
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
        { 
          backgroundColor: colors.background,
          borderTopWidth: 8,
          borderTopColor: getStatusColor(bill.status),
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderLeftColor: getStatusColor(bill.status),
          borderRightColor: getStatusColor(bill.status)
        }
      ]}>
        <View style={[styles.header, { 
          borderBottomWidth: 1,
          borderBottomColor: getStatusColor(bill.status)
        }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>Bill Details</Text>
            {bill.status && (
              <View style={{
                backgroundColor: getStatusColor(bill.status),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginLeft: 12,
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {bill.status}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }} contentContainerStyle={{ paddingBottom: 48 }}>
          {renderDetails()}
          {renderActions()}
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
            style={{
              marginTop: 24,
              marginBottom: 8,
              backgroundColor: colors.surface,
              borderRadius: 12,
              alignItems: 'center',
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: getStatusColor(bill.status),
            }}
          >
            <Text style={{ color: getStatusColor(bill.status), fontWeight: '700', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
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
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 6,
    minWidth: 80,
    maxWidth: 160,
    overflow: 'hidden',
  },
}); 
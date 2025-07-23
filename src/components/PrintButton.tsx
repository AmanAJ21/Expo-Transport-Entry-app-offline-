import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// @ts-ignore
import * as Print from 'expo-print';
import generateTransportTemplate from './TransportTemplate';

interface PrintButtonProps {
  bill: any;
  profileData: any;
  bankData: any;
  profileImage: string | null;
  style?: any;
  textStyle?: any;
  iconSize?: number;
  label?: string;
  onPrintStart?: () => void;
  onPrintEnd?: () => void;
  isLoading?: boolean;
}

/**
 * A reusable print button component that handles PDF generation and printing
 */
const PrintButton: React.FC<PrintButtonProps> = ({
  bill,
  profileData,
  bankData,
  profileImage,
  style,
  textStyle,
  iconSize = 18,
  label = 'PDF',
  onPrintStart,
  onPrintEnd,
  isLoading = false
}) => {
  const handlePrint = async () => {
    // Validate profileData, bankData, and profileImage
    const missingFields = [];
    if (!profileData || !profileData.companyName || !profileData.address || !profileData.phone || !profileData.email || !profileData.gstNumber || !profileData.panNumber) {
      missingFields.push('Profile Data');
    }
    if (!bankData || !bankData.accountName || !bankData.accountNumber || !bankData.bankName || !bankData.branchName || !bankData.ifscCode) {
      missingFields.push('Bank Data');
    }
    if (!profileImage) {
      missingFields.push('Profile Image');
    }
    if (missingFields.length > 0) {
      alert(`Cannot print PDF. Please ensure the following information is filled: ${missingFields.join(', ')}`);
      if (onPrintEnd) onPrintEnd();
      return;
    }
    if (onPrintStart) onPrintStart();
    
    try {
      // Generate HTML content using the TransportTemplate component
      const htmlContent = generateTransportTemplate({
        bill,
        profileData,
        bankData,
        profileImage
      });

      if (Platform.OS === 'web') {
        try {
          // Create a new window with the print content
          const printWindow = window.open('', '_blank');
          
          if (!printWindow) {
            console.error('Popup blocked');
            alert('Please allow popups for this site to print the invoice.');
            if (onPrintEnd) onPrintEnd();
            return;
          }
          
          // Write the HTML content to the new window
          printWindow.document.open();
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          
          // Add a script to automatically trigger print when loaded
          const printScript = printWindow.document.createElement('script');
          printScript.textContent = `
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          `;
          printWindow.document.head.appendChild(printScript);
          
          // Focus the window
          printWindow.focus();
        } catch (error) {
          console.error('Error creating print window:', error);
          alert('Failed to open print window. Please try again.');
        }
      } else {
        // For native platforms, generate PDF and share
        try {
          // Generate PDF from HTML
          const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false
          });
          // Check if sharing is available
          const isSharingAvailable = await Sharing.isAvailableAsync();
          if (isSharingAvailable) {
            await Sharing.shareAsync(uri, {
              mimeType: 'application/pdf',
              dialogTitle: `Transport Bill ${bill.bill ? `#${bill.bill}` : ''}`,
              UTI: 'com.adobe.pdf'
            });
          } else {
            alert('Sharing is not available on this device. PDF saved at: ' + uri);
          }
        } catch (error) {
          console.error('Error generating or sharing PDF:', error);
          alert('Failed to generate or share PDF. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      if (onPrintEnd) onPrintEnd();
    }
  };

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        ...style
      }}
      onPress={handlePrint}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" style={{ marginRight: 4 }} />
      ) : (
        <Ionicons name="document" size={iconSize} color="white" style={{ marginRight: 4 }} />
      )}
      <Text style={{ color: 'white', fontWeight: '600', ...textStyle }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default PrintButton;
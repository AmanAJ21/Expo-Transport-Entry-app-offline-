import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { TransportBillData, BillStatus, addTransportBill, updateTransportBill } from "../utils/dataUtils";
import * as Haptics from 'expo-haptics';

interface AddBillModalProps {
  visible: boolean;
  onClose: () => void;
  onBillAdded?: (bill: TransportBillData) => void;
  title?: string;
  mode?: 'transport' | 'owner';
  initialData?: Partial<TransportBillData> | null;
}

export default function AddBillModal({
  visible,
  onClose,
  onBillAdded,
  title = "Add New Bill",
  mode = 'transport',
  initialData = null,
}: AddBillModalProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<any>({
    bill: '',
    date: new Date(),
    ms: '',
    gstno: '',
    otherDetail: '',
    srno: '',
    lrno: '',
    lrDate: new Date(),
    from: '',
    to: '',
    vehicleNo: '',
    invoiceNo: '',
    consignorConsignee: '',
    handleCharges: '',
    detention: '',
    freight: '',
    total: '',
    status: 'pending' as BillStatus,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        // Convert numeric values to strings for form inputs
        bill: initialData.bill ? String(initialData.bill) : '',
        srno: initialData.srno ? String(initialData.srno) : '',
        lrno: initialData.lrno ? String(initialData.lrno) : '',
        handleCharges: initialData.handleCharges ? String(initialData.handleCharges) : '',
        detention: initialData.detention ? String(initialData.detention) : '',
        freight: initialData.freight ? String(initialData.freight) : '',
        total: initialData.total ? String(initialData.total) : '',
        // Convert dates
        date: initialData.date ? new Date(initialData.date) : new Date(),
        lrDate: initialData.lrDate ? new Date(initialData.lrDate) : new Date(),
      });
    } else {
      resetForm();
    }
    // eslint-disable-next-line
  }, [initialData, visible]);

  const resetForm = () => {
    setFormData({
      bill: '',
      date: new Date(),
      ms: '',
      gstno: '',
      otherDetail: '',
      srno: '',
      lrno: '',
      lrDate: new Date(),
      from: '',
      to: '',
      vehicleNo: '',
      invoiceNo: '',
      consignorConsignee: '',
      handleCharges: '',
      detention: '',
      freight: '',
      total: '',
      status: 'pending',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const requiredFields = [
      { field: 'bill', label: 'Bill Number' },
      { field: 'ms', label: 'M/S' },
      { field: 'gstno', label: 'GST Number' },
      { field: 'from', label: 'From' },
      { field: 'to', label: 'To' },
      { field: 'vehicleNo', label: 'Vehicle Number' },
      { field: 'lrno', label: 'LR Number' },
      { field: 'srno', label: 'SR Number' },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert("Validation Error", `${label} is required`);
        return false;
      }
    }

    // Validate numeric fields
    const numericFields = ['bill', 'srno', 'lrno', 'handleCharges', 'detention', 'freight', 'total'];
    for (const field of numericFields) {
      const value = formData[field as keyof typeof formData] as string;
      if (value && isNaN(Number(value))) {
        Alert.alert("Validation Error", `${field} must be a valid number`);
        return false;
      }
    }

    return true;
  };

  const calculateTotal = () => {
    const handleCharges = parseFloat(formData.handleCharges) || 0;
    const detention = parseFloat(formData.detention) || 0;
    const freight = parseFloat(formData.freight) || 0;
    const total = handleCharges + detention + freight;
    
    setFormData(prev => ({
      ...prev,
      total: total.toString()
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const billData: TransportBillData = {
        bill: parseInt(formData.bill),
        date: formData.date,
        ms: formData.ms,
        gstno: formData.gstno,
        otherDetail: formData.otherDetail,
        srno: parseInt(formData.srno),
        lrno: parseInt(formData.lrno),
        lrDate: formData.lrDate,
        from: formData.from,
        to: formData.to,
        vehicleNo: formData.vehicleNo,
        invoiceNo: formData.invoiceNo,
        consignorConsignee: formData.consignorConsignee,
        handleCharges: parseFloat(formData.handleCharges) || 0,
        detention: parseFloat(formData.detention) || 0,
        freight: parseFloat(formData.freight) || 0,
        total: parseFloat(formData.total) || 0,
        status: formData.status,
      };

      let result;
      if (initialData && initialData.bill) {
        result = await updateTransportBill(billData);
      } else {
        result = await addTransportBill(billData);
      }
      
      if (result.success) {
        Alert.alert("Success", "Bill saved successfully!");
        onBillAdded?.(billData);
        handleClose();
      } else {
        Alert.alert("Error", result.error || "Failed to save bill");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'numeric' | 'email-address';
      multiline?: boolean;
      required?: boolean;
    }
  ) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6
      }}>
        {label} {options?.required && <Text style={{ color: '#EF4444' }}>*</Text>}
      </Text>
      <TextInput
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          color: colors.text,
          fontSize: 16,
          minHeight: options?.multiline ? 80 : 44,
          textAlignVertical: options?.multiline ? 'top' : 'center',
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={options?.placeholder || label}
        placeholderTextColor={colors.textSecondary}
        keyboardType={options?.keyboardType || 'default'}
        multiline={options?.multiline}
      />
    </View>
  );

  const statusOptions: { value: BillStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: '#F59E0B' },
    { value: 'in-transit', label: 'In Transit', color: '#3B82F6' },
    { value: 'delivered', label: 'Delivered', color: '#10B981' },
    { value: 'completed', label: 'Completed', color: '#059669' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={onClose} />
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '90%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: colors.background,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        }}>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleClose(); }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: '600'
          }}>
            {title}
          </Text>
          
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleSave(); }}
            disabled={loading}
            style={{
              backgroundColor: '#3B82F6',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Basic Information */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16
            }}>
              Basic Information
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Bill Number', formData.bill, (text) => 
                  setFormData(prev => ({ ...prev, bill: text })), 
                  { keyboardType: 'numeric', required: true }
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('SR Number', formData.srno, (text) => 
                  setFormData(prev => ({ ...prev, srno: text })), 
                  { keyboardType: 'numeric', required: true }
                )}
              </View>
            </View>

            {renderInput('M/S (Company)', formData.ms, (text) => 
              setFormData(prev => ({ ...prev, ms: text })), 
              { required: true }
            )}

            {renderInput('GST Number', formData.gstno, (text) => 
              setFormData(prev => ({ ...prev, gstno: text })), 
              { required: true }
            )}

            {renderInput('Other Details', formData.otherDetail, (text) => 
              setFormData(prev => ({ ...prev, otherDetail: text })), 
              { multiline: true }
            )}
          </View>

          {/* Transport Details */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16
            }}>
              Transport Details
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('From', formData.from, (text) => 
                  setFormData(prev => ({ ...prev, from: text })), 
                  { required: true }
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('To', formData.to, (text) => 
                  setFormData(prev => ({ ...prev, to: text })), 
                  { required: true }
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Vehicle Number', formData.vehicleNo, (text) => 
                  setFormData(prev => ({ ...prev, vehicleNo: text })), 
                  { required: true }
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('LR Number', formData.lrno, (text) => 
                  setFormData(prev => ({ ...prev, lrno: text })), 
                  { keyboardType: 'numeric', required: true }
                )}
              </View>
            </View>

            {renderInput('Invoice Number', formData.invoiceNo, (text) => 
              setFormData(prev => ({ ...prev, invoiceNo: text }))
            )}

            {renderInput('Consignor/Consignee', formData.consignorConsignee, (text) => 
              setFormData(prev => ({ ...prev, consignorConsignee: text }))
            )}
          </View>

          {/* Financial Details */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16
            }}>
              Financial Details
            </Text>

            {renderInput('Freight Charges', formData.freight, (text) => {
              setFormData(prev => ({ ...prev, freight: text }));
            }, { keyboardType: 'numeric' })}

            {renderInput('Handle Charges', formData.handleCharges, (text) => {
              setFormData(prev => ({ ...prev, handleCharges: text }));
            }, { keyboardType: 'numeric' })}

            {renderInput('Detention Charges', formData.detention, (text) => {
              setFormData(prev => ({ ...prev, detention: text }));
            }, { keyboardType: 'numeric' })}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Total Amount', formData.total, (text) => 
                  setFormData(prev => ({ ...prev, total: text })), 
                  { keyboardType: 'numeric' }
                )}
              </View>
              <TouchableOpacity
                onPress={calculateTotal}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginLeft: 12,
                  marginTop: 22,
                }}
              >
                <Ionicons name="calculator" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Selection */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16
            }}>
              Status
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setFormData(prev => ({ ...prev, status: option.value }))}
                    style={{
                      backgroundColor: formData.status === option.value ? option.color : colors.surface,
                      borderColor: option.color,
                      borderWidth: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{
                      color: formData.status === option.value ? 'white' : colors.text,
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
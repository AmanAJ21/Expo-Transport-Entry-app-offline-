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
import { OwnerData, addOwnerData, updateOwnerData } from "../utils/dataUtils";

interface AddOwnerDataModalProps {
  visible: boolean;
  onClose: () => void;
  onOwnerDataAdded?: (ownerData: OwnerData) => void;
  title?: string;
  initialData?: Partial<OwnerData> | null;
}

export default function AddOwnerDataModal({
  visible,
  onClose,
  onOwnerDataAdded,
  title = "Add Owner Record",
  initialData = null,
}: AddOwnerDataModalProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<any>({
    id: '',
    date: new Date(),
    contactNo: '',
    vehicleNo: '',
    from: '',
    to: '',
    ownerNameAndAddress: '',
    panNo: '',
    driverNameAndMob: '',
    licenceNo: '',
    chasisNo: '',
    engineNo: '',
    insuranceCo: '',
    policyNo: '',
    policyDate: new Date(),
    srno: '',
    lrno: '',
    packages: '',
    description: '',
    wtKgs: '',
    remarks: '',
    brokerName: '',
    brokerPanNo: '',
    lorryHireAmount: '',
    accNo: '',
    otherChargesHamliDetentionHeight: '',
    totalLorryHireRs: '',
    advAmt1: '',
    advDate1: new Date(),
    neftImpsIdno1: '',
    advAmt2: '',
    advDate2: new Date(),
    neftImpsIdno2: '',
    advAmt3: '',
    advDate3: new Date(),
    neftImpsIdno3: '',
    balanceAmt: '',
    otherChargesHamaliDetentionHeight: '',
    deductionInClaimPenalty: '',
    finalNeftImpsIdno: '',
    finalDate: new Date(),
    deliveryDate: new Date(),
    status: 'pending',
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        // Convert numeric values to strings for form inputs
        id: initialData.id ? String(initialData.id) : '',
        contactNo: initialData.contactNo ? String(initialData.contactNo) : '',
        srno: initialData.srno ? String(initialData.srno) : '',
        lrno: initialData.lrno ? String(initialData.lrno) : '',
        packages: initialData.packages ? String(initialData.packages) : '',
        wtKgs: initialData.wtKgs ? String(initialData.wtKgs) : '',
        lorryHireAmount: initialData.lorryHireAmount ? String(initialData.lorryHireAmount) : '',
        accNo: initialData.accNo ? String(initialData.accNo) : '',
        otherChargesHamliDetentionHeight: initialData.otherChargesHamliDetentionHeight ? String(initialData.otherChargesHamliDetentionHeight) : '',
        totalLorryHireRs: initialData.totalLorryHireRs ? String(initialData.totalLorryHireRs) : '',
        advAmt1: initialData.advAmt1 ? String(initialData.advAmt1) : '',
        advAmt2: initialData.advAmt2 ? String(initialData.advAmt2) : '',
        advAmt3: initialData.advAmt3 ? String(initialData.advAmt3) : '',
        balanceAmt: initialData.balanceAmt ? String(initialData.balanceAmt) : '',
        // Convert dates
        date: initialData.date ? new Date(initialData.date) : new Date(),
        policyDate: initialData.policyDate ? new Date(initialData.policyDate) : new Date(),
        advDate1: initialData.advDate1 ? new Date(initialData.advDate1) : new Date(),
        advDate2: initialData.advDate2 ? new Date(initialData.advDate2) : new Date(),
        advDate3: initialData.advDate3 ? new Date(initialData.advDate3) : new Date(),
        finalDate: initialData.finalDate ? new Date(initialData.finalDate) : new Date(),
        deliveryDate: initialData.deliveryDate ? new Date(initialData.deliveryDate) : new Date(),
      });
    } else {
      resetForm();
    }
    // eslint-disable-next-line
  }, [initialData, visible]);

  const resetForm = () => {
    setFormData({
      id: '',
      date: new Date(),
      contactNo: '',
      vehicleNo: '',
      from: '',
      to: '',
      ownerNameAndAddress: '',
      panNo: '',
      driverNameAndMob: '',
      licenceNo: '',
      chasisNo: '',
      engineNo: '',
      insuranceCo: '',
      policyNo: '',
      policyDate: new Date(),
      srno: '',
      lrno: '',
      packages: '',
      description: '',
      wtKgs: '',
      remarks: '',
      brokerName: '',
      brokerPanNo: '',
      lorryHireAmount: '',
      accNo: '',
      otherChargesHamliDetentionHeight: '',
      totalLorryHireRs: '',
      advAmt1: '',
      advDate1: new Date(),
      neftImpsIdno1: '',
      advAmt2: '',
      advDate2: new Date(),
      neftImpsIdno2: '',
      advAmt3: '',
      advDate3: new Date(),
      neftImpsIdno3: '',
      balanceAmt: '',
      otherChargesHamaliDetentionHeight: '',
      deductionInClaimPenalty: '',
      finalNeftImpsIdno: '',
      finalDate: new Date(),
      deliveryDate: new Date(),
      status: 'pending',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const requiredFields = [
      { field: 'id', label: 'ID' },
      { field: 'contactNo', label: 'Contact Number' },
      { field: 'vehicleNo', label: 'Vehicle Number' },
      { field: 'from', label: 'From' },
      { field: 'to', label: 'To' },
      { field: 'ownerNameAndAddress', label: 'Owner Name & Address' },
      { field: 'driverNameAndMob', label: 'Driver Name & Mobile' },
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
    const numericFields = ['id', 'contactNo', 'srno', 'lrno', 'packages', 'wtKgs', 'lorryHireAmount', 'accNo', 'otherChargesHamliDetentionHeight', 'totalLorryHireRs', 'advAmt1', 'advAmt2', 'advAmt3', 'balanceAmt'];
    for (const field of numericFields) {
      const value = formData[field as keyof typeof formData] as string;
      if (value && isNaN(Number(value))) {
        Alert.alert("Validation Error", `${field} must be a valid number`);
        return false;
      }
    }

    return true;
  };

  const calculateBalance = () => {
    const totalHire = parseFloat(formData.totalLorryHireRs) || 0;
    const adv1 = parseFloat(formData.advAmt1) || 0;
    const adv2 = parseFloat(formData.advAmt2) || 0;
    const adv3 = parseFloat(formData.advAmt3) || 0;
    const otherCharges = parseFloat(formData.otherChargesHamliDetentionHeight) || 0;
    
    const balance = totalHire - (adv1 + adv2 + adv3) + otherCharges;
    
    setFormData(prev => ({
      ...prev,
      balanceAmt: balance.toString()
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const ownerData: OwnerData = {
        id: parseInt(formData.id),
        date: formData.date,
        contactNo: parseInt(formData.contactNo),
        vehicleNo: formData.vehicleNo,
        from: formData.from,
        to: formData.to,
        ownerNameAndAddress: formData.ownerNameAndAddress,
        panNo: formData.panNo,
        driverNameAndMob: formData.driverNameAndMob,
        licenceNo: formData.licenceNo,
        chasisNo: formData.chasisNo,
        engineNo: formData.engineNo,
        insuranceCo: formData.insuranceCo,
        policyNo: formData.policyNo,
        policyDate: formData.policyDate,
        srno: parseInt(formData.srno),
        lrno: parseInt(formData.lrno),
        packages: parseInt(formData.packages) || 0,
        description: formData.description,
        wtKgs: parseFloat(formData.wtKgs) || 0,
        remarks: formData.remarks,
        brokerName: formData.brokerName,
        brokerPanNo: formData.brokerPanNo,
        lorryHireAmount: parseFloat(formData.lorryHireAmount) || 0,
        accNo: parseInt(formData.accNo) || 0,
        otherChargesHamliDetentionHeight: parseFloat(formData.otherChargesHamliDetentionHeight) || 0,
        totalLorryHireRs: parseFloat(formData.totalLorryHireRs) || 0,
        advAmt1: parseFloat(formData.advAmt1) || 0,
        advDate1: formData.advDate1,
        neftImpsIdno1: formData.neftImpsIdno1,
        advAmt2: parseFloat(formData.advAmt2) || 0,
        advDate2: formData.advDate2,
        neftImpsIdno2: formData.neftImpsIdno2,
        advAmt3: parseFloat(formData.advAmt3) || 0,
        advDate3: formData.advDate3,
        neftImpsIdno3: formData.neftImpsIdno3,
        balanceAmt: parseFloat(formData.balanceAmt) || 0,
        otherChargesHamaliDetentionHeight: formData.otherChargesHamaliDetentionHeight,
        deductionInClaimPenalty: formData.deductionInClaimPenalty,
        finalNeftImpsIdno: formData.finalNeftImpsIdno,
        finalDate: formData.finalDate,
        deliveryDate: formData.deliveryDate,
        status: formData.status as any,
      };

      let result;
      if (initialData && initialData.id) {
        result = await updateOwnerData(ownerData);
      } else {
        result = await addOwnerData(ownerData);
      }
      
      if (result.success) {
        Alert.alert("Success", "Owner record saved successfully!");
        onOwnerDataAdded?.(ownerData);
        handleClose();
      } else {
        Alert.alert("Error", result.error || "Failed to save owner record");
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
      keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={handleClose} />
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
          <TouchableOpacity onPress={handleClose}>
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
            onPress={handleSave}
            disabled={loading}
            style={{
              backgroundColor: '#10B981',
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
          {/* Status Selector */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Status</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['pending', 'completed', 'cancelled', 'in-transit', 'delivered'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={{
                    backgroundColor: formData.status === opt ? '#2563eb' : colors.surface,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: formData.status === opt ? '#2563eb' : colors.cardBorder,
                  }}
                  onPress={() => setFormData(prev => ({ ...prev, status: opt }))}
                >
                  <Text style={{ color: formData.status === opt ? 'white' : colors.text, fontWeight: '600', textTransform: 'capitalize' }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
                {renderInput('Record ID', formData.id, (text) => 
                  setFormData(prev => ({ ...prev, id: text })), 
                  { keyboardType: 'numeric', required: true }
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('Contact Number', formData.contactNo, (text) => 
                  setFormData(prev => ({ ...prev, contactNo: text })), 
                  { keyboardType: 'phone-pad', required: true }
                )}
              </View>
            </View>

            {renderInput('Owner Name & Address', formData.ownerNameAndAddress, (text) => 
              setFormData(prev => ({ ...prev, ownerNameAndAddress: text })), 
              { multiline: true, required: true }
            )}

            {renderInput('PAN Number', formData.panNo, (text) => 
              setFormData(prev => ({ ...prev, panNo: text }))
            )}
          </View>

          {/* Vehicle & Driver Details */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16
            }}>
              Vehicle & Driver Details
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Vehicle Number', formData.vehicleNo, (text) => 
                  setFormData(prev => ({ ...prev, vehicleNo: text })), 
                  { required: true }
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('Licence Number', formData.licenceNo, (text) => 
                  setFormData(prev => ({ ...prev, licenceNo: text }))
                )}
              </View>
            </View>

            {renderInput('Driver Name & Mobile', formData.driverNameAndMob, (text) => 
              setFormData(prev => ({ ...prev, driverNameAndMob: text })), 
              { required: true }
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Chassis Number', formData.chasisNo, (text) => 
                  setFormData(prev => ({ ...prev, chasisNo: text }))
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('Engine Number', formData.engineNo, (text) => 
                  setFormData(prev => ({ ...prev, engineNo: text }))
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Insurance Company', formData.insuranceCo, (text) => 
                  setFormData(prev => ({ ...prev, insuranceCo: text }))
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('Policy Number', formData.policyNo, (text) => 
                  setFormData(prev => ({ ...prev, policyNo: text }))
                )}
              </View>
            </View>
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
                {renderInput('SR Number', formData.srno, (text) => 
                  setFormData(prev => ({ ...prev, srno: text })), 
                  { keyboardType: 'numeric', required: true }
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('LR Number', formData.lrno, (text) => 
                  setFormData(prev => ({ ...prev, lrno: text })), 
                  { keyboardType: 'numeric', required: true }
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Packages', formData.packages, (text) => 
                  setFormData(prev => ({ ...prev, packages: text })), 
                  { keyboardType: 'numeric' }
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('Weight (kg)', formData.wtKgs, (text) => 
                  setFormData(prev => ({ ...prev, wtKgs: text })), 
                  { keyboardType: 'numeric' }
                )}
              </View>
            </View>

            {renderInput('Description', formData.description, (text) => 
              setFormData(prev => ({ ...prev, description: text })), 
              { multiline: true }
            )}

            {renderInput('Remarks', formData.remarks, (text) => 
              setFormData(prev => ({ ...prev, remarks: text })), 
              { multiline: true }
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

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Broker Name', formData.brokerName, (text) => 
                  setFormData(prev => ({ ...prev, brokerName: text }))
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('Broker PAN', formData.brokerPanNo, (text) => 
                  setFormData(prev => ({ ...prev, brokerPanNo: text }))
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Lorry Hire Amount', formData.lorryHireAmount, (text) => 
                  setFormData(prev => ({ ...prev, lorryHireAmount: text })), 
                  { keyboardType: 'numeric' }
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput('Account Number', formData.accNo, (text) => 
                  setFormData(prev => ({ ...prev, accNo: text })), 
                  { keyboardType: 'numeric' }
                )}
              </View>
            </View>

            {renderInput('Other Charges (Hamali/Detention/Height)', formData.otherChargesHamliDetentionHeight, (text) => 
              setFormData(prev => ({ ...prev, otherChargesHamliDetentionHeight: text })), 
              { keyboardType: 'numeric' }
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                {renderInput('Total Lorry Hire Rs', formData.totalLorryHireRs, (text) => 
                  setFormData(prev => ({ ...prev, totalLorryHireRs: text })), 
                  { keyboardType: 'numeric' }
                )}
              </View>
              <TouchableOpacity
                onPress={calculateBalance}
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

          {/* Advance Payments */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16
            }}>
              Advance Payments
            </Text>

            {/* Advance 1 */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
                Advance Payment 1
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {renderInput('Amount', formData.advAmt1, (text) => 
                    setFormData(prev => ({ ...prev, advAmt1: text })), 
                    { keyboardType: 'numeric' }
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {renderInput('NEFT/IMPS ID', formData.neftImpsIdno1, (text) => 
                    setFormData(prev => ({ ...prev, neftImpsIdno1: text }))
                  )}
                </View>
              </View>
            </View>

            {/* Advance 2 */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
                Advance Payment 2
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {renderInput('Amount', formData.advAmt2, (text) => 
                    setFormData(prev => ({ ...prev, advAmt2: text })), 
                    { keyboardType: 'numeric' }
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {renderInput('NEFT/IMPS ID', formData.neftImpsIdno2, (text) => 
                    setFormData(prev => ({ ...prev, neftImpsIdno2: text }))
                  )}
                </View>
              </View>
            </View>

            {/* Advance 3 */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
                Advance Payment 3
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {renderInput('Amount', formData.advAmt3, (text) => 
                    setFormData(prev => ({ ...prev, advAmt3: text })), 
                    { keyboardType: 'numeric' }
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {renderInput('NEFT/IMPS ID', formData.neftImpsIdno3, (text) => 
                    setFormData(prev => ({ ...prev, neftImpsIdno3: text }))
                  )}
                </View>
              </View>
            </View>

            {renderInput('Balance Amount', formData.balanceAmt, (text) => 
              setFormData(prev => ({ ...prev, balanceAmt: text })), 
              { keyboardType: 'numeric' }
            )}
          </View>

          {/* Final Settlement */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16
            }}>
              Final Settlement
            </Text>

            {renderInput('Other Charges (Hamali/Detention/Height)', formData.otherChargesHamaliDetentionHeight, (text) => 
              setFormData(prev => ({ ...prev, otherChargesHamaliDetentionHeight: text })), 
              { multiline: true }
            )}

            {renderInput('Deduction in Claim/Penalty', formData.deductionInClaimPenalty, (text) => 
              setFormData(prev => ({ ...prev, deductionInClaimPenalty: text })), 
              { multiline: true }
            )}

            {renderInput('Final NEFT/IMPS ID', formData.finalNeftImpsIdno, (text) => 
              setFormData(prev => ({ ...prev, finalNeftImpsIdno: text }))
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
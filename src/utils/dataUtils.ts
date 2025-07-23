import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Types
export type BillStatus = 'pending' | 'completed' | 'cancelled' | 'in-transit' | 'delivered';

export interface TransportBillData {
  bill: string; // user input
  uniqueId: string;
  syncId: string;
  date: Date;
  ms: string;
  gstno: string;
  otherDetail: string;
  srno: number;
  lrno: number;
  lrDate: Date;
  from: string;
  to: string;
  vehicleNo: string;
  invoiceNo: string;
  consignorConsignee: string;
  handleCharges: number;
  detention: number;
  freight: number;
  total: number;
  status: BillStatus;
}

export interface OwnerData {
  id: string; // user input
  uniqueId: string;
  syncId: string;
  date: Date;
  contactNo: number;
  vehicleNo: string;
  from: string;
  to: string;
  ownerNameAndAddress: string;
  panNo: string;
  driverNameAndMob: string;
  licenceNo: string;
  chasisNo: string;
  engineNo: string;
  insuranceCo: string;
  policyNo: string;
  policyDate: Date;
  srno: number;
  lrno: number;
  packages: number;
  description: string;
  wtKgs: number;
  remarks: string;
  brokerName: string;
  brokerPanNo: string;
  lorryHireAmount: number;
  accNo: number;
  otherChargesHamliDetentionHeight: number;
  totalLorryHireRs: number;
  advAmt1: number;
  advDate1: Date;
  neftImpsIdno1: string;
  advAmt2: number;
  advDate2: Date;
  neftImpsIdno2: string;
  advAmt3: number;
  advDate3: Date;
  neftImpsIdno3: string;
  balanceAmt: number;
  otherChargesHamaliDetentionHeight: string;
  deductionInClaimPenalty: string;
  finalNeftImpsIdno: string;
  finalDate: Date;
  deliveryDate: Date;
  status: BillStatus;
}

export interface DataResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const generateId = (): string => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const saveToStorage = async <T>(key: string, data: T[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

const loadFromStorage = async <T>(key: string): Promise<T[]> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// ============ OWNER DATA FUNCTIONS ============
export const getAllOwnerData = async (): Promise<DataResult<OwnerData[]>> => {
  try {
    const data = await loadFromStorage<OwnerData>('owner_data');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load owner data' };
  }
};

export const addOwnerData = async (data: Omit<OwnerData, 'uniqueId' | 'syncId'>): Promise<DataResult<OwnerData>> => {
  try {
    const all = await loadFromStorage<OwnerData>('owner_data');
    const uniqueId = generateId();
    const syncId = generateId();
    const newData: OwnerData = { ...data, uniqueId, syncId };
    all.push(newData);
    const saved = await saveToStorage('owner_data', all);
    if (!saved) return { success: false, error: 'Failed to save owner data' };
    // Also create a transport record with the same syncId if not exists
    let transportBills = await loadFromStorage<TransportBillData>('transport_bills');
    if (!transportBills.some(b => b.syncId === syncId)) {
      const transportBill: TransportBillData = {
        bill: data.id, // Use the same as owner id
        uniqueId: generateId(),
        syncId,
        date: data.date,
        ms: '', gstno: '', otherDetail: '', srno: data.srno, lrno: data.lrno, lrDate: data.date, from: data.from, to: data.to, vehicleNo: data.vehicleNo, invoiceNo: '', consignorConsignee: '', handleCharges: 0, detention: 0, freight: 0, total: 0, status: 'pending',
      };
      transportBills.push(transportBill);
      await saveToStorage('transport_bills', transportBills);
    }
    return { success: true, data: newData };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save owner data' };
  }
};

export const updateOwnerData = async (updated: OwnerData): Promise<DataResult<OwnerData>> => {
  try {
    const all = await loadFromStorage<OwnerData>('owner_data');
    const idx = all.findIndex(d => d.id === updated.id);
    if (idx === -1) return { success: false, error: 'Owner data not found' };
    
    // Store the syncId before updating
    const syncId = all[idx].syncId;
    
    // Update the owner data
    all[idx] = updated;
    const saved = await saveToStorage('owner_data', all);
    if (!saved) return { success: false, error: 'Failed to update owner data' };
    
    // Also update the corresponding transport bill with the same syncId
    const transportBills = await loadFromStorage<TransportBillData>('transport_bills');
    const transportIdx = transportBills.findIndex(b => b.syncId === syncId);
    if (transportIdx !== -1) {
      // Update relevant fields from owner data to transport bill
      transportBills[transportIdx] = {
        ...transportBills[transportIdx],
        date: updated.date,
        from: updated.from,
        to: updated.to,
        vehicleNo: updated.vehicleNo,
        srno: updated.srno,
        lrno: updated.lrno,
        status: updated.status
      };
      await saveToStorage('transport_bills', transportBills);
    }
    
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update owner data' };
  }
};

export const deleteOwnerData = async (id: string): Promise<DataResult<null>> => {
  try {
    let ownerDataList = await loadFromStorage<OwnerData>('owner_data');
    const owner = ownerDataList.find(d => d.id === id);
    if (!owner) return { success: false, error: 'Owner data not found' };
    ownerDataList = ownerDataList.filter(d => d.id !== id);
    await saveToStorage('owner_data', ownerDataList);
    // Also delete from transport bills by syncId
    let transportBills = await loadFromStorage<TransportBillData>('transport_bills');
    transportBills = transportBills.filter(b => b.syncId !== owner.syncId);
    await saveToStorage('transport_bills', transportBills);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete owner data' };
  }
};

// ============ TRANSPORT BILL FUNCTIONS ============
export const getAllTransportBills = async (): Promise<DataResult<TransportBillData[]>> => {
  try {
    const data = await loadFromStorage<TransportBillData>('transport_bills');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load transport bills' };
  }
};

export const addTransportBill = async (data: Omit<TransportBillData, 'uniqueId' | 'syncId'>): Promise<DataResult<TransportBillData>> => {
  try {
    const all = await loadFromStorage<TransportBillData>('transport_bills');
    const uniqueId = generateId();
    const syncId = generateId();
    const newData: TransportBillData = { ...data, uniqueId, syncId };
    all.push(newData);
    const saved = await saveToStorage('transport_bills', all);
    if (!saved) return { success: false, error: 'Failed to save transport bill' };
    // Also create an owner record with the same syncId if not exists
    let ownerDataList = await loadFromStorage<OwnerData>('owner_data');
    if (!ownerDataList.some(d => d.syncId === syncId)) {
      const ownerData: OwnerData = {
        id: data.bill, // Use the same as bill number
        uniqueId: generateId(),
        syncId,
        date: data.date,
        contactNo: 0, vehicleNo: data.vehicleNo, from: data.from, to: data.to, ownerNameAndAddress: '', panNo: '', driverNameAndMob: '', licenceNo: '', chasisNo: '', engineNo: '', insuranceCo: '', policyNo: '', policyDate: new Date(), srno: data.srno, lrno: data.lrno, packages: 0, description: '', wtKgs: 0, remarks: '', brokerName: '', brokerPanNo: '', lorryHireAmount: 0, accNo: 0, otherChargesHamliDetentionHeight: 0, totalLorryHireRs: 0, advAmt1: 0, advDate1: new Date(), neftImpsIdno1: '', advAmt2: 0, advDate2: new Date(), neftImpsIdno2: '', advAmt3: 0, advDate3: new Date(), neftImpsIdno3: '', balanceAmt: 0, otherChargesHamaliDetentionHeight: '', deductionInClaimPenalty: '', finalNeftImpsIdno: '', finalDate: new Date(), deliveryDate: new Date(), status: 'pending',
      };
      ownerDataList.push(ownerData);
      await saveToStorage('owner_data', ownerDataList);
    }
    return { success: true, data: newData };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save transport bill' };
  }
};

export const updateTransportBill = async (updated: TransportBillData): Promise<DataResult<TransportBillData>> => {
  try {
    const all = await loadFromStorage<TransportBillData>('transport_bills');
    const idx = all.findIndex(b => b.bill === updated.bill);
    if (idx === -1) return { success: false, error: 'Transport bill not found' };
    
    // Store the syncId before updating
    const syncId = all[idx].syncId;
    
    // Update the transport bill
    all[idx] = updated;
    const saved = await saveToStorage('transport_bills', all);
    if (!saved) return { success: false, error: 'Failed to update transport bill' };
    
    // Also update the corresponding owner data with the same syncId
    const ownerDataList = await loadFromStorage<OwnerData>('owner_data');
    const ownerIdx = ownerDataList.findIndex(d => d.syncId === syncId);
    if (ownerIdx !== -1) {
      // Update relevant fields from transport bill to owner data
      ownerDataList[ownerIdx] = {
        ...ownerDataList[ownerIdx],
        date: updated.date,
        from: updated.from,
        to: updated.to,
        vehicleNo: updated.vehicleNo,
        srno: updated.srno,
        lrno: updated.lrno,
        status: updated.status
      };
      await saveToStorage('owner_data', ownerDataList);
    }
    
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update transport bill' };
  }
};

export const deleteTransportBill = async (bill: string): Promise<DataResult<null>> => {
  try {
    let transportBills = await loadFromStorage<TransportBillData>('transport_bills');
    const billData = transportBills.find(b => b.bill === bill);
    if (!billData) return { success: false, error: 'Transport bill not found' };
    transportBills = transportBills.filter(b => b.bill !== bill);
    await saveToStorage('transport_bills', transportBills);
    // Also delete from owner data by syncId
    let ownerDataList = await loadFromStorage<OwnerData>('owner_data');
    ownerDataList = ownerDataList.filter(d => d.syncId !== billData.syncId);
    await saveToStorage('owner_data', ownerDataList);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete transport bill' };
  }
};

export const deleteAllTransportBills = async (): Promise<DataResult<null>> => {
  try {
    await AsyncStorage.setItem('transport_bills', JSON.stringify([]));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete all transport bills' };
  }
};

export const deleteAllOwnerData = async (): Promise<DataResult<null>> => {
  try {
    await AsyncStorage.setItem('owner_data', JSON.stringify([]));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete all owner data' };
  }
};

export const clearAllData = async (): Promise<DataResult<null>> => {
  try {
    await AsyncStorage.multiSet([
      ['owner_data', JSON.stringify([])],
      ['transport_bills', JSON.stringify([])]
    ]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to clear all data' };
  }
};

export const exportAllData = async (): Promise<DataResult<string>> => {
  try {
    const ownerData = await loadFromStorage<OwnerData>('owner_data');
    const transportData = await loadFromStorage<TransportBillData>('transport_bills');
    const profileData = await AsyncStorage.getItem('profile_data');
    const bankData = await AsyncStorage.getItem('bank_data');
    const profileImage = await SecureStore.getItemAsync('profile_image_base64');
    const exportObj = {
      owner_data: ownerData,
      transport_bills: transportData,
      profile_data: profileData ? JSON.parse(profileData) : null,
      bank_data: bankData ? JSON.parse(bankData) : null,
      profile_image: profileImage || null
    };
    return { success: true, data: JSON.stringify(exportObj, null, 2) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to export data' };
  }
};

export const importAllData = async (json: string): Promise<DataResult<null>> => {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.owner_data || !parsed.transport_bills) {
      return { success: false, error: 'Invalid data format' };
    }
    await AsyncStorage.setItem('owner_data', JSON.stringify(parsed.owner_data));
    await AsyncStorage.setItem('transport_bills', JSON.stringify(parsed.transport_bills));
    if (parsed.profile_data) {
      await AsyncStorage.setItem('profile_data', JSON.stringify(parsed.profile_data));
    }
    if (parsed.bank_data) {
      await AsyncStorage.setItem('bank_data', JSON.stringify(parsed.bank_data));
    }
    if (parsed.profile_image) {
      await SecureStore.setItemAsync('profile_image_base64', parsed.profile_image);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to import data' };
  }
};
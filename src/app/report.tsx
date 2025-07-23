import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ScreenLayout from '../components/ScreenLayout';
import FilterModal from '../components/FilterModal';
import BillDetailModal from '../components/BillDetailModal';
import { getAllTransportBills, getAllOwnerData } from '../utils/dataUtils';
import { generateTransportTemplate } from '../components/TransportTemplate';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultProfileData = {
  companyName: '', ownerName: '', address: '', phone: '', email: '', gstNumber: '', panNumber: '',
};
const defaultBankData = {
  accountName: '', accountNumber: '', bankName: '', branchName: '', ifscCode: '',
};

const OWNER_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'date', label: 'Date' },
  { key: 'ownerNameAndAddress', label: 'Owner Name' },
  { key: 'vehicleNo', label: 'Vehicle No' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'totalLorryHireRs', label: 'Amount' },
  { key: 'status', label: 'Status' },
];
const TRANSPORT_COLUMNS = [
  { key: 'bill', label: 'Bill #' },
  { key: 'date', label: 'Date' },
  { key: 'ms', label: 'M/S' },
  { key: 'vehicleNo', label: 'Vehicle No' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'total', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

// All possible fields for Owner and Transport
const ALL_OWNER_FIELDS: { key: string; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'date', label: 'Date' },
  { key: 'ownerNameAndAddress', label: 'Owner Name' },
  { key: 'vehicleNo', label: 'Vehicle No' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'totalLorryHireRs', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'contactNo', label: 'Contact No' },
  { key: 'panNo', label: 'PAN No' },
  { key: 'driverNameAndMob', label: 'Driver Name & Mob' },
  { key: 'licenceNo', label: 'Licence No' },
  { key: 'chasisNo', label: 'Chasis No' },
  { key: 'engineNo', label: 'Engine No' },
  { key: 'insuranceCo', label: 'Insurance Co' },
  { key: 'policyNo', label: 'Policy No' },
  { key: 'policyDate', label: 'Policy Date' },
  { key: 'srno', label: 'SR No' },
  { key: 'lrno', label: 'LR No' },
  { key: 'packages', label: 'Packages' },
  { key: 'description', label: 'Description' },
  { key: 'wtKgs', label: 'Weight (kg)' },
  { key: 'remarks', label: 'Remarks' },
  { key: 'brokerName', label: 'Broker Name' },
  { key: 'brokerPanNo', label: 'Broker PAN No' },
  { key: 'lorryHireAmount', label: 'Lorry Hire Amount' },
  { key: 'accNo', label: 'Account No' },
  { key: 'aCNo', label: 'A/C No' },
  { key: 'otherChargesHamliDetentionHeight', label: 'Other Charges' },
  { key: 'advAmt1', label: 'Advance 1' },
  { key: 'advAmt2', label: 'Advance 2' },
  { key: 'advAmt3', label: 'Advance 3' },
  { key: 'advDate1', label: 'Advance Date 1' },
  { key: 'advDate2', label: 'Advance Date 2' },
  { key: 'advDate3', label: 'Advance Date 3' },
  { key: 'neftImpsIdno1', label: 'NEFT/IMPS ID 1' },
  { key: 'neftImpsIdno2', label: 'NEFT/IMPS ID 2' },
  { key: 'neftImpsIdno3', label: 'NEFT/IMPS ID 3' },
  { key: 'balanceAmt', label: 'Balance Amount' },
  { key: 'deductionInClaimPenalty', label: 'Deduction/Penalty' },
  { key: 'netBalanceAmt', label: 'Net Balance' },
  { key: 'finalNeftImpsIdno', label: 'Final NEFT/IMPS ID' },
  { key: 'finalDate', label: 'Final Date' },
  { key: 'deliveryDate', label: 'Delivery Date' },
];
const ALL_TRANSPORT_FIELDS: { key: string; label: string }[] = [
  { key: 'bill', label: 'Bill #' },
  { key: 'date', label: 'Date' },
  { key: 'ms', label: 'M/S' },
  { key: 'gstno', label: 'GST No' },
  { key: 'otherDetail', label: 'Other Detail' },
  { key: 'srno', label: 'SR No' },
  { key: 'lrno', label: 'LR No' },
  { key: 'lrDate', label: 'LR Date' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'vehicleNo', label: 'Vehicle No' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'consignorConsignee', label: 'Consignor/Consignee' },
  { key: 'handleCharges', label: 'Handle Charges' },
  { key: 'detention', label: 'Detention' },
  { key: 'freight', label: 'Freight' },
  { key: 'total', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

export default function ReportScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'owner' | 'transport'>('transport');
  // Data
  const [ownerData, setOwnerData] = useState([]);
  const [transportData, setTransportData] = useState([]);
  // Filters
  const [ownerFilters, setOwnerFilters] = useState({ startDate: null, endDate: null, minAmount: '', maxAmount: '', status: '', sort: 'date_desc' });
  const [transportFilters, setTransportFilters] = useState({ startDate: null, endDate: null, minAmount: '', maxAmount: '', status: '', sort: 'date_desc' });
  // Search
  const [ownerSearch, setOwnerSearch] = useState('');
  const [transportSearch, setTransportSearch] = useState('');
  // UI
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 10;
  // Add state for selected columns per tab
  const defaultOwnerCols = ALL_OWNER_FIELDS.map(col => col.key);
  const defaultTransportCols = ALL_TRANSPORT_FIELDS.map(col => col.key);
  const [ownerCols, setOwnerCols] = useState(defaultOwnerCols);
  const [transportCols, setTransportCols] = useState(defaultTransportCols);
  const [columnsModalVisible, setColumnsModalVisible] = useState(false);
  // Add state for group by
  const [ownerGroupBy, setOwnerGroupBy] = useState('');
  const [transportGroupBy, setTransportGroupBy] = useState('');
  // Add state for search/filter in columns modal
  const [columnSearch, setColumnSearch] = useState('');
  // Add state for orientation
  const [pdfOrientation, setPdfOrientation] = useState('landscape'); // 'portrait' or 'landscape'
  // Add state for fit to page
  const [fitToPage, setFitToPage] = useState(false);

  // Load data
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getAllTransportBills(),
      getAllOwnerData()
    ]).then(([tResult, oResult]) => {
      if (tResult.success && tResult.data) setTransportData(tResult.data);
      if (oResult.success && oResult.data) setOwnerData(oResult.data);
      setIsLoading(false);
    });
  }, []);

  // Filtering logic
  const filteredOwner = useMemo(() => {
    let data = ownerData;
    const f = ownerFilters;
    if (f.startDate) data = data.filter(d => new Date(d.date) >= new Date(f.startDate));
    if (f.endDate) data = data.filter(d => new Date(d.date) <= new Date(f.endDate));
    if (f.minAmount) data = data.filter(d => (d.totalLorryHireRs || 0) >= parseFloat(f.minAmount));
    if (f.maxAmount) data = data.filter(d => (d.totalLorryHireRs || 0) <= parseFloat(f.maxAmount));
    if (f.status) data = data.filter(d => (d.status || '').toLowerCase() === f.status.toLowerCase());
    if (ownerSearch.trim()) {
      const q = ownerSearch.toLowerCase();
      data = data.filter(d =>
        String(d.id).toLowerCase().includes(q) ||
        (d.ownerNameAndAddress && d.ownerNameAndAddress.toLowerCase().includes(q)) ||
        (d.vehicleNo && d.vehicleNo.toLowerCase().includes(q)) ||
        (d.from && d.from.toLowerCase().includes(q)) ||
        (d.to && d.to.toLowerCase().includes(q)) ||
        (d.totalLorryHireRs && String(d.totalLorryHireRs).includes(q)) ||
        (d.remarks && d.remarks.toLowerCase().includes(q)) ||
        (d.brokerName && d.brokerName.toLowerCase().includes(q))
      );
    }
    if (f.sort === 'date_desc') data = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    else if (f.sort === 'date_asc') data = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    else if (f.sort === 'amount_desc') data = data.sort((a, b) => (b.totalLorryHireRs || 0) - (a.totalLorryHireRs || 0));
    else if (f.sort === 'amount_asc') data = data.sort((a, b) => (a.totalLorryHireRs || 0) - (b.totalLorryHireRs || 0));
    return data;
  }, [ownerData, ownerFilters, ownerSearch]);

  const filteredTransport = useMemo(() => {
    let data = transportData;
    const f = transportFilters;
    if (f.startDate) data = data.filter(b => new Date(b.date) >= new Date(f.startDate));
    if (f.endDate) data = data.filter(b => new Date(b.date) <= new Date(f.endDate));
    if (f.minAmount) data = data.filter(b => (b.total || 0) >= parseFloat(f.minAmount));
    if (f.maxAmount) data = data.filter(b => (b.total || 0) <= parseFloat(f.maxAmount));
    if (f.status) data = data.filter(b => (b.status || '').toLowerCase() === f.status.toLowerCase());
    if (transportSearch.trim()) {
      const q = transportSearch.toLowerCase();
      data = data.filter(b =>
        String(b.bill).toLowerCase().includes(q) ||
        (b.ms && b.ms.toLowerCase().includes(q)) ||
        (b.vehicleNo && b.vehicleNo.toLowerCase().includes(q)) ||
        (b.from && b.from.toLowerCase().includes(q)) ||
        (b.to && b.to.toLowerCase().includes(q)) ||
        (b.total && String(b.total).includes(q)) ||
        (b.consignorConsignee && b.consignorConsignee.toLowerCase().includes(q)) ||
        (b.invoiceNo && b.invoiceNo.toLowerCase().includes(q))
      );
    }
    if (f.sort === 'date_desc') data = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    else if (f.sort === 'date_asc') data = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    else if (f.sort === 'amount_desc') data = data.sort((a, b) => (b.total || 0) - (a.total || 0));
    else if (f.sort === 'amount_asc') data = data.sort((a, b) => (a.total || 0) - (b.total || 0));
    return data;
  }, [transportData, transportFilters, transportSearch]);

  // Pagination logic
  const filtered = tab === 'owner' ? filteredOwner : filteredTransport;
  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filtered.slice(indexOfFirstBill, indexOfLastBill);
  const totalPages = Math.ceil(filtered.length / billsPerPage);

  // PDF Table Generator with grouping
  function generateTablePDF(data, columns, title, groupByKey, orientation, fitToPage) {
    const ths = columns.map(col => `<th>${col.label}</th>`).join('');
    let body = '';
    if (groupByKey) {
      // Group data
      const groups = {};
      data.forEach(row => {
        const groupVal = row[groupByKey] ?? '';
        if (!groups[groupVal]) groups[groupVal] = [];
        groups[groupVal].push(row);
      });
      Object.entries(groups).forEach(([group, rows]) => {
        body += `<tr class="group-header"><td colspan="${columns.length}">${groupByKey.charAt(0).toUpperCase() + groupByKey.slice(1)}: ${group || '(Blank)'}</td></tr>`;
        body += rows.map(row =>
          '<tr>' + columns.map(col => `<td>${col.key === 'date' || col.key.toLowerCase().includes('date') ? (row[col.key] ? new Date(row[col.key]).toLocaleDateString() : '') : (row[col.key] ?? '')}</td>`).join('') + '</tr>'
        ).join('');
      });
    } else {
      body = data.map(row =>
        '<tr>' + columns.map(col => `<td>${col.key === 'date' || col.key.toLowerCase().includes('date') ? (row[col.key] ? new Date(row[col.key]).toLocaleDateString() : '') : (row[col.key] ?? '')}</td>`).join('') + '</tr>'
      ).join('');
    }
    return `<!DOCTYPE html><html><head><meta charset='UTF-8'><title>${title}</title><style>
    @page { size: A4 ${orientation || 'landscape'}; margin: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; color: #222; background: #fff; }
    .report-title { font-size: 20px; font-weight: bold; margin: 0 0 4px 0; text-align: center; }
    .report-table-container { max-width: 100vw; margin: 0; background: #fff; border-radius: 0; box-shadow: none; padding: 0; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 0; ${fitToPage ? 'table-layout: fixed;' : ''} }
    th, td { padding: 2px 4px; font-size: ${fitToPage ? '11px' : '13px'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    th { background: #2563eb; color: #fff; font-weight: 700; border-top-left-radius: 0; border-top-right-radius: 0; }
    tr:nth-child(even) td { background: #f6f8fa; }
    tr:nth-child(odd) td { background: #fff; }
    tr.group-header td { background: #e0e7ef; font-weight: bold; font-size: 14px; }
    tfoot td { font-weight: bold; background: #f1f5f9; }
    @media print { body { background: #fff; } .report-table-container { box-shadow: none; border-radius: 0; padding: 0; } }
  </style></head><body><div class="report-title">${title}</div><div class="report-table-container"><table><thead><tr>${ths}</tr></thead><tbody>${body}</tbody></table></div></body></html>`;
  }

  // PDF Generation Handler
  const handleGeneratePdf = async () => {
    setPdfGenerating(true);
    try {
      if (filtered.length === 0) {
        Alert.alert('No records', 'No records to generate PDF.');
        setPdfGenerating(false);
        return;
      }
      const allColumns = tab === 'owner' ? ALL_OWNER_FIELDS : ALL_TRANSPORT_FIELDS;
      const selectedKeys = tab === 'owner' ? ownerCols : transportCols;
      const columns = allColumns.filter(col => selectedKeys.includes(col.key));
      const groupByKey = tab === 'owner' ? ownerGroupBy : transportGroupBy;
      const title = tab === 'owner' ? 'Owner Report' : 'Transport Report';
      const htmlContent = generateTablePDF(filtered, columns, title, groupByKey, pdfOrientation, fitToPage);
      if (Platform.OS === 'web') {
        const win = window.open('', '_blank');
        if (!win) {
          alert('Please allow popups for this site to print the report.');
          setPdfGenerating(false);
          return;
        }
        win.document.open();
        win.document.write(htmlContent);
        win.document.close();
        win.focus();
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: title,
            UTI: 'com.adobe.pdf'
          });
        } else {
          alert('Sharing is not available on this device. PDF saved at: ' + uri);
        }
      }
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Count active filters for badge
  const activeFilterCount = [
    ...(tab === 'owner' ? [ownerFilters.startDate, ownerFilters.endDate, ownerFilters.minAmount, ownerFilters.maxAmount, ownerFilters.status, ownerFilters.sort !== 'date_desc' ? ownerFilters.sort : null] :
      [transportFilters.startDate, transportFilters.endDate, transportFilters.minAmount, transportFilters.maxAmount, transportFilters.status, transportFilters.sort !== 'date_desc' ? transportFilters.sort : null])
  ].filter(Boolean).length;

  // Filter modal handlers
  const openFilterModal = () => setFilterModalVisible(true);
  const closeFilterModal = () => setFilterModalVisible(false);
  const applyFilters = f => {
    if (tab === 'owner') setOwnerFilters(f);
    else setTransportFilters(f);
    setCurrentPage(1);
    closeFilterModal();
  };
  const resetFilters = () => {
    if (tab === 'owner') setOwnerFilters({ startDate: null, endDate: null, minAmount: '', maxAmount: '', status: '', sort: 'date_desc' });
    else setTransportFilters({ startDate: null, endDate: null, minAmount: '', maxAmount: '', status: '', sort: 'date_desc' });
    setCurrentPage(1);
    closeFilterModal();
  };

  // Search handler
  const setSearch = v => {
    if (tab === 'owner') setOwnerSearch(v);
    else setTransportSearch(v);
    setCurrentPage(1);
  };

  // Persist column/group choices (optional, simple version)
  useEffect(() => {
    AsyncStorage.setItem('report_ownerCols', JSON.stringify(ownerCols));
    AsyncStorage.setItem('report_transportCols', JSON.stringify(transportCols));
    AsyncStorage.setItem('report_ownerGroupBy', ownerGroupBy);
    AsyncStorage.setItem('report_transportGroupBy', transportGroupBy);
  }, [ownerCols, transportCols, ownerGroupBy, transportGroupBy]);
  useEffect(() => {
    AsyncStorage.getItem('report_ownerCols').then(v => v && setOwnerCols(JSON.parse(v)));
    AsyncStorage.getItem('report_transportCols').then(v => v && setTransportCols(JSON.parse(v)));
    AsyncStorage.getItem('report_ownerGroupBy').then(v => v && setOwnerGroupBy(v));
    AsyncStorage.getItem('report_transportGroupBy').then(v => v && setTransportGroupBy(v));
  }, []);

  return (
    <ScreenLayout title="Report" showBackButton={true}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Tabs */}
        <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 4, marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface }}>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: tab === 'owner' ? colors.primary : 'transparent' }} onPress={() => { setTab('owner'); setCurrentPage(1); }}>
            <Text style={{ color: tab === 'owner' ? 'white' : colors.text, fontWeight: '700', fontSize: 16 }}>Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: tab === 'transport' ? colors.primary : 'transparent' }} onPress={() => { setTab('transport'); setCurrentPage(1); }}>
            <Text style={{ color: tab === 'transport' ? 'white' : colors.text, fontWeight: '700', fontSize: 16 }}>Transport</Text>
          </TouchableOpacity>
        </View>
        {/* Search bar with filter icon (top) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, paddingHorizontal: 16, marginBottom: 8 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, height: 44 }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, color: colors.text, fontSize: 16 }}
              placeholder={tab === 'owner' ? 'Search owner bills...' : 'Search transport bills...'}
              placeholderTextColor={colors.textSecondary}
              value={tab === 'owner' ? ownerSearch : transportSearch}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={{ marginLeft: 10, backgroundColor: colors.surface, borderRadius: 8, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            onPress={openFilterModal}
          >
            <Ionicons name="options" size={22} color={colors.text} />
            {activeFilterCount > 0 && (
              <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <FilterModal
          visible={filterModalVisible}
          onClose={closeFilterModal}
          onApply={applyFilters}
          onReset={resetFilters}
          initialFilters={tab === 'owner' ? ownerFilters : transportFilters}
          statusOptions={["pending", "completed", "cancelled", "in-transit", "delivered"]}
        />
        {/* Bill List (cards) below filters */}
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <Ionicons name="sync" size={48} color={colors.primary} style={{ marginBottom: 16, opacity: 0.8 }} />
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>Loading bills...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="document-outline" size={72} color="#bfc4d1" style={{ marginBottom: 16 }} />
            <Text style={{ color: '#22223b', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>No Records Found</Text>
            <Text style={{ color: '#6c6c80', fontSize: 16, textAlign: 'center', marginHorizontal: 24 }}>
              No {tab} records found for the selected filters
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
            {currentBills.map(item => (
              <TouchableOpacity key={tab === 'owner' ? item.id : item.bill} activeOpacity={0.85} onPress={() => { setSelectedBill(item); setDetailModalVisible(true); }} style={{
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
              }}>
                {/* Row 1 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  {/* Left: ID/Bill # and Date */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{tab === 'owner' ? `ID #${item.id}` : `Bill #${item.bill}`}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.date ? new Date(item.date).toLocaleDateString() : ''}</Text>
                  </View>
                  {/* Center: Name/MS */}
                  <View style={{ flex: 2, alignItems: 'center' }}>
                    <Text style={{ color: colors.primary || '#2563eb', fontSize: 16, fontWeight: '700' }} numberOfLines={1} ellipsizeMode="tail">{tab === 'owner' ? item.ownerNameAndAddress : item.ms}</Text>
                  </View>
                  {/* Right: Amount and Status */}
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>₹{tab === 'owner' ? (item.totalLorryHireRs?.toLocaleString() || '0') : (item.total?.toLocaleString() || '0')}</Text>
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
                  <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 8, marginRight: 6 }} onPress={() => { setSelectedBill(item); setDetailModalVisible(true); }}>
                    <Ionicons name="eye" size={18} color={'white'} style={{ marginRight: 4 }} />
                    <Text style={{ color: 'white', fontWeight: '600' }}>View</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            <BillDetailModal
              visible={detailModalVisible}
              onClose={() => setDetailModalVisible(false)}
              bill={selectedBill}
              type={tab}
            />
          </ScrollView>
        )}
        {/* Pagination controls */}
        {filtered.length > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, backgroundColor: colors.background }}>
            <TouchableOpacity
              onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: 8, backgroundColor: currentPage === 1 ? colors.surface : colors.primary, borderRadius: 8, opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? colors.textSecondary : 'white'} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
                Page {currentPage} of {totalPages} ({filtered.length} records)
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: 8, backgroundColor: currentPage === totalPages ? colors.surface : colors.primary, borderRadius: 8, opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? colors.textSecondary : 'white'} />
            </TouchableOpacity>
          </View>
        )}
        {/* PDF Button and Columns Button at the bottom */}
        <View style={{ flexDirection: 'row', gap: 12, padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
          <TouchableOpacity
            style={{ backgroundColor: '#10b981', borderRadius: 8, paddingVertical: 14, flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: pdfGenerating ? 0.7 : 1 }}
            onPress={handleGeneratePdf}
            disabled={pdfGenerating}
          >
            {pdfGenerating ? (
              <Ionicons name="hourglass" size={20} color="white" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="document" size={20} color="white" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Generate PDF of Records</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
            onPress={() => setColumnsModalVisible(true)}
          >
            <Ionicons name="list" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Columns</Text>
          </TouchableOpacity>
        </View>
        {/* Columns Modal */}
        <Modal
          visible={columnsModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setColumnsModalVisible(false)}
        >
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setColumnsModalVisible(false)} />
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, overflow: 'hidden' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#f1f1f4' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Configure Columns</Text>
              <TouchableOpacity onPress={() => setColumnsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {/* Make modal body fully scrollable */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Search Bar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, marginTop: 16, marginBottom: 10 }}>
                <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, color: colors.text, fontSize: 16, paddingVertical: 10 }}
                  placeholder="Search columns..."
                  placeholderTextColor={colors.textSecondary}
                  value={columnSearch}
                  onChangeText={setColumnSearch}
                />
                {columnSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setColumnSearch('')}><Ionicons name="close-circle" size={18} color={colors.textSecondary} /></TouchableOpacity>
                )}
              </View>
              {/* Group By Dropdown */}
              <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 6, color: colors.text, marginTop: 10 }}>Group by</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ marginBottom: 18 }} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, marginRight: 10, backgroundColor: (tab === 'owner' ? ownerGroupBy : transportGroupBy) === '' ? colors.primary : colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorder }}
                  onPress={() => tab === 'owner' ? setOwnerGroupBy('') : setTransportGroupBy('')}
                >
                  <Ionicons name={(tab === 'owner' ? ownerGroupBy : transportGroupBy) === '' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: (tab === 'owner' ? ownerGroupBy : transportGroupBy) === '' ? 'white' : colors.text, fontWeight: '600' }}>None</Text>
                </TouchableOpacity>
                {(tab === 'owner' ? ALL_OWNER_FIELDS : ALL_TRANSPORT_FIELDS).filter(col => col.label.toLowerCase().includes(columnSearch.toLowerCase())).map(col => (
                  <TouchableOpacity
                    key={col.key}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, marginRight: 10, backgroundColor: (tab === 'owner' ? ownerGroupBy : transportGroupBy) === col.key ? colors.primary : colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorder }}
                    onPress={() => tab === 'owner' ? setOwnerGroupBy(col.key) : setTransportGroupBy(col.key)}
                  >
                    <Ionicons name={(tab === 'owner' ? ownerGroupBy : transportGroupBy) === col.key ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ color: (tab === 'owner' ? ownerGroupBy : transportGroupBy) === col.key ? 'white' : colors.text }}>{col.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Select All / Deselect All */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
                <TouchableOpacity onPress={() => {
                  if (tab === 'owner') setOwnerCols(ALL_OWNER_FIELDS.map(col => col.key));
                  else setTransportCols(ALL_TRANSPORT_FIELDS.map(col => col.key));
                }} style={{ marginRight: 12 }}>
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  if (tab === 'owner') setOwnerCols([]);
                  else setTransportCols([]);
                }}>
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Deselect All</Text>
                </TouchableOpacity>
              </View>
              {/* Columns checkboxes */}
              <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 6, color: colors.text }}>Visible columns</Text>
              {(tab === 'owner' ? ALL_OWNER_FIELDS : ALL_TRANSPORT_FIELDS).filter(col => col.label.toLowerCase().includes(columnSearch.toLowerCase())).map(col => (
                <TouchableOpacity
                  key={col.key}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}
                  onPress={() => {
                    if (tab === 'owner') {
                      setOwnerCols(cols => cols.includes(col.key) ? cols.filter(k => k !== col.key) : [...cols, col.key]);
                    } else {
                      setTransportCols(cols => cols.includes(col.key) ? cols.filter(k => k !== col.key) : [...cols, col.key]);
                    }
                  }}
                >
                  <Ionicons
                    name={(tab === 'owner' ? ownerCols : transportCols).includes(col.key) ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={colors.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ color: colors.text, fontSize: 16 }}>{col.label}</Text>
                </TouchableOpacity>
              ))}
              {/* Preview Table */}
              <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 6, color: colors.text, marginTop: 10 }}>Page Orientation</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, backgroundColor: pdfOrientation === 'portrait' ? colors.primary : colors.surface, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.cardBorder }}
                  onPress={() => setPdfOrientation('portrait')}
                >
                  <Ionicons name={pdfOrientation === 'portrait' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: pdfOrientation === 'portrait' ? 'white' : colors.text }}>Portrait</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: pdfOrientation === 'landscape' ? colors.primary : colors.surface, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.cardBorder }}
                  onPress={() => setPdfOrientation('landscape')}
                >
                  <Ionicons name={pdfOrientation === 'landscape' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: pdfOrientation === 'landscape' ? 'white' : colors.text }}>Landscape</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: fitToPage ? colors.primary : colors.surface, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.cardBorder }}
                  onPress={() => setFitToPage(f => !f)}
                >
                  <Ionicons name={fitToPage ? 'checkbox' : 'square-outline'} size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: fitToPage ? 'white' : colors.text }}>Fit to Page</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 6, color: colors.text, marginTop: 10 }}>Preview</Text>
              <ScrollView horizontal style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <View>
                  <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.cardBorder }}>
                    {(tab === 'owner' ? ALL_OWNER_FIELDS : ALL_TRANSPORT_FIELDS).filter(col => (tab === 'owner' ? ownerCols : transportCols).includes(col.key)).map(col => (
                      <Text key={col.key} style={{ minWidth: 100, fontWeight: '700', color: colors.text, padding: 6 }}>{col.label}</Text>
                    ))}
                  </View>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.cardBorder }}>
                      {(tab === 'owner' ? ALL_OWNER_FIELDS : ALL_TRANSPORT_FIELDS).filter(col => (tab === 'owner' ? ownerCols : transportCols).includes(col.key)).map(col => (
                        <Text key={col.key} style={{ minWidth: 100, color: colors.textSecondary, padding: 6 }}>
                          Sample
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.background }}>
              <TouchableOpacity onPress={() => setColumnsModalVisible(false)} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginHorizontal: 4, backgroundColor: colors.surface }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setColumnsModalVisible(false)} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, marginHorizontal: 4, backgroundColor: colors.primary }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenLayout>
  );
} 
// TransportTemplate.tsx - PDF template generator

export interface ProfileData {
  companyName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  panNumber: string;
  logo?: string;
}

export interface BankData {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
}

// Create a compatible interface that works with the imported type
interface TransportBillData {
  bill: string | number;
  date: string | Date; // Accept both string and Date
  ms?: string;
  gstno?: string;
  otherDetail?: string;
  lrno?: string | number; // Accept both string and number
  lrDate?: string | Date; // Accept both string and Date
  from?: string;
  to?: string;
  vehicleNo?: string;
  invoiceNo?: string;
  consignorConsignee?: string;
  handleCharges?: string | number;
  detention?: string | number;
  freight?: string | number;
  total?: number;
  status?: string;
}

interface TransportTemplateProps {
  bill: TransportBillData;
  profileData: ProfileData;
  bankData: BankData;
  profileImage: string | null;
}

// Function to convert number to words
function numberToWords(num: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero Rupees Only';

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';

    let result = '';

    if (n >= 100) {
      result += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }

    if (n >= 10 && n <= 19) {
      result += teens[n - 10] + ' ';
    } else {
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }

      if (n > 0) {
        result += units[n] + ' ';
      }
    }

    return result;
  }

  let result = '';

  if (num >= 10000000) {
    result += convertLessThanThousand(Math.floor(num / 10000000)) + 'Crore ';
    num %= 10000000;
  }

  if (num >= 100000) {
    result += convertLessThanThousand(Math.floor(num / 100000)) + 'Lakh ';
    num %= 100000;
  }

  if (num >= 1000) {
    result += convertLessThanThousand(Math.floor(num / 1000)) + 'Thousand ';
    num %= 1000;
  }

  result += convertLessThanThousand(num);

  return result.trim() + ' Rupees Only';
}

/**
 * TransportTemplate component for generating HTML content for transport bill PDF
 * 
 * @param props Component props
 * @returns HTML string for PDF generation
 */
export const generateTransportTemplate = (props: TransportTemplateProps): string => {
  const { bill, profileData, bankData, profileImage } = props;

  // Use profile data or default values
  const companyName = profileData.companyName || '';
  const address = profileData.address || '';
  const phone = profileData.phone || '';
  const email = profileData.email || '';
  const gstNumber = profileData.gstNumber || '';
  const panNumber = profileData.panNumber || '';

  // Use bank data or default values
  const accountName = bankData.accountName || '';
  const accountNumber = bankData.accountNumber || '';
  const bankName = bankData.bankName || '';
  const branchName = bankData.branchName || '';
  const ifscCode = bankData.ifscCode || '';

  // Create invoice object with all the required fields
  const invoice = {
    companyName: bill.ms || '',
    gstNo: bill.gstno || '',
    otherDetails: bill.otherDetail || '',
    billNo: bill.bill || '',
    date1: bill.date || '',
    srNo: '1',
    lrNo: bill.lrno || '',
    date2: bill.lrDate || '',
    from: bill.from || '',
    to: bill.to || '',
    invNo: bill.invoiceNo || '',
    consignorConsignee: bill.consignorConsignee || '',
    vehicleNo: bill.vehicleNo || '',
    handlingCharges: bill.handleCharges || '',
    detention: bill.detention || '',
    freight: bill.freight || '',
    total: `₹${bill.total?.toLocaleString() || '0'}`,
    totalInWord: numberToWords(bill.total || 0)
  };

  // Logo URL - use provided image or default
  const logoUrl = profileImage
    ? (profileImage.startsWith('data:') ? profileImage : `data:image/png;base64,${profileImage}`)
    : '';

  // Format the date to match the image
  const formatDateString = (dateStr: string | Date): string => {
    if (!dateStr) return '';
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Format dates
  const formattedDate1 = formatDateString(bill.date);
  const formattedDate2 = formatDateString(bill.lrDate);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transport Bill - ${companyName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 2px;
      padding: 0;
      color: #000;
      background-color: #fff;
    }
    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 24px;
      background: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 2px solid #000;
      padding: 8px 6px;
      text-align: left;
      font-size: 12px;
    }
    th {
      background-color: #f2f2f2;
    }
    .header-table {
      width: 100%;
      border: none;
      margin-bottom: 0;
    }
    .header-table td {
      border: none;
      vertical-align: middle;
      padding: 0;
    }
    .header-logo-cell {
      width: 120px;
      text-align: left;
      padding-left: 16px;
      padding-top: 18px;
      padding-bottom: 18px;
    }
    .header-content-cell {
      text-align: center;
      padding-right: 16px;
      padding-top: 18px;
      padding-bottom: 18px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      margin: 5px 0;
    }
    .logo {
      max-height: 60px;
      max-width: 100px;
      display: block;
    }
    .print-btn {
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    }
    .print-btn:hover {
      background-color: #45a049;
    }
    .print-container {
      text-align: center;
      margin-top: 20px;
    }
    .empty-row {
      height: 30px;
    }
  </style>
</head>
<body>
    <table style="width:100%; border:2px solid #000; border-collapse:collapse;" class="invoice-container" >
      <thead>
        <tr>
          <td class="header-logo-cell" style="border:none; vertical-align:middle; text-align:left; width:120px; padding-left:16px; padding-top:18px; padding-bottom:18px;">
            <img class="logo" src="${logoUrl}" alt="${companyName} Logo">
          </td>
          <td class="header-content-cell" colspan="10" style="border:none; text-align:center; padding-right:16px; padding-top:18px; padding-bottom:18px;">
            <div class="company-name">${companyName}</div>
            <div>
              <span style="vertical-align: middle; margin-right: 4px;">
                <!-- Modern Location Pin SVG -->
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M12 21c-4.418 0-8-5.373-8-10A8 8 0 0 1 20 11c0 4.627-3.582 10-8 10z"/><circle cx="12" cy="11" r="3"/></svg>
              </span>
              ${address}
            </div>
            <div>
              <span style="vertical-align: middle; margin-right: 4px;">
                <!-- Telephone SVG (simple receiver) -->
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              ${phone}
              <span style="margin: 0 6px; color: #888;">/</span>
              <span style="vertical-align: middle; margin-right: 4px;">
                <!-- Email SVG -->
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
              </span>
              ${email}
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="11" style="text-align: center;">
            <strong>GSTIN:</strong> ${gstNumber} &nbsp;&nbsp;&nbsp; <strong>PAN No:</strong> ${panNumber}
          </td>
        </tr>
        <tr>
          <td colspan="8">
            <div><strong>M/s.:</strong> ${invoice.companyName}</div>
            <div><strong>GST No:</strong> ${invoice.gstNo}</div>
            <div><strong>Other Details:</strong> ${invoice.otherDetails}</div>
          </td>
          <td colspan="3">
            <div><strong>Bill No:</strong> ${invoice.billNo}</div>
            <div><strong>Date:</strong> ${formattedDate1}</div>
          </td>
        </tr>
        <tr>
          <th>Sr. No.</th>
          <th>LR No.</th>
          <th>Date</th>
          <th>From</th>
          <th>To</th>
          <th>Inv. No</th>
          <th>Consignor/Consignee</th>
          <th>Vehicle No</th>
          <th>Handling Charges</th>
          <th>Detention</th>
          <th>Freight</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${invoice.srNo}</td>
          <td>${invoice.lrNo}</td>
          <td style="white-space: nowrap;">${formattedDate2}</td>
          <td>${invoice.from}</td>
          <td>${invoice.to}</td>
          <td>${invoice.invNo}</td>
          <td>${invoice.consignorConsignee}</td>
          <td>${invoice.vehicleNo}</td>
          <td>${invoice.handlingCharges}</td>
          <td>${invoice.detention}</td>
          <td>${invoice.freight}</td>
        </tr>
        <tr>
          <td colspan="8"></td>
          <td><strong>Total</strong></td>
          <td colspan="2"><strong>${invoice.total}</strong></td>
        </tr>
        <tr>
          <td colspan="11">
            <p>Total in words: <strong>${invoice.totalInWord}</strong></p>
          </td>
        </tr>
        <tr>
          <td colspan="11">
            <div><strong>Name:</strong> ${accountName}</div>
            <div><strong>Account No:</strong> ${accountNumber}</div>
            <div><strong>IFSC Code:</strong> ${ifscCode}</div>
            <div><strong>Bank Name:</strong> ${bankName} ${branchName}</div>
          </td>
        </tr>
        <tr>
          <td colspan="11">
            <p>"We hereby certify that Input Tax Credit on inputs, input Service and Capital Goods used for providing service of transportation has not been taken under the provisions of the CGST/SGST/IGST/UTGST Act-2017. GST on Goods Transport Agency is applicable on Reverse".</p>
          </td>
        </tr>
        <tr>
          <td colspan="7">
            <p>
              <strong>Note:</strong> Payment should be made within 15-30 days on receipt of this bill; otherwise, an interest will be charged @24% per annum.<br>
              <strong>Terms & Conditions:</strong> Please make all cheques payable to: Please clear the previous outstanding amount along with this invoice.
            </p>
          </td>
          <td colspan="4">
            <div style="padding: 10px;">
              <div>For <strong>${companyName}</strong></div>
              <div style="height: 40px;"></div>
              <div><strong>Authorised Signatory</strong></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
</body>
</html>`;
};

export default generateTransportTemplate;
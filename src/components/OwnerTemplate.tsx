// OwnerTemplate.tsx - PDF/HTML template generator for Owner bills

export interface OwnerData {
  id?: string | number;
  uniqueId?: string;
  syncId?: string;
  date?: string | Date;
  contactNo?: number;
  vehicleNo?: string;
  from?: string;
  to?: string;
  ownerNameAndAddress?: string;
  panNo?: string;
  driverNameAndMob?: string;
  licenceNo?: string;
  chasisNo?: string;
  engineNo?: string;
  insuranceCo?: string;
  policyNo?: string;
  insuranceDate?: string | Date;
  policyDate?: string | Date;
  srno?: number;
  lrno?: number;
  packages?: string | number;
  description?: string;
  wtKgs?: string | number;
  remarks?: string;
  brokerName?: string;
  brokerPanNo?: string;
  lorryHireAmount?: string | number;
  accNo?: string | number;
  aCNo?: string | number;
  otherChargesHamliDetentionHeight?: string | number;
  totalLorryHireRs?: number;
  advAmt1?: string | number;
  advAmt2?: string | number;
  advAmt3?: string | number;
  advDate1?: string | Date;
  advDate2?: string | Date;
  advDate3?: string | Date;
  neftImpsIdno1?: string;
  neftImpsIdno2?: string;
  neftImpsIdno3?: string;
  balanceAmt?: string | number;
  deductionInClaimPenalty?: string | number;
  netBalanceAmt?: string | number;
  finalNeftImpsIdno?: string;
  finalDate?: string | Date;
  deliveryDate?: string | Date;
  status?: string;
}

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

// Number to words (simple, INR)
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

export const generateOwnerTemplate = (bill: OwnerData, profileData?: ProfileData): string => {
  // Use profile data or default values
  const companyName = profileData?.companyName ;
  const address = profileData?.address ;
  const phone = profileData?.phone ;
  const email = profileData?.email ;
  const gstNumber = profileData?.gstNumber ;
  const panNumber = profileData?.panNumber ;
  // Format date
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };
  const formattedDate = formatDate(bill.date);
  const insuranceDate = formatDate(bill.insuranceDate);
  // HTML template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lorry Hire Payment - ${companyName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2px; color: #000; background: #fff; }
    .container { max-width: 900px; margin: 0 auto; border: 2px solid #000; padding: 18px; background: #fff; }
    .header { text-align: center; margin-bottom: 8px; }
    .header .title { font-size: 26px; font-weight: bold; }
    .header .subtitle { font-size: 16px; font-weight: 600; margin-top: 2px; }
    .header .contact { font-size: 13px; margin-top: 2px; }
    .section { margin-bottom: 8px; }
    .row { display: flex; flex-wrap: wrap; margin-bottom: 2px; }
    .row label { min-width: 180px; font-weight: 600; }
    .row .value { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1.5px solid #000; padding: 4px 6px; font-size: 12px; }
    th { background: #f2f2f2; }
    .footer { margin-top: 16px; font-size: 12px; }
    .sign-row { display: flex; justify-content: space-between; margin-top: 32px; }
    .sign-box { text-align: center; width: 40%; }
    .note-box { border: 1px solid #000; padding: 8px; margin-top: 10px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">${companyName}</div>
      <div class="subtitle">LORRY HIRE PAYMENT</div>
      <div class="contact">${address}<br>
        GSTIN: ${gstNumber} &nbsp; &nbsp; ${email}<br>
        <b>${phone}</b>
      </div>
    </div>
    <div class="section">
      <div class="row"><label>Lorry Hire Contract No.:</label> <div class="value"></div> <label>Date:</label> <div class="value">${formattedDate}</div></div>
      <div class="row"><label>Lorry No.:</label> <div class="value">${bill.vehicleNo || ''}</div> <label>From:</label> <div class="value">${bill.from || ''}</div> <label>To:</label> <div class="value">${bill.to || ''}</div></div>
      <div class="row"><label>Owner Name & Add.:</label> <div class="value">${bill.ownerNameAndAddress || ''}</div> <label>PAN No.:</label> <div class="value">${bill.panNo || ''}</div></div>
      <div class="row"><label>Driver Name & Mob. No.:</label> <div class="value">${bill.driverNameAndMob || ''}</div> <label>Licence No.:</label> <div class="value">${bill.licenceNo || ''}</div></div>
      <div class="row"><label>Chassis No.:</label> <div class="value">${bill.chasisNo || ''}</div> <label>Engine No.:</label> <div class="value">${bill.engineNo || ''}</div></div>
      <div class="row"><label>Insurance Co.:</label> <div class="value">${bill.insuranceCo || ''}</div> <label>Policy No.:</label> <div class="value">${bill.policyNo || ''}</div> <label>Date:</label> <div class="value">${insuranceDate}</div></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Sr. No.</th>
          <th>L.R. No.</th>
          <th>Packages</th>
          <th>Description</th>
          <th>Wt. Kgs</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td></td>
          <td>${bill.packages || ''}</td>
          <td>${bill.description || ''}</td>
          <td>${bill.wtKgs || ''}</td>
          <td>${bill.remarks || ''}</td>
        </tr>
      </tbody>
    </table>
    <div class="section">
      <div class="row"><label>Broker Name:</label> <div class="value">${bill.brokerName || ''}</div> <label>PAN No.:</label> <div class="value">${bill.brokerPanNo || ''}</div></div>
      <div class="row"><label>Lorry Hire Amount:</label> <div class="value">${bill.lorryHireAmount || ''}</div> <label>A/C No.:</label> <div class="value">${bill.aCNo || ''}</div></div>
      <div class="row"><label>Other Charges - Hamali / Detention / Height:</label> <div class="value">${bill.otherChargesHamliDetentionHeight || ''}</div></div>
      <div class="row"><label>Total Lorry Hire Rs.:</label> <div class="value">${bill.totalLorryHireRs || ''}</div></div>
      <div class="row"><label>TDS Amount Rs.:</label> <div class="value"></div></div>
      <div class="row"><label>Adv. Amt.:</label> <div class="value">${bill.advAmt1 || ''}</div> <label>Date:</label> <div class="value"></div> <label>NEFT / IMPS / ID No.:</label> <div class="value"></div></div>
      <div class="row"><label>Adv. Amt.:</label> <div class="value">${bill.advAmt2 || ''}</div> <label>NEFT / IMPS / ID No.:</label> <div class="value"></div> <label>Date:</label> <div class="value"></div></div>
      <div class="row"><label>Adv. Amt.:</label> <div class="value">${bill.advAmt3 || ''}</div> <label>NEFT / IMPS / ID No.:</label> <div class="value"></div> <label>Date:</label> <div class="value"></div></div>
      <div class="row"><label>Balance Amount:</label> <div class="value">${bill.balanceAmt || ''}</div></div>
      <div class="row"><label>Other Charges Hamali / Detention / Height:</label> <div class="value"></div></div>
      <div class="row"><label>Deduction in Claim / Penalty:</label> <div class="value">${bill.deductionInClaimPenalty || ''}</div></div>
      <div class="row"><label>Net Balance Amt:</label> <div class="value">${bill.netBalanceAmt || ''}</div> <label>NEFT / IMPS / ID No.:</label> <div class="value"></div> <label>Date:</label> <div class="value"></div></div>
    </div>
    <div class="note-box">
      <ol style="margin:0; padding-left: 18px;">
        <li>Material Should be delivered on or before date: ________ otherwise delay delivery charges @ 2% per day on total lorry hire will be deducted.</li>
        <li>Goods loaded in good & sound condition.</li>
        <li>All risk & responsibilities rest with lorry Owner / Driver / Agent for the safe movement & safe delivery of goods.</li>
        <li>Amount should be submitted within 15 days from the date of delivery otherwise balance freight will not be paid</li>
        <li>Unloading Charges Rs. 400/- for 7mt, Rs. 600/- for 16mt, Rs. 800/- for 20mt. will be deducted from the balance freight</li>
      </ol>
      <div style="margin-top: 4px;">I/We agree to all the terms & conditions mentioned above and overleaf.</div>
    </div>
    <div class="sign-row">
      <div class="sign-box">Driver / Owner's Sign.</div>
      <div class="sign-box">For DGT LOGISTICS<br>Dispatch Supervisor</div>
    </div>
    <div class="footer">ADVANCE PAYMENT COPY</div>
  </div>
</body>
</html>`;
};

export default generateOwnerTemplate; 
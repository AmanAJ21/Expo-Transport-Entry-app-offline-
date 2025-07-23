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
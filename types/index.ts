export interface Donor {
  id: string;
  name: string;
  dateOfBirth: Date;
  phone: string;
  address: string;
  email?: string;
  donationType: DonationType;
  membership: MembershipType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  totalDonations: number;
  lastDonationDate?: Date;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  donorId: string;
  donorName: string;
  donationType: DonationType;
  amount: number;
  paymentMode: PaymentMode;
  createdBy: string;
  dateOfDonation: Date;
  notes?: string;
  isPrinted: boolean;
  isEmailSent: boolean;
  createdAt: Date;
}

export interface SMSEvent {
  id: string;
  eventName: string;
  messageContent: string;
  recipients: string[]; // donor IDs
  sentDate: Date;
  createdBy: string;
  totalRecipients: number;
}

export interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  onlinePayments: number;
  offlinePayments: number;
  qrPayments: number;
  topDonors: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  recentDonations: Receipt[];
  upcomingEvents: Array<{
    id: string;
    name: string;
    date: Date;
  }>;
}

export type DonationType =
  | "General Donation"
  | "Seva Donation"
  | "Annadanam"
  | "Vastra Danam"
  | "Building Fund"
  | "Festival Sponsorship"
  | "Puja Sponsorship";

export type MembershipType = "Regular" | "Life" | "Special";

export type PaymentMode = "Online" | "Offline" | "QR Payment";

export type UserRole = "Admin" | "Billing Staff" | "Event Coordinator";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  joinDate: Date;
  emailVerified: boolean;
}

export interface PujaHistory {
  id: string;
  donorId: string;
  pujaName: string;
  date: Date;
  amount: number;
  priest: string;
}

export interface DonationHistory {
  donations: Receipt[];
  totalAmount: number;
  averageAmount: number;
  lastDonation?: Receipt;
}

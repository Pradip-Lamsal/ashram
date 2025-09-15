export interface Donor {
  id: string;
  name: string;
  dateOfBirth?: Date | null;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  donationType: DonationType;
  membership: MembershipType;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalDonations: number;
  lastDonationDate?: Date | null;
  deletedAt?: Date | null;
}

export interface Donation {
  id: string;
  donorId: string;
  donationType: DonationType;
  amount: number;
  paymentMode: PaymentMode;
  dateOfDonation: Date;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Receipt {
  id: string;
  donationId: string;
  receiptNumber: string;
  issuedAt: Date;
  isPrinted: boolean;
  isEmailSent: boolean;
  createdAt: Date;
  deletedAt?: Date | null;
  // Extended fields for legacy compatibility
  donorId?: string;
  donorName?: string;
  donationType?: DonationType;
  amount?: number;
  paymentMode?: PaymentMode;
  createdBy?: string;
  dateOfDonation?: Date;
  notes?: string;
}

export interface SMSEvent {
  id: string;
  eventName: string;
  messageContent: string;
  recipientDonorIds: string[];
  sentDate: Date;
  createdBy?: string | null;
  totalRecipients: number;
  createdAt: Date;
  deletedAt?: Date | null;
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

export type UserRole =
  | "admin"
  | "billing_staff"
  | "event_coordinator"
  | "devotee";

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

import {
  DonationType,
  Donor,
  MembershipType,
  PaymentMode,
  Receipt,
  SMSEvent,
} from "@/types";

// Mock donors data
export const mockDonors: Donor[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    dateOfBirth: new Date("1975-03-15"),
    phone: "+91 98765 43210",
    address: "123 Temple Street, Delhi, India",
    email: "rajesh.kumar@email.com",
    donationType: "General Donation",
    membership: "Life",
    notes: "Regular contributor, prefers online payments",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-08-20"),
    totalDonations: 125000,
    lastDonationDate: new Date("2024-08-15"),
  },
  {
    id: "2",
    name: "Priya Sharma",
    dateOfBirth: new Date("1982-07-22"),
    phone: "+91 87654 32109",
    address: "456 Ashram Road, Mumbai, India",
    email: "priya.sharma@email.com",
    donationType: "Annadanam",
    membership: "Regular",
    notes: "Sponsors monthly annadanam",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2024-08-18"),
    totalDonations: 45000,
    lastDonationDate: new Date("2024-08-10"),
  },
  {
    id: "3",
    name: "Anand Patel",
    dateOfBirth: new Date("1968-11-05"),
    phone: "+91 76543 21098",
    address: "789 Seva Nagar, Ahmedabad, India",
    donationType: "Building Fund",
    membership: "Special",
    notes: "Major contributor to infrastructure",
    createdAt: new Date("2022-12-01"),
    updatedAt: new Date("2024-08-16"),
    totalDonations: 250000,
    lastDonationDate: new Date("2024-08-05"),
  },
  {
    id: "4",
    name: "Meera Devi",
    dateOfBirth: new Date("1955-09-12"),
    phone: "+91 65432 10987",
    address: "321 Bhakti Marg, Varanasi, India",
    email: "meera.devi@email.com",
    donationType: "Puja Sponsorship",
    membership: "Life",
    notes: "Sponsors weekly pujas",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2024-08-12"),
    totalDonations: 85000,
    lastDonationDate: new Date("2024-08-01"),
  },
  {
    id: "5",
    name: "Suresh Gupta",
    dateOfBirth: new Date("1978-04-18"),
    phone: "+91 54321 09876",
    address: "654 Dharma Path, Pune, India",
    donationType: "Seva Donation",
    membership: "Regular",
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2024-08-08"),
    totalDonations: 32000,
    lastDonationDate: new Date("2024-07-28"),
  },
];

// Mock receipts data
export const mockReceipts: Receipt[] = [
  {
    id: "1",
    receiptNumber: "ASH789123456",
    donorId: "1",
    donorName: "Rajesh Kumar",
    donationType: "General Donation",
    amount: 5000,
    paymentMode: "Online",
    createdBy: "Admin User",
    dateOfDonation: new Date("2024-08-15"),
    notes: "Monthly contribution",
    isPrinted: true,
    isEmailSent: true,
    createdAt: new Date("2024-08-15"),
  },
  {
    id: "2",
    receiptNumber: "ASH789123457",
    donorId: "2",
    donorName: "Priya Sharma",
    donationType: "Annadanam",
    amount: 2500,
    paymentMode: "QR Payment",
    createdBy: "Billing Staff",
    dateOfDonation: new Date("2024-08-10"),
    notes: "Annadanam sponsorship",
    isPrinted: false,
    isEmailSent: true,
    createdAt: new Date("2024-08-10"),
  },
  {
    id: "3",
    receiptNumber: "ASH789123458",
    donorId: "3",
    donorName: "Anand Patel",
    donationType: "Building Fund",
    amount: 25000,
    paymentMode: "Offline",
    createdBy: "Admin User",
    dateOfDonation: new Date("2024-08-05"),
    notes: "Infrastructure development",
    isPrinted: true,
    isEmailSent: false,
    createdAt: new Date("2024-08-05"),
  },
  {
    id: "4",
    receiptNumber: "ASH789123459",
    donorId: "4",
    donorName: "Meera Devi",
    donationType: "Puja Sponsorship",
    amount: 3500,
    paymentMode: "Online",
    createdBy: "Billing Staff",
    dateOfDonation: new Date("2024-08-01"),
    notes: "Weekly puja sponsorship",
    isPrinted: true,
    isEmailSent: true,
    createdAt: new Date("2024-08-01"),
  },
  {
    id: "5",
    receiptNumber: "ASH789123460",
    donorId: "5",
    donorName: "Suresh Gupta",
    donationType: "Seva Donation",
    amount: 1500,
    paymentMode: "QR Payment",
    createdBy: "Event Coordinator",
    dateOfDonation: new Date("2024-07-28"),
    isPrinted: false,
    isEmailSent: false,
    createdAt: new Date("2024-07-28"),
  },
];

// Mock SMS events data
export const mockSMSEvents: SMSEvent[] = [
  {
    id: "1",
    eventName: "Janmashtami Celebration",
    messageContent:
      "Join us for Janmashtami celebrations on Aug 26th. Special pujas and annadanam. Your presence will be a blessing.",
    recipients: ["1", "2", "4"],
    sentDate: new Date("2024-08-20"),
    createdBy: "Event Coordinator",
    totalRecipients: 3,
  },
  {
    id: "2",
    eventName: "Monthly Donation Reminder",
    messageContent:
      "Dear devotee, this is a gentle reminder for your monthly contribution. May your seva bring divine blessings.",
    recipients: ["1", "2", "3", "4", "5"],
    sentDate: new Date("2024-08-01"),
    createdBy: "Admin User",
    totalRecipients: 5,
  },
];

// Donation types
export const donationTypes: DonationType[] = [
  "General Donation",
  "Seva Donation",
  "Annadanam",
  "Vastra Danam",
  "Building Fund",
  "Festival Sponsorship",
  "Puja Sponsorship",
];

// Membership types
export const membershipTypes: MembershipType[] = ["Regular", "Life", "Special"];

// Payment modes
export const paymentModes: PaymentMode[] = ["Online", "Offline", "QR Payment"];

// Dashboard stats
export const mockDashboardStats = {
  totalDonations: 156,
  totalAmount: 847500,
  onlinePayments: 65,
  offlinePayments: 54,
  qrPayments: 37,
  topDonors: [
    { id: "3", name: "Anand Patel", amount: 250000 },
    { id: "1", name: "Rajesh Kumar", amount: 125000 },
    { id: "4", name: "Meera Devi", amount: 85000 },
  ],
  recentDonations: mockReceipts.slice(0, 5),
  upcomingEvents: [
    { id: "1", name: "Janmashtami Celebration", date: new Date("2024-08-26") },
    { id: "2", name: "Ganesh Chaturthi", date: new Date("2024-09-07") },
    { id: "3", name: "Monthly Annadanam", date: new Date("2024-09-01") },
  ],
};

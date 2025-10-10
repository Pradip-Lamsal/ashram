// Shared donation type labels mapping - English keys to Nepali labels
export const DONATION_TYPE_LABELS: Record<string, string> = {
  "General Donation": "अक्षयकोष",
  "Seva Donation": "मुठ्ठी दान",
  Annadanam: "गुरुकुलम",
  "Vastra Danam": "जिन्सी सामग्री",
  "Building Fund": "भण्डारा",
  "Festival Sponsorship": "विशेष पूजा",
  "Puja Sponsorship": "आजीवन सदस्यता",
};

// Function to get display label for donation type
export function getDonationTypeLabel(type: string): string {
  return DONATION_TYPE_LABELS[type] || type;
}

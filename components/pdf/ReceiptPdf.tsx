import {
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View
} from "@react-pdf/renderer";

// Font registration is handled in the parent component (client) or API route (server)
// to ensure correct path resolution in different environments.

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Noto Sans Devanagari",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  // Header styles
  header: {
    borderBottom: "2pt solid #ea580c",
    paddingBottom: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  logoSection: {
    width: 80,
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  registrationText: {
    fontSize: 7,
    color: "#4b5563",
    marginBottom: 2,
  },
  centerSection: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: "center",
  },
  omSymbol: {
    fontSize: 18,
    color: "#ea580c",
    marginBottom: 4,
  },
  sanskritText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#c2410c",
    marginBottom: 4,
  },
  orgName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  orgSubtitle: {
    fontSize: 10,
    fontWeight: "semibold",
    color: "#1f2937",
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 8,
    color: "#374151",
    marginBottom: 2,
  },
  emailText: {
    fontSize: 8,
    color: "#2563eb",
  },
  receiptBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#fff7ed",
    border: "1pt solid #fed7aa",
    borderRadius: 4,
  },
  receiptNumber: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#9a3412",
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 8,
    color: "#ea580c",
  },
  // Two column layout
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  infoCard: {
    padding: 12,
    backgroundColor: "#f9fafb",
    border: "1pt solid #e5e7eb",
    borderRadius: 4,
  },
  infoCardOrange: {
    padding: 12,
    backgroundColor: "#fff7ed",
    border: "1pt solid #fed7aa",
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  cardValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
  },
  cardValueMono: {
    fontSize: 7,
    color: "#374151",
  },
  // Donation info section
  donationSection: {
    padding: 12,
    backgroundColor: "#fff7ed",
    border: "2pt solid #fed7aa",
    borderRadius: 4,
    marginBottom: 16,
  },
  donationTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#9a3412",
    textAlign: "center",
    marginBottom: 12,
  },
  threeColumnRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  donationCard: {
    flex: 1,
    padding: 8,
    backgroundColor: "#ffffff",
    border: "1pt solid #fed7aa",
    borderRadius: 4,
  },
  donationCardLabel: {
    fontSize: 7,
    color: "#6b7280",
    marginBottom: 4,
  },
  donationCardValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9a3412",
    textAlign: "center",
  },
  donationCardValueBlue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1d4ed8",
    textAlign: "center",
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ea580c",
  },
  notesCard: {
    padding: 8,
    backgroundColor: "#ffffff",
    border: "1pt solid #fed7aa",
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 7,
    color: "#6b7280",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#374151",
  },
  // Amount in words section
  amountWordsSection: {
    padding: 12,
    backgroundColor: "#fff7ed",
    border: "2pt solid #fed7aa",
    borderRadius: 4,
    marginBottom: 16,
  },
  amountWordsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#9a3412",
    textAlign: "center",
    marginBottom: 8,
  },
  amountWordsBox: {
    padding: 8,
    backgroundColor: "#ffffff",
    border: "2pt dashed #fdba74",
    borderRadius: 4,
  },
  amountWordsText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#7c2d12",
    textAlign: "center",
  },
  // Footer
  footer: {
    borderTop: "2pt solid #ea580c",
    paddingTop: 12,
    marginTop: 16,
  },
  signatureSection: {
    alignItems: "flex-end",
  },
  signatureBox: {
    paddingTop: 8,
    marginTop: 8,
    borderTop: "1pt solid #d1d5db",
  },
  signatureLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 8,
  },
  signatureLine: {
    width: 150,
    borderBottom: "1pt solid #d1d5db",
    height: 20,
    marginBottom: 4,
  },
  signatureDate: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

// Donation type labels mapping
const DONATION_TYPE_LABELS: Record<string, string> = {
  "General Donation": "अक्षयकोष",
  "Seva Donation": "मुठ्ठी दान",
  Annadanam: "गुरुकुलम",
  "Vastra Danam": "जिन्सी सामग्री",
  "Building Fund": "भण्डारा",
  "Festival Sponsorship": "विशेष पूजा",
  "Puja Sponsorship": "आजीवन सदस्यता",
  "Gau Seva": "गौ सेवा",
};

// Helper function to get display donation type
const getDisplayDonationType = (type: string): string => {
  return DONATION_TYPE_LABELS[type] || type;
};

// Helper function to format date
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN");
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `रु ${amount.toLocaleString("en-IN")}`;
};

interface ReceiptPdfProps {
  receiptNumber: string;
  donorName: string;
  donorId?: string;
  amount: number;
  createdAt: Date | string;
  donationType: string;
  paymentMode: string;
  dateOfDonation?: Date | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  startDateNepali?: string;
  endDateNepali?: string;
  notes?: string;
  createdBy?: string;
  logo1Src?: string | Buffer;
  logo2Src?: string | Buffer;
}

const ReceiptPdf = ({
  receiptNumber,
  donorName,
  donorId,
  amount,
  createdAt,
  donationType,
  paymentMode,
  dateOfDonation,
  startDate,
  endDate,
  startDateNepali,
  endDateNepali,
  notes,
  createdBy,
  logo1Src = "/logo11.jpeg",
  logo2Src = "/logo22.jpeg",
}: ReceiptPdfProps) => {
  // Format donation date based on type
  const formatDonationDate = (): string => {
    if (donationType === "Seva Donation") {
      // Use Nepali dates if available
      if (startDateNepali && endDateNepali) {
        return `${startDateNepali} - ${endDateNepali}`;
      }
      // Fallback to English dates
      if (startDate && endDate) {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
    }
    // For regular donations
    if (dateOfDonation) {
      return formatDate(dateOfDonation);
    }
    return "N/A";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {/* Left Logo Section */}
            <View style={styles.logoSection}>
              <Text style={styles.registrationText}>
                जि.प्र.का.ल.पु.द.नं. ४५४५/०६८
              </Text>
              <Text style={styles.registrationText}>पान नं ६००५९५६९०</Text>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image
                src={logo1Src}
                style={styles.logo}
                cache={false}
              />
            </View>

            {/* Center Section */}
            <View style={styles.centerSection}>
              <Text style={styles.omSymbol}>ॐ</Text>
              <Text style={styles.sanskritText}>
                श्रीराधासर्वेश्वरो विजयते
              </Text>
              <Text style={styles.orgName}>
                श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर
              </Text>
              <Text style={styles.orgSubtitle}>
                व्यवस्थापन तथा सञ्चालन समिति
              </Text>
              <Text style={styles.contactInfo}>
                ललितपुर म.न.पा.-९, शङ्खमूल, ललितपुर
              </Text>
              <Text style={styles.contactInfo}>फोन नं. ०१-५९१५६६७</Text>
              <Text style={styles.emailText}>
                E-mail: jashankhamul@gmail.com
              </Text>
            </View>

            {/* Right Logo Section */}
            <View style={styles.logoSection}>
              <Text style={styles.registrationText}>
                स.क.प.आवद्धता नं. ३५०९१
              </Text>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image
                src={logo2Src}
                style={styles.logo}
                cache={false}
              />
            </View>
          </View>

          {/* Receipt Info Box */}
          <View style={styles.receiptBox}>
            <Text style={styles.receiptNumber}>Receipt #{receiptNumber}</Text>
            <Text style={styles.receiptDate}>
              Issued on {formatDate(createdAt)}
            </Text>
          </View>
        </View>

        {/* Two Column Layout - Donor and Receipt Info */}
        <View style={styles.twoColumnRow}>
            {/* Donor Information */}
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <View style={styles.cardTitle}>
                <Svg width={12} height={12} viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                  <Path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"
                    stroke="#111827"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text>Donor Information</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Name:</Text>
                <Text style={styles.cardValue}>{donorName}</Text>
              </View>
              {donorId && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Donor ID:</Text>
                  <Text style={styles.cardValueMono}>{donorId}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Receipt Details */}
          <View style={styles.column}>
            <View style={styles.infoCardOrange}>
              <Text style={styles.cardTitle}>Receipt Details</Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Donation Date:</Text>
                <Text style={styles.cardValue}>{formatDonationDate()}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Issued By:</Text>
                <Text style={styles.cardValue}>{createdBy || "System"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Donation Information Section */}
        <View style={styles.donationSection}>
          <Text style={styles.donationTitle}>Donation Information</Text>

          <View style={styles.threeColumnRow}>
            {/* Donation Type */}
            <View style={styles.donationCard}>
              <Text style={styles.donationCardLabel}>Donation Type</Text>
              <Text style={styles.donationCardValue}>
                {getDisplayDonationType(donationType)}
              </Text>
            </View>

            {/* Payment Mode */}
            <View style={styles.donationCard}>
              <Text style={styles.donationCardLabel}>Payment Mode</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={12} height={12} viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                  <Path
                    d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"
                    stroke="#1d4ed8"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={{ fontSize: 10, fontWeight: "bold", color: "#1d4ed8" }}>
                  {paymentMode}
                </Text>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.donationCard}>
              <Text style={styles.donationCardLabel}>Amount Donated</Text>
              <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
            </View>
          </View>

          {/* Notes if available */}
          {notes && (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>Special Notes</Text>
              <Text style={styles.notesText}>&quot;{notes}&quot;</Text>
            </View>
          )}
        </View>

        {/* Amount in Words */}
        <View style={styles.amountWordsSection}>
          <Text style={styles.amountWordsTitle}>Amount in Words</Text>
          <View style={styles.amountWordsBox}>
            <Text style={styles.amountWordsText}>
              Rupees {amount.toLocaleString("en-IN")} Only
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Authorized Signature</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureDate}>
                Date: {new Date().toLocaleDateString("en-IN")}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPdf;

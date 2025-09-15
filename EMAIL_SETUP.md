# Gmail Email Setup for Ashram Management

## Setup Instructions

### 1. Create Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification (enable if not already)
3. Go to Security → App passwords
4. Select "Mail" and "Other (Custom name)"
5. Enter "Ashram Management" as the app name
6. Copy the generated 16-character password

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# Gmail Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### 3. Usage Examples

#### Send Receipt Email

```typescript
import { sendReceiptEmail } from "@/lib/email";

const receipt = {
  receipt_number: "ASH789123456",
  issued_at: "2025-09-14",
  donation: {
    donor: { name: "John Doe" },
    donation_type: "General Donation",
    payment_mode: "Online",
    amount: 5000,
  },
};

const result = await sendReceiptEmail(receipt, "donor@email.com");
if (result.success) {
  console.log("Email sent successfully!");
} else {
  console.error("Failed to send email:", result.error);
}
```

#### Send Verification Email

```typescript
import { sendVerificationEmail } from "@/lib/email";

const result = await sendVerificationEmail("user@email.com", "123456");
if (result.success) {
  console.log("Verification email sent!");
}
```

### 4. API Route Example

Create `/app/api/send-receipt/route.ts`:

```typescript
import { sendReceiptEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { receipt, email } = await request.json();

    const result = await sendReceiptEmail(receipt, email);

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 5. Update Receipt Modal

In `components/modals/ReceiptModal.tsx`, replace mock email function:

```typescript
const handleEmailReceipt = async () => {
  try {
    const response = await fetch("/api/send-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receipt,
        email: receipt.donation?.donor?.email || "donor@example.com",
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Email sent successfully!");
      // Update receipt status in database
    } else {
      alert("Failed to send email: " + result.error);
    }
  } catch (error) {
    alert("Error sending email");
  }
};
```

### 6. Security Notes

- Never commit your Gmail credentials to version control
- Use environment variables for all sensitive data
- Consider using a dedicated email service (SendGrid, AWS SES) for production
- Implement rate limiting for email sending
- Add email validation before sending

### 7. Testing

1. Set up your Gmail credentials in `.env.local`
2. Test with your own email first
3. Check spam folder if emails don't arrive
4. Monitor Gmail's daily sending limits (500 emails/day for regular accounts)

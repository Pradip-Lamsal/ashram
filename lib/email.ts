import nodemailer from "nodemailer";
import { englishToNepaliDateFormatted } from "./nepali-date-utils";

export interface Receipt {
  id: string;
  donor_name: string;
  amount: number;
  date: string;
  receipt_type: string;
  donation_type?: string;
  start_date?: string;
  end_date?: string;
  start_date_nepali?: string;
  end_date_nepali?: string;
  notes?: string;
}

// Create Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Helper function to format donation date for email
const formatEmailDonationDate = (receipt: Receipt): string => {
  if (receipt.donation_type === "Seva Donation") {
    // If we have Nepali date strings, use them directly (more accurate)
    if (receipt.start_date_nepali && receipt.end_date_nepali) {
      return `${receipt.start_date_nepali} देखि ${receipt.end_date_nepali} सम्म`;
    }

    // Fallback to converting English dates to Nepali
    if (receipt.start_date && receipt.end_date) {
      const startNepali = englishToNepaliDateFormatted(
        new Date(receipt.start_date)
      );
      const endNepali = englishToNepaliDateFormatted(
        new Date(receipt.end_date)
      );
      return `${startNepali} देखि ${endNepali} सम्म`;
    }
  }

  // For regular donations, show the donation date in Nepali format for consistency
  if (receipt.date) {
    return englishToNepaliDateFormatted(new Date(receipt.date));
  }

  return "N/A";
};

// Send receipt email to donor
export const sendReceiptEmail = async (
  donorEmail: string,
  receipt: Receipt,
  pdfBuffer?: Buffer
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Ashram Management" <${process.env.GMAIL_USER}>`,
      to: donorEmail,
      subject: `🙏 Thank You - Donation Receipt ${receipt.id} | Ashram Management`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ea580c, #dc2626); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🙏 Thank You for Your Donation</h1>
            <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">Your generosity supports our spiritual community</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: #ffffff;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong style="color: #ea580c;">${
                receipt.donor_name
              }</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              We are deeply grateful for your generous donation to our ashram. Your contribution helps us continue our spiritual and community work, supporting devotees and maintaining our sacred space.
            </p>
            
            <!-- Receipt Details Card -->
            <div style="background: linear-gradient(135deg, #fef3c7, #fed7aa); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #ea580c;">
              <h3 style="color: #ea580c; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">📋 Receipt Details</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr style="background-color: #fef3c7;">
                  <td style="padding: 12px 16px; font-weight: 600; color: #92400e; border-bottom: 1px solid #fed7aa;">Receipt ID:</td>
                  <td style="padding: 12px 16px; color: #374151; border-bottom: 1px solid #fed7aa; font-family: 'Courier New', monospace;">${
                    receipt.id
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-weight: 600; color: #92400e; border-bottom: 1px solid #f3f4f6;">Amount:</td>
                  <td style="padding: 12px 16px; color: #ea580c; font-weight: 700; font-size: 18px; border-bottom: 1px solid #f3f4f6;">रु${receipt.amount.toFixed(
                    2
                  )}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 16px; font-weight: 600; color: #92400e; border-bottom: 1px solid #f3f4f6;">Date:</td>
                  <td style="padding: 12px 16px; color: #374151; border-bottom: 1px solid #f3f4f6;">${formatEmailDonationDate(
                    receipt
                  )}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-weight: 600; color: #92400e; border-bottom: 1px solid #f3f4f6;">Type:</td>
                  <td style="padding: 12px 16px; color: #374151; border-bottom: 1px solid #f3f4f6;">${
                    receipt.receipt_type
                  }</td>
                </tr>
                ${
                  receipt.notes
                    ? `
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 16px; font-weight: 600; color: #92400e;">Notes:</td>
                  <td style="padding: 12px 16px; color: #374151; font-style: italic;">"${receipt.notes}"</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>
            
            <!-- Tax Information -->
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="color: #065f46; font-size: 14px; margin: 0; text-align: center;">
                <strong>💡 Tax Information:</strong> This receipt serves as confirmation of your donation for tax deduction purposes. Please keep this for your records.
              </p>
              ${
                pdfBuffer
                  ? `
              ${
                pdfBuffer
                  ? `
              <p style="color: #065f46; font-size: 14px; margin: 10px 0 0 0; text-align: center;">
                <strong>📎 PDF Attachment:</strong> A detailed receipt is attached to this email for your convenience.
              </p>
              `
                  : `
              <p style="color: #f59e0b; font-size: 14px; margin: 10px 0 0 0; text-align: center;">
                <strong>📧 Email Receipt:</strong> Your receipt details are included in this email. You can print this email for your records.
              </p>
              `
              }
              `
                  : ""
              }
            </div>
            
            <!-- Thank You Message -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #ea580c; font-size: 20px; font-weight: 600; margin-bottom: 10px;">🙏 May your generosity bring you blessings 🙏</p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                Your donation helps us maintain our sacred space, support spiritual programs,<br>
                and serve our community with love and devotion.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 3px solid #ea580c;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong style="color: #ea580c;">Ashram Management Team</strong><br>
              🕉️ Serving with devotion and gratitude 🕉️
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
      attachments: pdfBuffer
        ? [
            {
              filename: `receipt-${receipt.id}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : undefined,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Receipt email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Send verification email for new users
export const sendVerificationEmail = async (
  userEmail: string,
  userName: string,
  verificationLink: string
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Ashram Management" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: "🕉️ Welcome to Ashram Management - Please Verify Your Account",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ea580c, #dc2626); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🙏 Welcome to Ashram Management</h1>
            <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">Please verify your account to get started</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px 20px; background-color: #ffffff;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong style="color: #ea580c;">${userName}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for joining our ashram management system. To complete your registration and ensure the security of your account, please verify your email address by clicking the button below:
            </p>
            
            <!-- Verification Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationLink}" 
                 style="background: linear-gradient(135deg, #ea580c, #dc2626); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block; 
                        font-weight: 600; 
                        font-size: 16px;
                        box-shadow: 0 4px 6px rgba(234, 88, 12, 0.3);
                        transition: all 0.3s ease;">
                ✅ Verify Email Address
              </a>
            </div>
            
            <!-- Alternative Link -->
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="color: #374151; font-size: 14px; margin-bottom: 10px;">
                <strong>Can't click the button?</strong> Copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; color: #ea580c; font-size: 12px; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 8px; border-radius: 4px; border: 1px solid #fed7aa;">
                ${verificationLink}
              </p>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0; text-align: center;">
                <strong>🔒 Security Notice:</strong> If you didn't create this account, please ignore this email. The link will expire in 24 hours.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 3px solid #ea580c;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong style="color: #ea580c;">Ashram Management Team</strong><br>
              🕉️ Serving with devotion and gratitude 🕉️
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return { success: true };
  } catch (error) {
    console.error("Email configuration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

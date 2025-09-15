import nodemailer from "nodemailer";

export interface Receipt {
  id: string;
  donor_name: string;
  amount: number;
  date: string;
  receipt_type: string;
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
      subject: `Receipt for Your Donation - ${receipt.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank You for Your Donation</h2>
          
          <p>Dear ${receipt.donor_name},</p>
          
          <p>We are grateful for your generous donation to our ashram. Your contribution helps us continue our spiritual and community work.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Receipt Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Receipt ID:</td>
                <td style="padding: 8px 0;">${receipt.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0;">$${receipt.amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0;">${new Date(
                  receipt.date
                ).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Type:</td>
                <td style="padding: 8px 0;">${receipt.receipt_type}</td>
              </tr>
              ${
                receipt.notes
                  ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Notes:</td>
                <td style="padding: 8px 0;">${receipt.notes}</td>
              </tr>
              `
                  : ""
              }
            </table>
          </div>
          
          <p>This receipt serves as confirmation of your donation for tax purposes.</p>
          
          <p style="color: #6b7280; font-size: 14px;">
            With gratitude,<br>
            Ashram Management Team
          </p>
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
      subject: "Welcome to Ashram Management - Verify Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Ashram Management</h2>
          
          <p>Dear ${userName},</p>
          
          <p>Thank you for joining our ashram management system. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${verificationLink}</p>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't create this account, please ignore this email.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            Ashram Management Team
          </p>
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

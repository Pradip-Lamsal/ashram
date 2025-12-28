f you've changed your Gmail account or need to regenerate an app password, follow these steps:

Prerequisites
2-Step Verification must be enabled on your Google account (App Passwords only work with 2FA enabled)
Steps to Generate App Password
Go to your Google Account
Visit: https://myaccount.google.com/
Navigate to Security
Click on "Security" in the left sidebar
Enable 2-Step Verification (if not already enabled)
Find "2-Step Verification" under "How you sign in to Google"
Follow the prompts to set it up
Create App Password
Go to: https://myaccount.google.com/apppasswords
Or navigate: Security → 2-Step Verification → App passwords (at the bottom)
Sign in again if prompted
Generate the Password
Select app: Choose "Mail" or "Other (Custom name)"
Select device: Choose your device or "Other (Custom name)"
Enter a name like "Ashram App" or "Receipt Emailer"
Click "Generate"
Copy the 16-character password
Google will show you a 16-character password (like tyjh hjdp sysr ayqg)
Important: Copy this immediately - you won't be able to see it again!
Update your .env.local file
Replace the old password with the new one
Format: Remove spaces or keep them (both work, but typically stored without spaces)
Example .env.local Update
env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=tyjhhjdpsysrayqg
# or with spaces (both work):
# GMAIL_APP_PASSWORD=tyjh hjdp sysr ayqg
Important Notes
Each app password is unique and can only be viewed once when created
You can revoke old app passwords from the same settings page
If you changed your Gmail password, your app passwords remain valid unless you specifically revoke them
If you can't find App Passwords option, make sure 2-Step Verification is enabled first

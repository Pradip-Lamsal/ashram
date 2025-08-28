"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Mail } from "lucide-react";
import { useState } from "react";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerificationComplete: () => void;
}

export function EmailVerificationDialog({
  isOpen,
  onClose,
  email,
  onVerificationComplete,
}: EmailVerificationDialogProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setIsVerifying(true);
    setError("");

    // Simulate verification API call
    setTimeout(() => {
      if (verificationCode === "123456") {
        setIsVerified(true);
        setTimeout(() => {
          onVerificationComplete();
          onClose();
          setIsVerified(false);
          setVerificationCode("");
        }, 1500);
      } else {
        setError("Invalid verification code. Please try again.");
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleResend = () => {
    // Simulate resend API call
    alert(`Verification code sent to ${email}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Verify Email Address</span>
          </DialogTitle>
          <DialogDescription>
            We&apos;ve sent a 6-digit verification code to {email}. Enter the
            code below to verify your new email address.
          </DialogDescription>
        </DialogHeader>

        {isVerified ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">
                Email Verified!
              </h3>
              <p className="text-sm text-gray-600">
                Your email address has been successfully verified.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-wider"
              />
              {error && (
                <div className="flex items-center space-x-2 mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || isVerifying}
                className="flex-1"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
              <Button variant="outline" onClick={handleResend}>
                Resend
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Didn&apos;t receive the code? Check your spam folder or click
                resend.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                For testing: use code <strong>123456</strong>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

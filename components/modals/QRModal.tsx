"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, X } from "lucide-react";
import Image from "next/image";

export interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Qr.jpeg";
    link.download = "payment-qr-code.jpeg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            QR Payment Code
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="relative w-64 h-64 border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
            <Image
              src="/Qr.jpeg"
              alt="Payment QR Code"
              fill
              className="object-contain p-2"
              priority
            />
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-medium text-gray-900">Scan to Pay</h3>
            <p className="text-sm text-gray-600">
              Use any UPI app to scan this QR code and make your donation
              payment
            </p>
          </div>

          <div className="flex space-x-3 w-full">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

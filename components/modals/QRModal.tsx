"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg mx-4 p-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
            QR Payment Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <div className="relative w-full max-w-xs sm:max-w-sm aspect-square border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
            <Image
              src="/Qr.jpeg"
              alt="Payment QR Code"
              fill
              className="object-contain p-2 sm:p-3"
              priority
              sizes="(max-width: 640px) 90vw, 400px"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

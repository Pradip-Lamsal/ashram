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
      <DialogContent className="max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            QR Payment Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div
            className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg"
            style={{ width: "640px", height: "640px" }}
          >
            <Image
              src="/Qr.jpeg"
              alt="Payment QR Code"
              fill
              className="object-contain p-3"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Loader2, X, Lock, Smartphone, CheckCircle } from "lucide-react";
import Image from "next/image";

interface PaymentModalProps {
    amount: number;
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: (source: string) => void;
}

export default function PaymentModal({ amount, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Real UPI ID provided by user
    const upiId = "8699418056@ibl";
    // Generate a QR code URL (using a public API for the demo)
    // pn param is the Payee Name (Merchant)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=VibeServices&am=${amount}&cu=INR`;

    if (!isOpen) return null;

    const handleConfirmPayment = async () => {
        setIsProcessing(true);

        // Simulate Bank Verification Delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        const source = `UPI (Scan)`;

        onPaymentSuccess(source);
        setIsProcessing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-[#2b2f96] p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2 font-semibold">
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg"
                            alt="UPI"
                            width={32}
                            height={16}
                            className="bg-white rounded px-1 h-6 w-auto"
                        />
                        <span>Payment Gateway</span>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center text-center">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Total Payable</p>
                    <h2 className="text-3xl font-bold text-foreground mb-6">₹{amount}</h2>

                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-[#2b2f96]/30 mb-6 shadow-sm">
                        {/* QR Code */}
                        <div className="relative h-48 w-48 mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={qrUrl}
                                alt="UPI QR Code"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Scanning...</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-6 opacity-70">
                        {/* Icons for GPay, PhonePe, Paytm etc - text representation for now */}
                        <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px] mb-1">GPay</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[10px] mb-1">PhonePe</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-[10px] mb-1">Paytm</div>
                        </div>
                    </div>

                    <div className="w-full bg-gray-50 p-3 rounded-lg text-xs text-left mb-4 border border-gray-100">
                        <p className="flex justify-between mb-1">
                            <span className="text-muted-foreground">UPI ID:</span>
                            <span className="font-mono text-foreground">{upiId}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-muted-foreground">Merchant:</span>
                            <span className="font-medium text-foreground">Kartik (Vibe Services)</span>
                        </p>
                    </div>

                    <button
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isProcessing ? "bg-green-600/80 cursor-wait" : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Verifying Payment...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5" /> I Have Paid
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> 100% Secure Transaction
                    </p>
                </div>
            </div>
        </div>
    );
}

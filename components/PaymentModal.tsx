"use client";

import { useState } from "react";
import { Loader2, X, Lock, CheckCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface PaymentModalProps {
    amount: number;
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: (status: string, source: string) => void;
}

export default function PaymentModal({ amount, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Real UPI ID provided by user
    const upiId = "8699418056@ibl";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${upiId}&pn=VibeServices&am=${amount}&cu=INR`;

    if (!isOpen) return null;

    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        // Simulate Bank Verification Delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        const source = `UPI (Scan)`;
        // NOTE: We now return 'verifying' as the status, not 'paid'.
        // The parent component must handle this string and update the DB accordingly.
        onPaymentSuccess('verifying', source);
        setIsProcessing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Modal Container - imitating iOS Bottom Sheet on Mobile, Centered Card on Desktop */}
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">

                {/* Header Actions */}
                <div className="flex justify-between items-center p-6 pb-2">
                    <button
                        onClick={onClose}
                        className="h-8 w-8 bg-gray-100/50 hover:bg-gray-200/50 rounded-full flex items-center justify-center transition-colors text-gray-500"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        <Lock className="h-3 w-3" /> Secure Gateway
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col items-center text-center">

                    {/* Amount */}
                    <div className="mb-8">
                        <p className="text-sm font-medium text-gray-500 mb-1 tracking-wide uppercase">Total Payable</p>
                        <h2 className="text-5xl font-bold text-gray-900 tracking-tighter">
                            <span className="text-3xl align-top mr-1">₹</span>{amount}
                        </h2>
                    </div>

                    {/* QR Code Container */}
                    <div className="relative bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 w-64 h-64 flex items-center justify-center group transition-transform hover:scale-105 duration-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrUrl}
                            alt="UPI QR Code"
                            className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary/5 rounded-3xl pointer-events-none transition-colors"></div>

                        {/* Scan Indicator Corner */}
                        <div className="absolute top-3 right-3 h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    </div>

                    {/* UPI Apps Row */}
                    <div className="flex items-center justify-center gap-6 mb-8 w-full opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 bg-[#ea4335] rounded-xl shadow-sm transform -rotate-3 text-white flex items-center justify-center text-[10px] font-bold">G</div>
                            <span className="text-[10px] font-medium text-gray-400">GPay</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 bg-[#5f259f] rounded-xl shadow-sm transform rotate-3 text-white flex items-center justify-center text-[10px] font-bold">Pe</div>
                            <span className="text-[10px] font-medium text-gray-400">PhonePe</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 bg-[#00baf2] rounded-xl shadow-sm transform -rotate-1 text-white flex items-center justify-center text-[10px] font-bold">Pay</div>
                            <span className="text-[10px] font-medium text-gray-400">Paytm</span>
                        </div>
                    </div>

                    {/* Merchant Details */}
                    <div className="w-full flex items-center justify-between text-xs text-gray-400 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <span>Merchant</span>
                        <span className="text-gray-900 font-semibold flex items-center gap-1">
                            Kartik (Vibe Services) <ShieldCheck className="h-3 w-3 text-blue-500" />
                        </span>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-primary/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isProcessing ? "bg-gray-100 text-gray-400 cursor-wait shadow-none" : "bg-primary text-white hover:bg-blue-600"
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                            </>
                        ) : (
                            <>
                                Notify Provider (I've Paid) <CheckCircle className="h-5 w-5" />
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ShieldAlert, Zap, Loader2, QrCode, Smartphone, CreditCard } from "lucide-react";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentDetails {
  orderId: string;
  bidId: string;
  listingId: string;
  amountINR: number;
  amountPaise: number;
  razorpayKeyId: string;
  isMock?: boolean;
  listingTitle: string;
  phone: string;
  isRebid?: boolean;
  newTotalBidINR?: number;
}

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  details: PaymentDetails | null;
  onClose: () => void;
  onSuccess: (result: { rank: number; listing: any; amount_inr: number }) => void;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  details,
  onClose,
  onSuccess,
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !details) return null;

  // Load Razorpay Script if live
  const triggerRealRazorpay = () => {
    setProcessing(true);
    setError(null);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      try {
        const options = {
          key: details.razorpayKeyId,
          amount: details.amountPaise,
          currency: "INR",
          name: "RankBid India",
          description: `Placement Bid: ${details.listingTitle}`,
          order_id: details.orderId,
          prefill: {
            contact: details.phone,
          },
          theme: {
            color: "#10b981",
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/bids/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bid_id: details.bidId,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                onSuccess(verifyData);
              } else {
                setError(verifyData.error || "Payment verification failed");
              }
            } catch {
              setError("Network error during payment verification");
            } finally {
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err: any) {
        setError(err.message || "Failed to initialize Razorpay checkout");
        setProcessing(false);
      }
    };

    script.onerror = () => {
      setError("Failed to load Razorpay SDK");
      setProcessing(false);
    };

    document.body.appendChild(script);
  };

  // Mock dev test simulator
  const handleSimulatePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch("/api/bids/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: details.orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: "dev_sig_mock",
          bid_id: details.bidId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch {
      setError("Payment simulation failed");
    } finally {
      setProcessing(false);
    }
  };

  const isLive = Boolean(
    details.razorpayKeyId &&
      !details.razorpayKeyId.includes("YourTestKeyIdHere") &&
      !details.razorpayKeyId.includes("mock") &&
      !details.isMock
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 mb-2">
            <Zap className="w-3 h-3" />
            <span>Secure INR Placement Checkout</span>
          </div>
          <h3 className="font-bold text-xl text-white">
            {details.isRebid ? "Raise Your Rank Placement" : "Claim Public Leaderboard Placement"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Listing: <strong>{details.listingTitle}</strong>
          </p>
        </div>

        {/* Amount breakdown box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 mb-6">
          {details.isRebid && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>New Total Standing Bid:</span>
              <span className="font-mono text-slate-200">
                {formatINR(details.newTotalBidINR || details.amountINR)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{details.isRebid ? "Differential Payable Now:" : "Placement Amount Payable:"}</span>
            <span className="font-mono font-bold text-base text-emerald-400">
              {formatINR(details.amountINR)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Payment Method:</span>
            <span className="text-slate-300">UPI / QR, Google Pay, PhonePe, Cards</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Gateway Launch / Dev Simulator */}
        <div className="space-y-3">
          {isLive ? (
            <button
              onClick={triggerRealRazorpay}
              disabled={processing}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay {formatINR(details.amountINR)} via Razorpay</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Local Dev Gateway Simulator</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Razorpay live keys not set in .env. You can instantly simulate an approved UPI transaction below to test the full ranking update flow!
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={processing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate UPI Payment ({formatINR(details.amountINR)})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-center text-slate-500 mt-4">
          By completing payment, you confirm this is a paid advertising placement in accordance with ASCI guidelines.
        </p>
      </div>
    </div>
  );
};

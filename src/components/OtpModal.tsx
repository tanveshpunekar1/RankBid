"use client";

import React, { useState, useEffect } from "react";
import { X, Smartphone, ShieldCheck, ArrowRight, Loader2, RefreshCw } from "lucide-react";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhone?: string;
  onVerified: (phone: string) => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  initialPhone = "",
  onVerified,
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (initialPhone) {
      setPhone(initialPhone.replace(/\D/g, "").slice(-10));
    }
  }, [initialPhone]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("otp");
        setCountdown(60);
        if (data.devCode) {
          setDevCode(data.devCode);
          setOtp(data.devCode); // Auto-populate in dev mock mode for seamless testing
        }
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          otp,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const cleanPhone = phone.replace(/\D/g, "");
        const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
        onVerified(formattedPhone);
        onClose();
      } else {
        setError(data.error || "Invalid code. Please check and try again.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Mobile Verification</h3>
            <p className="text-xs text-slate-400">Required for transparent placement claims</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Indian Mobile Number
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-300">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  className="flex-1 px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Enter 6-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Change number (+91 {phone})
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                autoFocus
                className="w-full text-center tracking-[0.4em] px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xl font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {devCode && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                <span>⚡ Dev Mock Code: <strong>{devCode}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp(devCode)}
                  className="text-[11px] font-bold text-emerald-400 hover:underline"
                >
                  Apply
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Proceed to Bid</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              {countdown > 0 ? (
                <span className="text-xs text-slate-500">
                  Resend code in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Resend OTP
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

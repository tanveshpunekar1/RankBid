"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Loader2,
  ArrowRight,
  Info,
  Layers,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { formatINR, formatIndianNumber } from "@/lib/utils";
import { OtpModal } from "./OtpModal";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";

export const SubmitForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form State
  const [urlInput, setUrlInput] = useState(searchParams.get("url") || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") || "startups-saas");
  const [bidAmountINR, setBidAmountINR] = useState(searchParams.get("bid") || "");
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Live Check & Rebid State
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [existingListing, setExistingListing] = useState<any | null>(null);
  const [normalizedData, setNormalizedData] = useState<any | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [autoClassifying, setAutoClassifying] = useState(false);

  // Modals & Payment State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Leaderboard metadata for rank projection
  const [allBids, setAllBids] = useState<{ id: string; amount_paise: number }[]>([]);
  const [topBidINR, setTopBidINR] = useState(0);

  // Fetch live top bids for projection
  useEffect(() => {
    fetch("/api/listings?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllBids(data.listings.map((l: any) => ({ id: l.id, amount_paise: l.current_bid_paise })));
          setTopBidINR(data.stats.topBidINR);
        }
      })
      .catch(() => {});
  }, []);

  // Debounced check whenever URL/handle input changes
  const checkUrl = useCallback(async (input: string) => {
    if (!input || input.trim().length < 3) {
      setExistingListing(null);
      setNormalizedData(null);
      setModerationError(null);
      return;
    }

    setCheckingUrl(true);
    setModerationError(null);

    try {
      const res = await fetch(`/api/listings/check?input=${encodeURIComponent(input.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.moderationBlocked) {
          setModerationError(data.error);
        }
        setExistingListing(null);
        setNormalizedData(null);
        return;
      }

      setNormalizedData(data.normalized);

      if (data.exists && data.listing) {
        setExistingListing(data.listing);
        setTitle((prev) => prev || data.listing.title);
        setDescription((prev) => prev || data.listing.description || "");
        setCategorySlug(data.listing.category_slug || "startups-saas");
        if (data.listing.submitter_phone) {
          setPhone(data.listing.submitter_phone);
        }
        // Auto-set suggested next bid
        if (!searchParams.get("bid")) {
          setBidAmountINR(data.listing.min_new_bid_inr.toString());
        }
      } else {
        setExistingListing(null);
        if (!title && data.normalized?.displayTitle) {
          setTitle(data.normalized.displayTitle);
        }
      }
    } catch {
      // ignore network errors on fast typing
    } finally {
      setCheckingUrl(false);
    }
  }, [searchParams, title]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (urlInput) {
        checkUrl(urlInput);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [urlInput, checkUrl]);

  // Auto-classify category using AI / Keyword model
  const handleAutoClassify = async () => {
    if (!urlInput && !title) return;
    setAutoClassifying(true);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url_or_handle: urlInput,
          title,
          description,
        }),
      });
      const data = await res.json();
      if (data.success && data.category_slug) {
        setCategorySlug(data.category_slug);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAutoClassifying(false);
    }
  };

  // Calculate projected rank based on bid amount
  const desiredBidNumber = Math.floor(Number(bidAmountINR) || 0);
  let projectedRank = 1;
  if (desiredBidNumber > 0 && allBids.length > 0) {
    const desiredPaise = desiredBidNumber * 100;
    // Exclude this listing's previous bid if rebidding
    const otherBids = existingListing
      ? allBids.filter((b) => b.id !== existingListing.id)
      : allBids;
    const higherBidsCount = otherBids.filter((b) => b.amount_paise >= desiredPaise).length;
    projectedRank = higherBidsCount + 1;
  }

  // Differential calculation
  const currentListingBidINR = existingListing ? existingListing.current_bid_inr : 0;
  const isRebid = Boolean(existingListing);
  const differentialToPayINR = isRebid
    ? Math.max(0, desiredBidNumber - currentListingBidINR)
    : desiredBidNumber;

  // Minimum required bid
  const minRequiredBidINR = isRebid ? currentListingBidINR + 1 : 100;
  const minForRank1INR = topBidINR > 0 ? topBidINR + 100 : 100;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (moderationError) {
      setFormError(moderationError);
      return;
    }

    if (!urlInput.trim()) {
      setFormError("Please enter your website URL or @handle");
      return;
    }

    if (!title.trim()) {
      setFormError("Please provide a title or brand name");
      return;
    }

    if (desiredBidNumber < minRequiredBidINR) {
      setFormError(
        isRebid
          ? `Your new total bid must be at least ₹${formatIndianNumber(minRequiredBidINR)} (₹1 higher than previous bid)`
          : `Minimum starting bid is ₹100`
      );
      return;
    }

    if (desiredBidNumber > 1000000) {
      setFormError("Maximum bid amount is ₹10,00,000");
      return;
    }

    // Require phone OTP verification
    if (!phoneVerified) {
      setIsOtpModalOpen(true);
      return;
    }

    // Proceed to create Razorpay payment order
    setSubmitting(true);
    try {
      const res = await fetch("/api/bids/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url_or_handle: urlInput.trim(),
          title: title.trim(),
          description: description.trim(),
          category_slug: categorySlug,
          phone,
          bid_amount_inr: desiredBidNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to initiate bid placement order");
        setSubmitting(false);
        return;
      }

      // Open Razorpay Checkout modal
      setPaymentDetails({
        orderId: data.order.id,
        bidId: data.bidding_info.bid_id,
        listingId: data.bidding_info.listing_id,
        amountINR: data.bidding_info.amount_charged_inr,
        amountPaise: data.order.amount_paise,
        razorpayKeyId: data.razorpay_key_id,
        isMock: data.order.is_mock,
        listingTitle: title.trim(),
        phone,
        isRebid: data.bidding_info.is_rebid,
        newTotalBidINR: data.bidding_info.new_total_bid_inr,
      });

      setIsPaymentModalOpen(true);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Payment Success Handler
  const handlePaymentSuccess = (result: any) => {
    setIsPaymentModalOpen(false);
    setSuccessResult(result);

    // Trigger celebration confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#3b82f6", "#ffffff"],
      });
    } catch {}
  };

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
            🎉 Placement Confirmed
          </span>
          <h2 className="text-2xl font-black text-white">
            You Claimed Rank #{successResult.rank}!
          </h2>
          <p className="text-xs text-slate-300">
            <strong>{title}</strong> is now live on the RankBid public leaderboard with a verified placement bid of{" "}
            <strong className="text-emerald-400 font-mono">
              {formatINR(successResult.amount_inr || desiredBidNumber)}
            </strong>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div>ASCI Notice: Paid Placement label activated</div>
          <div>Outbound clicks are actively tracked and directed to your destination.</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
          >
            View Leaderboard
          </button>
          <button
            onClick={() => {
              setSuccessResult(null);
              setUrlInput("");
              setTitle("");
              setDescription("");
              setBidAmountINR("");
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition-all"
          >
            Submit Another Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6"
      >
        {/* Form Header */}
        <div className="border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Paid Placement Submission
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {isRebid ? "Raise Your Placement Rank" : "List Your Brand on RankBid"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rank is determined purely by verified amount paid in INR. Outbid competitors or take Rank #1.
          </p>
        </div>

        {/* Existing Listing Notification Banner */}
        {isRebid && existingListing && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Existing Listing Detected — &ldquo;Pay The Difference&rdquo; Mode</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              This URL is currently ranked <strong>#{existingListing.current_rank || "Active"}</strong> with a standing bid of{" "}
              <strong className="font-mono text-emerald-300">
                {formatINR(existingListing.current_bid_inr)}
              </strong>. You only pay the difference to raise its standing!
            </p>
          </div>
        )}

        {/* Moderation Error Banner */}
        {moderationError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">Listing Disallowed</div>
              <p className="mt-0.5 text-[11px] leading-relaxed">{moderationError}</p>
            </div>
          </div>
        )}

        {formError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Destination URL / Social Handle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Website URL or Social Handle <span className="text-emerald-400">*</span>
            </label>
            {checkingUrl && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> Checking...
              </span>
            )}
          </div>

          <input
            type="text"
            required
            placeholder="e.g. zerodha.com, @tanmaybhat, or play.google.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          {normalizedData && (
            <p className="text-[11px] font-mono text-slate-400">
              Canonical Key: <strong className="text-slate-300">{normalizedData.normalizedKey}</strong>
            </p>
          )}
        </div>

        {/* 2. Brand Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Brand / Product Name <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={60}
            placeholder="e.g. Zerodha"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* 3. Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            One-Line Pitch / Description (Optional)
          </label>
          <input
            type="text"
            maxLength={180}
            placeholder="e.g. India's largest retail stockbroker empowering zero-fee investing."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* 4. Category Selector with AI Auto-detect */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Sector / Category <span className="text-emerald-400">*</span>
            </label>
            <button
              type="button"
              onClick={handleAutoClassify}
              disabled={autoClassifying || (!urlInput && !title)}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-40 inline-flex items-center gap-1"
            >
              {autoClassifying ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>Auto-Detect Category</span>
            </button>
          </div>

          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Total Desired Bid Amount & Rank Projection Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                {isRebid ? "New Total Standing Bid (INR)" : "Your Placement Bid (INR)"}{" "}
                <span className="text-emerald-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setBidAmountINR(minForRank1INR.toString())}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
              >
                👑 Claim #1 for {formatINR(minForRank1INR)}
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-emerald-400">
                ₹
              </span>
              <input
                type="number"
                min={minRequiredBidINR}
                max={1000000}
                step={1}
                required
                placeholder={minRequiredBidINR.toString()}
                value={bidAmountINR}
                onChange={(e) => setBidAmountINR(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum bid: {formatINR(minRequiredBidINR)} • Maximum limit: ₹10,00,000 (10 Lakhs)
            </p>
          </div>

          {/* Real-time Projected Rank & Differential Preview Box */}
          {desiredBidNumber > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Projected Leaderboard Rank:</span>
                <span className="font-mono font-bold text-sm text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Rank #{projectedRank}
                  {projectedRank === 1 && " 👑 (Top of Board)"}
                </span>
              </div>

              {isRebid ? (
                <>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Previous Standing Paid:</span>
                    <span className="font-mono text-slate-300">{formatINR(currentListingBidINR)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold">
                    <span className="text-emerald-400">Differential Payable Now:</span>
                    <span className="font-mono text-sm text-emerald-300">
                      {formatINR(differentialToPayINR)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">Total Payable via UPI:</span>
                  <span className="font-mono text-sm text-emerald-400">
                    {formatINR(desiredBidNumber)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. Phone Verification Status */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${phoneVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {phoneVerified ? "Mobile Verified" : "Mobile Verification Required"}
              </div>
              <p className="text-[11px] text-slate-400">
                {phoneVerified ? phone : "Used to securely manage your listing"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOtpModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              phoneVerified
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30"
            }`}
          >
            {phoneVerified ? "Change" : "Verify Phone"}
          </button>
        </div>

        {/* Compliance Reminder */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900/30 p-3 rounded-lg border border-slate-800/60">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            This placement will display the persistent &ldquo;Paid Placement&rdquo; badge in compliance with ASCI sponsored content standards.
          </span>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting || checkingUrl || Boolean(moderationError)}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all duration-200 active:scale-[0.99]"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>
                {phoneVerified
                  ? `Proceed to Pay ${formatINR(differentialToPayINR)}`
                  : "Verify Mobile & Proceed"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* OTP Modal */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        initialPhone={phone}
        onVerified={(verifiedPhone) => {
          setPhone(verifiedPhone);
          setPhoneVerified(true);
        }}
      />

      {/* Razorpay Checkout Modal */}
      <RazorpayPaymentModal
        isOpen={isPaymentModalOpen}
        details={paymentDetails}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { currency, setCurrency, usdRate: contextUsdRate } = useCurrency();

  // State
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [globalUsdRate, setGlobalUsdRate] = useState<number>(contextUsdRate || 83.5);

  // Payment Gateway Settings
  const [paymentSettings, setPaymentSettings] = useState<{
    razorpay_key_id?: string;
    razorpay_enabled?: boolean;
    payoneer_email?: string;
    payoneer_account_name?: string;
    payoneer_payment_url?: string;
    payoneer_details?: string;
    payoneer_enabled?: boolean;
    cod_enabled?: boolean;
  }>({
    razorpay_enabled: true,
    payoneer_enabled: true,
    cod_enabled: true,
  });

  // Form Fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "payoneer" | "cod">("razorpay");

  // Payoneer Modal State
  const [showPayoneerModal, setShowPayoneerModal] = useState(false);
  const [payoneerRef, setPayoneerRef] = useState("");
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);

  // Under Development Modal State
  const [showUnderDevModal, setShowUnderDevModal] = useState(false);

  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // 1. Get Currency & Rate
    const savedCurrency = localStorage.getItem("user_currency") || "USD";
    setCurrency(savedCurrency);

    // Fetch store settings & payment configuration
    const fetchSettings = async () => {
      try {
        const { data: storeData } = await supabase
          .from("store_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (storeData?.usd_rate) setGlobalUsdRate(parseFloat(storeData.usd_rate));

        const { data: contentData } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "payment_settings")
          .maybeSingle();

        const combinedSettings = {
          razorpay_key_id: contentData?.data?.razorpay_key_id || storeData?.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          razorpay_enabled: contentData?.data?.razorpay_enabled !== false,
          payoneer_email: contentData?.data?.payoneer_email || "payments@nrenterprises.com",
          payoneer_account_name: contentData?.data?.payoneer_account_name || "NR Enterprises Carpets Atelier",
          payoneer_payment_url: contentData?.data?.payoneer_payment_url || "",
          payoneer_details: contentData?.data?.payoneer_details || "Payoneer Direct Transfer / Receiving Account",
          payoneer_enabled: contentData?.data?.payoneer_enabled !== false,
          cod_enabled: contentData?.data?.cod_enabled !== false,
        };

        setPaymentSettings(combinedSettings);
      } catch (e) {
        console.warn("Settings fetch notice:", e);
      }
    };

    fetchSettings();

    // 2. Check Auth & Auto-fill Saved Delivery Profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setEmail(session.user.email || "");
        const meta = session.user.user_metadata || {};
        const nameParts = (meta.full_name || meta.name || "").split(" ");
        if (nameParts[0]) setFirstName(nameParts[0]);
        if (nameParts.length > 1) setLastName(nameParts.slice(1).join(" "));
        if (meta.phone) setPhone(meta.phone);
        if (meta.address || meta.street_address) setAddress(meta.address || meta.street_address);
        if (meta.apartment) setApartment(meta.apartment);
        if (meta.city) setCity(meta.city);
        if (meta.state || meta.province) setStateName(meta.state || meta.province);
        if (meta.postal_code || meta.zip) setPostalCode(meta.postal_code || meta.zip);
        if (meta.country) setCountry(meta.country);
      }
    });

    // Also check saved local storage address backup if not logged in
    try {
      const savedAddr = JSON.parse(localStorage.getItem("nrenterprises_saved_address") || "{}");
      if (savedAddr.phone) setPhone((prev) => prev || savedAddr.phone);
      if (savedAddr.address) setAddress((prev) => prev || savedAddr.address);
      if (savedAddr.apartment) setApartment((prev) => prev || savedAddr.apartment);
      if (savedAddr.city) setCity((prev) => prev || savedAddr.city);
      if (savedAddr.stateName) setStateName((prev) => prev || savedAddr.stateName);
      if (savedAddr.postalCode) setPostalCode((prev) => prev || savedAddr.postalCode);
      if (savedAddr.country) setCountry((prev) => prev || savedAddr.country);
    } catch (e) {}

    // 3. Load Cart
    try {
      const items = JSON.parse(localStorage.getItem("nrenterprises_cart") || "[]");
      setCartItems(items);
    } catch (e) {
      setCartItems([]);
    }
    setIsLoaded(true);
  }, []);

  // Total Calculations based on listing prices
  const cartSubtotalINR = cartItems.reduce((total, item) => {
    const numericInr = parseFloat((item.price || "0").toString().replace(/[^0-9.]/g, ""));
    return total + (isNaN(numericInr) ? 0 : numericInr * (item.quantity || 1));
  }, 0);

  const shippingCostINR = shippingMethod === "express" ? 2000 : 0;
  const grandTotalINR = cartSubtotalINR + shippingCostINR;

  const formatPrice = (amountINR: number) => {
    const relativeRates: Record<string, number> = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.53,
      AED: 3.67,
      SAR: 3.75,
      SGD: 1.34,
      CHF: 0.88,
      NZD: 1.64,
      JPY: 155.0,
      PLN: 4.02,
      SEK: 10.65,
      INR: globalUsdRate,
    };
    const targetRate = relativeRates[currency] || 1;
    const converted = (amountINR / globalUsdRate) * targetRate;
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "CA$",
      AUD: "AU$",
      AED: "AED ",
      SAR: "SAR ",
      SGD: "SG$",
      CHF: "CHF ",
      NZD: "NZ$",
      JPY: "¥",
      PLN: "zł ",
      SEK: "kr ",
      INR: "₹",
    };
    return `${symbols[currency] || "$"}${converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getForeignAmountString = (amountINR: number) => {
    const relativeRates: Record<string, number> = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.53,
      AED: 3.67,
      SAR: 3.75,
      SGD: 1.34,
      CHF: 0.88,
      NZD: 1.64,
      JPY: 155.0,
      PLN: 4.02,
      SEK: 10.65,
    };
    const activeCurrency = currency === "INR" ? "USD" : currency;
    const targetRate = relativeRates[activeCurrency] || 1.0;
    const converted = Math.round((amountINR / globalUsdRate) * targetRate);
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "CA$",
      AUD: "AU$",
      AED: "AED ",
      SAR: "SAR ",
      SGD: "SG$",
      CHF: "CHF ",
      NZD: "NZ$",
      JPY: "¥",
      PLN: "zł ",
      SEK: "kr ",
    };
    return `${symbols[activeCurrency] || "$"}${converted.toLocaleString("en-US")} ${activeCurrency}`;
  };

  // Helper to save finalized order
  const saveOrderAndComplete = async (orderPayload: any) => {
    try {
      try {
        await supabase.from("orders").insert(orderPayload);
      } catch (err) {
        // Fallback
      }

      try {
        const { data: existingData } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "orders_list")
          .maybeSingle();

        const currentList = Array.isArray(existingData?.data?.list) ? existingData.data.list : [];
        const updatedList = [orderPayload, ...currentList];

        await supabase.from("site_content").upsert({
          id: "orders_list",
          data: { list: updatedList },
        });
      } catch (err) {
        console.error("Order server persistence notice:", err);
      }

      const localOrders = JSON.parse(localStorage.getItem("nrenterprises_orders") || "[]");
      localOrders.unshift(orderPayload);
      localStorage.setItem("nrenterprises_orders", JSON.stringify(localOrders));

      localStorage.removeItem("nrenterprises_cart");
      window.dispatchEvent(new Event("cart_updated"));

      router.push(`/checkout/success?orderId=${orderPayload.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Could not finalize your order record. Please contact support.");
      setIsSubmitting(false);
    }
  };

  // Main Submit Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🚧 Website Under Development Interceptor: Show notice modal
    setShowUnderDevModal(true);
    return;

    setIsSubmitting(true);
    setErrorMessage("");

    const orderId = `RZ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const baseOrder = {
      id: orderId,
      created_at: new Date().toISOString(),
      user_id: user?.id || null,
      customer_name: `${firstName.trim()} ${lastName.trim()}`,
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      shipping_address: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        apartment: apartment.trim(),
        city: city.trim(),
        state: stateName.trim(),
        postalCode: postalCode.trim(),
        country,
      },
      shipping_method: shippingMethod === "express" ? "Express Priority Courier" : "Complimentary White-Glove Delivery",
      items: cartItems,
      subtotal: cartSubtotalINR,
      shipping_fee: shippingCostINR,
      total: grandTotalINR,
      display_total: formatPrice(grandTotalINR),
      currency,
      order_notes: orderNotes.trim(),
    };

    // 1. RAZORPAY POPUP FLOW
    if (paymentMethod === "razorpay") {
      try {
        // Ensure Razorpay SDK is loaded
        const loadScript = () => {
          return new Promise((resolve) => {
            if (typeof window !== "undefined" && (window as any).Razorpay) {
              resolve(true);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const scriptReady = await loadScript();
        if (!scriptReady || !(window as any).Razorpay) {
          throw new Error("Razorpay checkout failed to load. Please check your network connection or try Payoneer.");
        }

        // Call backend to create Razorpay Order
        const response = await fetch("/api/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: grandTotalINR,
            currency: "INR",
            receipt: `rcpt_${orderId}`,
            notes: {
              orderId,
              customer_name: `${firstName} ${lastName}`,
              customer_email: email,
            },
          }),
        });

        const orderData = await response.json();

        if (!response.ok || !orderData.id) {
          throw new Error(orderData.error || "Failed to initialize payment gateway.");
        }

        // Open Razorpay Standard In-Website Popup
        const options = {
          key: orderData.keyId || paymentSettings.razorpay_key_id,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "NR Enterprises Carpets",
          description: `Bespoke Rug Order #${orderId}`,
          image: "/nr-logo.png",
          order_id: orderData.id,
          handler: async function (response: any) {
            try {
              // Verify signature securely on server
              const verifyRes = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails: {
                    ...baseOrder,
                    payment_method: `Razorpay (${response.razorpay_payment_id})`,
                    order_status: "Paid",
                  },
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                await saveOrderAndComplete({
                  ...baseOrder,
                  payment_method: `Razorpay (${response.razorpay_payment_id})`,
                  payment_status: "Paid",
                  order_status: "Paid",
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                });
              } else {
                throw new Error(verifyData.error || "Payment verification failed");
              }
            } catch (err: any) {
              setErrorMessage(`Payment verification issue: ${err.message}. Please contact support.`);
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: `${firstName} ${lastName}`,
            email: email,
            contact: phone,
          },
          notes: {
            address: `${address}, ${city}, ${country}`,
          },
          theme: {
            color: "#3A332C",
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.on("payment.failed", function (failResponse: any) {
          setErrorMessage(`Payment failed: ${failResponse.error?.description || "Transaction cancelled"}`);
          setIsSubmitting(false);
        });
        razorpayInstance.open();
      } catch (err: any) {
        console.error("Razorpay error:", err);
        setErrorMessage(err.message || "Could not open Razorpay checkout. Please verify keys in Admin Panel.");
        setIsSubmitting(false);
      }
      return;
    }

    // 2. PAYONEER POPUP FLOW
    if (paymentMethod === "payoneer") {
      setPendingOrderData({
        ...baseOrder,
        payment_method: "Payoneer International Transfer",
        order_status: "Pending Payment Verification",
      });
      setShowPayoneerModal(true);
      setIsSubmitting(false);
      return;
    }

    // 3. CASH ON DELIVERY FLOW
    if (paymentMethod === "cod") {
      await saveOrderAndComplete({
        ...baseOrder,
        payment_method: "Cash on Delivery (COD)",
        order_status: "Confirmed",
        payment_status: "Pending on Delivery",
      });
    }
  };

  const handlePayoneerConfirm = async () => {
    if (!pendingOrderData) return;
    setIsSubmitting(true);

    const finalizedOrder = {
      ...pendingOrderData,
      payment_method: `Payoneer (${payoneerRef.trim() || "Direct Reference"})`,
      payment_status: "Under Review",
      payoneer_reference: payoneerRef.trim(),
    };

    await saveOrderAndComplete(finalizedOrder);
    setShowPayoneerModal(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-40 pb-40 text-center text-[#8C6B38] font-serif text-lg animate-pulse">
        Initializing Checkout Atelier...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-40 pb-32 px-6 flex flex-col items-center justify-center text-center font-sans">
        <div className="w-20 h-20 bg-[#FAF5EB] rounded-none border border-[#4A1017]/30 flex items-center justify-center text-[#8C6B38] mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif text-[#2B070B] mb-3">Your Cart is Empty</h1>
        <p className="text-[#5A4E42] text-sm max-w-md mb-8">
          You need at least one rug in your shopping bag before proceeding to checkout.
        </p>
        <div className="flex gap-4">
          <Link
            href="/collections"
            className="bg-[#2B070B] text-[#FAF5EB] hover:text-white border border-[#4A1017] px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#3D0C12] transition-colors rounded-none shadow-sm"
          >
            Shop Collections
          </Link>
          <Link
            href="/customize"
            className="border border-[#4A1017]/40 text-[#2B070B] bg-[#FAF5EB] px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#2B070B] hover:text-white transition-colors rounded-none"
          >
            Bespoke Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load Razorpay Checkout SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="bg-[#FAF8F5] min-h-screen pt-3 sm:pt-4 pb-16 sm:pb-24 font-sans text-[#2B070B]">
        <div className="max-w-[1300px] mx-auto px-1.5 sm:px-6">
          
          {/* TOP BREADCRUMB */}
          <div className="flex items-center justify-between border-b border-[#4A1017]/15 pb-5 mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C6B38] font-bold block mb-1">
                Secure In-House Atelier Checkout
              </span>
              <h1 className="text-3xl font-serif text-[#2B070B]">Finalize Your Order</h1>
            </div>
            {!user && (
              <div className="text-xs text-[#5A4E42]">
                Already a patron?{" "}
                <Link
                  href="/login?redirect=/checkout"
                  className="text-[#8C6B38] font-bold uppercase tracking-wider underline hover:text-[#2B070B]"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl leading-relaxed flex items-center justify-between">
              <span>{errorMessage}</span>
              <button 
                type="button" 
                onClick={() => setErrorMessage("")}
                className="text-red-900 font-bold ml-4 hover:underline"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-12">
            
            {/* LEFT: CHECKOUT FORM DETAILS */}
            <div className="w-full lg:w-7/12 space-y-10">
              
              {/* 1. CONTACT INFO */}
              <div className="bg-white p-5 sm:p-8 border border-[#4A1017]/20 rounded-none shadow-sm">
                <h2 className="text-base uppercase tracking-widest text-[#2B070B] font-bold mb-6 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-none bg-[#2B070B] text-[#FAF5EB] border border-[#4A1017] flex items-center justify-center text-xs">
                    1
                  </span>
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@example.com"
                      className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                    />
                    <span className="text-[10px] text-[#5A4E42] mt-1 block">
                      Order confirmation & dispatch tracking will be sent here.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                    />
                    <span className="text-[10px] text-[#5A4E42] mt-1 block">
                      For courier delivery coordination.
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. SHIPPING ADDRESS */}
              <div className="bg-white p-5 sm:p-8 border border-[#4A1017]/20 rounded-none shadow-sm">
                <h2 className="text-base uppercase tracking-widest text-[#2B070B] font-bold mb-6 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-none bg-[#2B070B] text-[#FAF5EB] border border-[#4A1017] flex items-center justify-center text-xs">
                    2
                  </span>
                  Shipping Address
                </h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Aarav"
                        className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Sharma"
                        className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / Flat No., Building, Street Name"
                      className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                      Apartment, Suite, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="e.g. Near Royal Palms"
                      className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                        PIN / Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="400001"
                        className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#8C6B38] font-bold mb-1.5">
                      Country / Territory
                    </label>
                    <select
                      value={country}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setCountry(newCountry);
                        const countryMap: Record<string, string> = {
                          "Australia": "AUD",
                          "Canada": "CAD",
                          "France": "EUR",
                          "Germany": "EUR",
                          "Greece": "EUR",
                          "India": "INR",
                          "Ireland": "EUR",
                          "Italy": "EUR",
                          "Japan": "JPY",
                          "New Zealand": "NZD",
                          "Poland": "PLN",
                          "Portugal": "EUR",
                          "Saudi Arabia": "SAR",
                          "Singapore": "SGD",
                          "Spain": "EUR",
                          "Sweden": "SEK",
                          "Switzerland": "CHF",
                          "The Netherlands": "EUR",
                          "United Arab Emirates": "AED",
                          "United Kingdom": "GBP",
                          "United States": "USD",
                        };
                        if (countryMap[newCountry]) {
                          setCurrency(countryMap[newCountry]);
                        }
                      }}
                      className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none cursor-pointer"
                    >
                      <option value="Australia">Australia</option>
                      <option value="Canada">Canada</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Greece">Greece</option>
                      <option value="India">India</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Italy">Italy</option>
                      <option value="Japan">Japan</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Poland">Poland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Spain">Spain</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="The Netherlands">The Netherlands</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. SHIPPING METHOD */}
              <div className="bg-white p-5 sm:p-8 border border-[#4A1017]/20 rounded-none shadow-sm">
                <h2 className="text-base uppercase tracking-widest text-[#2B070B] font-bold mb-6 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-none bg-[#2B070B] text-[#FAF5EB] border border-[#4A1017] flex items-center justify-center text-xs">
                    3
                  </span>
                  Delivery Method
                </h2>

                <div className="space-y-3">
                  <label
                    onClick={() => setShippingMethod("standard")}
                    className={`flex items-center justify-between p-4 border rounded-none cursor-pointer transition-all ${
                      shippingMethod === "standard"
                        ? "border-[#4A1017] bg-[#FAF5EB] ring-1 ring-[#4A1017]"
                        : "border-[#4A1017]/20 hover:border-[#4A1017]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="accent-[#4A1017]"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#2B070B] block">
                          Complimentary Tracked Delivery
                        </span>
                        <span className="text-xs text-[#5A4E42]">
                          Dispatched from our Bhadohi loom. 5–8 business days.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Free
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("express")}
                    className={`flex items-center justify-between p-4 border rounded-none cursor-pointer transition-all ${
                      shippingMethod === "express"
                        ? "border-[#4A1017] bg-[#FAF5EB] ring-1 ring-[#4A1017]"
                        : "border-[#4A1017]/20 hover:border-[#4A1017]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="accent-[#4A1017]"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#2B070B] block">
                          Express Insured Artisan Courier
                        </span>
                        <span className="text-xs text-[#5A4E42]">
                          Priority air courier with tailored package handling. 3–5 days.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#2B070B]">
                      {formatPrice(2000)}
                    </span>
                  </label>
                </div>
              </div>

              {/* 4. PAYMENT OPTIONS WITH RAZORPAY & PAYONEER */}
              <div className="bg-white p-5 sm:p-8 border border-[#4A1017]/20 rounded-none shadow-sm">
                <h2 className="text-base uppercase tracking-widest text-[#2B070B] font-bold mb-6 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-none bg-[#2B070B] text-[#FAF5EB] border border-[#4A1017] flex items-center justify-center text-xs">
                    4
                  </span>
                  Select Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Razorpay Option */}
                  <div
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`p-5 rounded-none border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === "razorpay"
                        ? "border-[#4A1017] bg-[#FAF5EB] shadow-md ring-1 ring-[#4A1017]"
                        : "border-[#4A1017]/20 bg-white hover:border-[#4A1017]/60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-bold text-[#2B070B]">Razorpay</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                            Instant Popup
                          </span>
                        </div>
                        <span className="text-xs text-[#5A4E42] block mt-1">
                          UPI, Cards, NetBanking & Wallets
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center ${
                        paymentMethod === "razorpay" ? "border-[#4A1017] bg-[#4A1017]" : "border-[#4A1017]/30"
                      }`}>
                        {paymentMethod === "razorpay" && <div className="w-2 h-2 rounded-none bg-white" />}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#8C6B38] border-t border-[#4A1017]/15 pt-2 mt-2 flex flex-wrap gap-1.5">
                      <span className="font-semibold">GPay</span> • 
                      <span className="font-semibold">PhonePe</span> • 
                      <span className="font-semibold">Paytm</span> • 
                      <span className="font-semibold">Credit/Debit Cards</span>
                    </div>
                  </div>

                  {/* Payoneer Option */}
                  <div
                    onClick={() => setPaymentMethod("payoneer")}
                    className={`p-5 rounded-none border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === "payoneer"
                        ? "border-[#4A1017] bg-[#FAF5EB] shadow-md ring-1 ring-[#4A1017]"
                        : "border-[#4A1017]/20 bg-white hover:border-[#4A1017]/60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-bold text-[#2B070B]">Payoneer</span>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                            Global USD / EUR
                          </span>
                        </div>
                        <span className="text-xs text-[#5A4E42] block mt-1">
                          International Transfer & Balance
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center ${
                        paymentMethod === "payoneer" ? "border-[#4A1017] bg-[#4A1017]" : "border-[#4A1017]/30"
                      }`}>
                        {paymentMethod === "payoneer" && <div className="w-2 h-2 rounded-none bg-white" />}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#8C6B38] border-t border-[#4A1017]/15 pt-2 mt-2 flex items-center justify-between">
                      <span>Exact rate: <strong className="text-[#2B070B]">{getForeignAmountString(grandTotalINR)}</strong></span>
                      <span className="text-[#8C6B38] font-bold">Popup Transfer</span>
                    </div>
                  </div>
                </div>

                {/* Optional COD link */}
                <div className="pt-1 pb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod(paymentMethod === "cod" ? "razorpay" : "cod")}
                    className="text-xs text-[#8C7A63] hover:text-[#3A332C] underline cursor-pointer"
                  >
                    {paymentMethod === "cod" ? "← Back to Online Gateways (Razorpay/Payoneer)" : "Or choose Cash on Delivery (COD)"}
                  </button>
                </div>

                {/* RAZORPAY NOTICE */}
                {paymentMethod === "razorpay" && (
                  <div className="p-5 bg-[#FAFAFA] border border-[#EAEAEB] rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-[#3A332C] uppercase tracking-wider">
                        Razorpay Instant In-Website Popup Checkout
                      </span>
                    </div>
                    <p className="text-xs text-[#7A7065] leading-relaxed">
                      Clicking <strong>Pay with Razorpay</strong> will open the official <strong>Razorpay popup modal</strong> directly on this screen. You can pay securely with Google Pay, PhonePe, Paytm, BHIM, Credit/Debit Cards, or NetBanking.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-[#8C7A63]">
                      <span className="bg-white px-2 py-1 border border-[#DFD8CC] rounded-lg font-semibold">GPay</span>
                      <span className="bg-white px-2 py-1 border border-[#DFD8CC] rounded-lg font-semibold">PhonePe</span>
                      <span className="bg-white px-2 py-1 border border-[#DFD8CC] rounded-lg font-semibold">Paytm</span>
                      <span className="bg-white px-2 py-1 border border-[#DFD8CC] rounded-lg font-semibold">Visa / Mastercard</span>
                      <span className="bg-white px-2 py-1 border border-[#DFD8CC] rounded-lg font-semibold">50+ Banks</span>
                    </div>
                  </div>
                )}

                {/* PAYONEER NOTICE */}
                {paymentMethod === "payoneer" && (
                  <div className="p-5 bg-[#FAFAFA] border border-[#EAEAEB] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-bold text-[#3A332C] uppercase tracking-wider">
                          Payoneer International In-Website Modal
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#C19A6B]">
                        {getForeignAmountString(grandTotalINR)}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A7065] leading-relaxed">
                      Designed for our global patrons. Clicking <strong>Proceed to Payoneer</strong> will open the <strong>Payoneer Checkout Window</strong> inside the website to transfer in USD, EUR, or GBP directly from your Payoneer account or global bank.
                    </p>
                  </div>
                )}

                {/* COD NOTICE */}
                {paymentMethod === "cod" && (
                  <div className="p-5 bg-[#FAFAFA] border border-[#EAEAEB] rounded-2xl space-y-2">
                    <span className="text-xs text-[#3A332C] font-semibold block">
                      Pay upon Delivery at Your Doorstep
                    </span>
                    <p className="text-xs text-[#7A7065] leading-relaxed">
                      You can pay in cash or via digital UPI QR scan directly to our logistics partner when your handcrafted carpet arrives.
                    </p>
                  </div>
                )}

              </div>

              {/* 5. NOTES */}
              <div className="bg-white p-5 sm:p-8 border border-[#4A1017]/20 rounded-none shadow-sm">
                <label className="block text-xs uppercase tracking-widest text-[#8C6B38] font-bold mb-2">
                  Special Delivery Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Gate code, landmark direction, or preferred delivery timing..."
                  className="w-full bg-[#FAF8F5] border border-[#4A1017]/20 p-3.5 text-sm text-[#2B070B] outline-none focus:border-[#4A1017] rounded-none"
                />
              </div>

            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="w-full lg:w-5/12">
              <div className="sticky top-32 bg-white p-5 sm:p-8 border border-[#4A1017]/25 shadow-xl rounded-none">
                <h2 className="text-base uppercase tracking-widest text-[#2B070B] font-bold pb-4 border-b border-[#4A1017]/15 mb-6">
                  Order Summary ({cartItems.length})
                </h2>

                {/* Items List */}
                <div className="divide-y divide-[#4A1017]/10 max-h-72 overflow-y-auto custom-scrollbar mb-6 pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#FAF8F5] rounded-none overflow-hidden relative shrink-0 border border-[#4A1017]/20 p-1 flex items-center justify-center">
                        {item.image && (
                          item.image.startsWith("data:") ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          )
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.isCustom && (
                          <span className="bg-[#4A1017] text-[#FAF5EB] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none inline-block mb-1 border border-[#FAF5EB]/40">
                            CUSTOM ORDER
                          </span>
                        )}
                        <h4 className="text-sm font-serif font-medium text-[#2B070B] truncate">
                          {item.name}
                        </h4>
                        <div className="text-xs text-[#5A4E42] mt-0.5 leading-snug">
                          <span>Size: {item.size}{item.color ? ` • Color: ${item.color}` : ""}</span>
                        </div>
                        {item.isCustom && item.customDetails && (
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#8C6B38]">
                            <span>Fibers:</span>
                            <span className="w-2.5 h-2.5 rounded-none border border-black/20" style={{ backgroundColor: item.customDetails.brownFiberColor }} title="1st Fiber" />
                            <span className="w-2.5 h-2.5 rounded-none border border-black/20" style={{ backgroundColor: item.customDetails.whiteFiberColor }} title="2nd Fiber" />
                          </div>
                        )}
                        <div className="text-xs text-[#8C6B38] mt-1">Qty: {item.quantity || 1}</div>
                      </div>
                      <div className="text-sm font-semibold text-[#2B070B] shrink-0">
                        {formatPrice(
                          parseFloat((item.price || "0").toString().replace(/[^0-9.]/g, "")) *
                            (item.quantity || 1)
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-[#4A1017]/15 text-sm text-[#5A4E42]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#2B070B] font-semibold">{formatPrice(cartSubtotalINR)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shippingMethod === "express" ? (
                        <span className="text-[#2B070B] font-semibold">{formatPrice(shippingCostINR)}</span>
                      ) : (
                        <span className="text-emerald-700 font-bold uppercase tracking-wider text-xs">
                          Free
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Taxes</span>
                    <span className="text-xs text-[#8C6B38]">Included</span>
                  </div>
                  <div className="pt-4 border-t border-[#4A1017]/15 flex justify-between items-baseline text-[#2B070B]">
                    <span className="text-base uppercase tracking-wider font-bold">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-serif font-bold text-[#2B070B] block">
                        {formatPrice(grandTotalINR)}
                      </span>
                      {currency !== "INR" && (
                        <span className="text-[11px] text-[#8C6B38] block mt-0.5">
                          (₹{grandTotalINR.toLocaleString("en-IN")} INR)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Place Order CTA in Royal Maroon */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-[#4A1017] hover:bg-[#380C11] text-[#FAF5EB] hover:text-white border border-[#FAF5EB]/40 py-4.5 px-6 text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 rounded-none shadow-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-none animate-spin" />
                      <span>Processing Atelier Order...</span>
                    </>
                  ) : paymentMethod === "razorpay" ? (
                    "Pay with Razorpay →"
                  ) : paymentMethod === "payoneer" ? (
                    "Proceed to Payoneer →"
                  ) : (
                    "Confirm Order (Cash on Delivery) →"
                  )}
                </button>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-[#4A1017]/15 space-y-3 text-[11px] text-[#5A4E42]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8C6B38]">✓</span>
                    <span>Direct Loom Delivery from Bhadohi, India</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8C6B38]">✓</span>
                    <span>100% Recycled PET • Shed-Resistant Weave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8C6B38]">✓</span>
                    <span>256-Bit SSL Encrypted Seamless Checkout</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* 🌟 PAYONEER IN-WEBSITE POPUP MODAL */}
      <AnimatePresence>
        {showPayoneerModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-[#DFD8CC] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-[#3A332C] text-[#F5F5F7] p-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C19A6B] font-bold block mb-1">
                    Payoneer International Gateway
                  </span>
                  <h3 className="font-serif text-xl">Complete Your Transfer</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPayoneerModal(false)}
                  className="text-[#DFD8CC] hover:text-white text-xl font-light cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Amount to Pay */}
                <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#EAEAEB] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#8C7A63] block uppercase tracking-wider">
                      Amount Due
                    </span>
                    <span className="text-2xl font-serif font-bold text-[#C19A6B]">
                      {getForeignAmountString(grandTotalINR)}
                    </span>
                  </div>
                  <span className="text-xs text-[#7A7065]">
                    Order #{pendingOrderData?.id}
                  </span>
                </div>

                {/* Payoneer Details */}
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wider text-[#3A332C] font-bold block">
                    NR Enterprises Payoneer Receiving Account
                  </span>
                  
                  <div className="bg-[#F5F5F7] p-4 rounded-2xl border border-[#DFD8CC] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8C7A63]">Beneficiary:</span>
                      <span className="font-bold text-[#3A332C]">{paymentSettings.payoneer_account_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C7A63]">Payoneer Email:</span>
                      <span className="font-bold text-[#3A332C]">{paymentSettings.payoneer_email}</span>
                    </div>
                    {paymentSettings.payoneer_details && (
                      <div className="pt-2 border-t border-[#DFD8CC] text-[11px] text-[#7A7065]">
                        {paymentSettings.payoneer_details}
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Pay Link if configured */}
                {paymentSettings.payoneer_payment_url && (
                  <div>
                    <a
                      href={paymentSettings.payoneer_payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block text-center bg-[#C19A6B] text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-[#3A332C] transition-colors rounded-full shadow-sm"
                    >
                      Open Payoneer Payment Link ↗
                    </a>
                  </div>
                )}

                {/* Transaction ID / Reference Input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#8C7A63] font-bold mb-1.5">
                    Payoneer Transaction ID / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={payoneerRef}
                    onChange={(e) => setPayoneerRef(e.target.value)}
                    placeholder="e.g. Transaction ID or Sender Email"
                    className="w-full bg-[#F5F5F7] border border-[#DFD8CC] p-3.5 text-sm text-[#3A332C] outline-none focus:border-[#C19A6B] rounded-2xl"
                  />
                  <span className="text-[10px] text-[#8C7A63] mt-1 block">
                    Enter your Payoneer payment reference or registered email for instant verification.
                  </span>
                </div>

                {/* Confirm Button */}
                <div className="pt-4 border-t border-[#DFD8CC] flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPayoneerModal(false)}
                    className="w-1/3 py-3.5 border border-[#DFD8CC] text-xs uppercase tracking-wider font-bold text-[#7A7065] hover:bg-[#F5F5F7] rounded-full cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePayoneerConfirm}
                    disabled={isSubmitting}
                    className="w-2/3 bg-[#3A332C] text-[#F5F5F7] py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-[#C19A6B] transition-colors rounded-full shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? "Confirming..." : "Confirm & Place Order"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚧 WEBSITE UNDER DEVELOPMENT POPUP MODAL */}
      <AnimatePresence>
        {showUnderDevModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-[#EAEAEB] overflow-hidden text-center p-6 sm:p-8"
            >
              {/* Construction / Loom Icon */}
              <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#EAEAEB] flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
                🛠️
              </div>

              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C19A6B] font-heading font-bold block mb-1.5">
                NR Enterprises Atelier Notice
              </span>

              <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#2B2520] mb-3">
                Website Under Development
              </h3>

              <p className="text-xs sm:text-sm text-[#7A7065] font-body leading-relaxed mb-6">
                Direct online payments are currently paused while our automated payment gateways and seasonal catalogue are being finalized.
                <br /><br />
                You can still place this order or enquire directly with our Bhadohi loom team:
              </p>

              {/* Atelier Concierge Inquire */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnderDevModal(false);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("open-quick-inquire", {
                          detail: {
                            subject: `Order Inquiry (Total: ${formatPrice(grandTotalINR)})`,
                            message: `Hi NR Enterprises Atelier, I would like to place an order from your website (Total: ${formatPrice(grandTotalINR)}). Please assist me with order finalization.`
                          }
                        })
                      );
                    }
                  }}
                  className="w-full py-4 px-6 rounded-full font-heading font-bold text-xs uppercase tracking-wider bg-[#2B2520] hover:bg-[#3A332C] text-[#FAF8F5] flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-[#C19A6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Quick Inquire with Atelier</span>
                </button>

                <a
                  href="mailto:nrenterprises@gmail.com"
                  className="w-full py-3.5 px-6 rounded-full font-heading font-semibold text-xs text-[#2B2520] bg-[#FAFAFA] hover:bg-[#F2ECE1] border border-[#EAEAEB] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>✉️ Email Atelier: nrenterprises@gmail.com</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowUnderDevModal(false)}
                  className="w-full py-2.5 text-xs text-[#7A7065] hover:text-[#2B2520] font-heading font-bold uppercase tracking-wider underline cursor-pointer mt-2"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

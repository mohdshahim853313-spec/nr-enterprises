"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice, usdRate } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "orders" || tabParam === "profile") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        router.push("/login?redirect=/account");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // Initialize Profile Fields from user metadata
      const meta = currentUser.user_metadata || {};
      setProfileName(meta.full_name || meta.name || currentUser.email?.split("@")[0] || "");
      setPhone(meta.phone || "");
      setStreetAddress(meta.address || meta.street_address || "");
      setApartment(meta.apartment || "");
      setCity(meta.city || "");
      setStateProvince(meta.state || meta.province || "");
      setPostalCode(meta.postal_code || meta.zip || "");
      setCountry(meta.country || "India");

      // Check localStorage backup
      try {
        const savedAddr = JSON.parse(localStorage.getItem("nrenterprises_saved_address") || "{}");
        if (savedAddr.phone && !meta.phone) setPhone(savedAddr.phone);
        if (savedAddr.address && !meta.address) setStreetAddress(savedAddr.address);
        if (savedAddr.apartment && !meta.apartment) setApartment(savedAddr.apartment);
        if (savedAddr.city && !meta.city) setCity(savedAddr.city);
        if (savedAddr.stateName && !meta.state) setStateProvince(savedAddr.stateName);
        if (savedAddr.postalCode && !meta.postal_code) setPostalCode(savedAddr.postalCode);
        if (savedAddr.country && !meta.country) setCountry(savedAddr.country);
      } catch (e) {}

      // Fetch Orders:
      let localOrders: any[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem("nrenterprises_orders") || "[]");
      } catch (e) {
        localOrders = [];
      }

      let serverOrders: any[] = [];
      try {
        const { data: serverData } = await supabase
          .from("site_content")
          .select("data")
          .eq("id", "orders_list")
          .maybeSingle();

        if (serverData?.data?.list && Array.isArray(serverData.data.list)) {
          serverOrders = serverData.data.list.filter(
            (o: any) =>
              o.customer_email?.toLowerCase() === currentUser.email?.toLowerCase() ||
              o.user_id === currentUser.id
          );
        }
      } catch (e) {
        // Fallback to local
      }

      const mergedMap = new Map();
      [...serverOrders, ...localOrders].forEach((o) => {
        if (o && o.id && !mergedMap.has(o.id)) {
          mergedMap.set(o.id, o);
        }
      });

      const mergedList = Array.from(mergedMap.values()).sort((a: any, b: any) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      setOrders(mergedList);
      setIsLoading(false);
    };

    fetchUserAndOrders();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg("");
    setProfileErrorMsg("");

    try {
      const updatedMetadata = {
        ...user?.user_metadata,
        full_name: profileName.trim(),
        name: profileName.trim(),
        phone: phone.trim(),
        address: streetAddress.trim(),
        street_address: streetAddress.trim(),
        apartment: apartment.trim(),
        city: city.trim(),
        state: stateProvince.trim(),
        province: stateProvince.trim(),
        postal_code: postalCode.trim(),
        zip: postalCode.trim(),
        country: country.trim(),
      };

      const { data, error } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });

      if (error) {
        setProfileErrorMsg(error.message || "Failed to update profile details.");
        setIsSavingProfile(false);
        return;
      }

      if (data.user) {
        setUser(data.user);
        try {
          localStorage.setItem(
            "nrenterprises_saved_address",
            JSON.stringify({
              fullName: profileName.trim(),
              phone: phone.trim(),
              address: streetAddress.trim(),
              apartment: apartment.trim(),
              city: city.trim(),
              stateName: stateProvince.trim(),
              postalCode: postalCode.trim(),
              country: country.trim(),
            })
          );
        } catch (e) {}
      }

      setProfileSuccessMsg("Profile and shipping details saved successfully!");
      setIsSavingProfile(false);
      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || "An unexpected error occurred while saving.");
      setIsSavingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-20 text-center text-[#C19A6B] font-heading font-semibold text-base animate-pulse">
        Loading Your Account...
      </div>
    );
  }

  if (!user) return null;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Valued Patron";

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "2026";

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-3 sm:pt-4 pb-24 font-sans text-[#2B2520]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* HEADER PROFILE BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-8 md:p-10 border border-[#EAEAEB]/80 rounded-3xl shadow-sm mb-6 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 aspect-square shrink-0 rounded-full bg-[#FAFAFA] text-[#C19A6B] border border-[#EAEAEB] flex items-center justify-center font-heading text-xl sm:text-2xl font-bold uppercase shadow-xs overflow-hidden">
              {fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C19A6B] font-heading font-bold block truncate mb-0.5">
                NR Enterprises Patron
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-[#2B2520] truncate tracking-tight">{fullName}</h1>
              <p className="text-xs font-body text-[#7A7065] mt-1 truncate">
                {user.email} • Member since {memberSince}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#EAEAEB]">
            <Link
              href="/wishlist"
              className="flex-1 md:flex-initial text-center whitespace-nowrap px-5 py-2.5 text-xs uppercase tracking-wider font-heading font-semibold border border-[#EAEAEB] text-[#2B2520] hover:border-[#C19A6B] hover:text-[#C19A6B] transition-colors rounded-full bg-[#FAFAFA] shadow-xs"
            >
              My Wishlist
            </Link>
            <button
              onClick={handleSignOut}
              className="flex-1 md:flex-initial text-center whitespace-nowrap px-5 py-2.5 text-xs uppercase tracking-wider font-heading font-semibold bg-[#2B2520] text-white hover:bg-red-700 transition-colors rounded-full shadow-xs cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-4 sm:gap-8 border-b border-[#EAEAEB] mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => {
              setActiveTab("profile");
              router.replace("/account?tab=profile", { scroll: false });
            }}
            className={`pb-3 text-xs uppercase tracking-wider font-heading font-bold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "profile" ? "text-[#2B2520]" : "text-[#7A7065] hover:text-[#2B2520]"
            }`}
          >
            Profile Information
            {activeTab === "profile" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C19A6B]" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("orders");
              router.replace("/account?tab=orders", { scroll: false });
            }}
            className={`pb-3 text-xs uppercase tracking-wider font-heading font-bold transition-all relative whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "orders" ? "text-[#2B2520]" : "text-[#7A7065] hover:text-[#2B2520]"
            }`}
          >
            Order History ({orders.length})
            {activeTab === "orders" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C19A6B]" />
            )}
          </button>
        </div>

        {/* TAB CONTENT: ORDERS */}
        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div className="bg-white p-8 sm:p-12 border border-[#EAEAEB]/80 rounded-3xl text-center shadow-sm">
                <div className="w-16 h-16 bg-[#FAFAFA] text-[#C19A6B] rounded-full mx-auto flex items-center justify-center mb-4 border border-[#EAEAEB]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#2B2520] mb-2">No Orders Placed Yet</h3>
                <p className="font-body text-[#7A7065] text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  You haven&apos;t placed any orders yet. Discover our collection of hand-braided rPET
                  luxury carpets or create your bespoke design.
                </p>
                <div className="flex flex-wrap justify-center gap-3.5">
                  <Link
                    href="/collections"
                    className="bg-[#C19A6B] text-white px-7 py-3 text-xs uppercase tracking-wider font-heading font-bold hover:bg-[#B89258] transition-colors rounded-full shadow-sm"
                  >
                    Explore Collections
                  </Link>
                  <Link
                    href="/customize"
                    className="border border-[#2B2520] text-[#2B2520] px-7 py-3 text-xs uppercase tracking-wider font-heading font-bold hover:bg-[#2B2520] hover:text-white transition-colors rounded-full"
                  >
                    Bespoke Studio
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const orderDate = order.created_at
                    ? new Date(order.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-[#EAEAEB]/80 rounded-3xl shadow-sm overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="p-5 sm:p-6 bg-[#FAFAFA]/80 border-b border-[#EAEAEB] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-[#7A7065] block font-heading font-bold">
                              Order ID
                            </span>
                            <span className="text-sm font-heading font-bold text-[#2B2520]">
                              #{order.id}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-[#7A7065] block font-heading font-bold">
                              Date Placed
                            </span>
                            <span className="text-xs text-[#2B2520] font-heading font-medium">{orderDate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-[#7A7065] block font-heading font-bold">
                              Total
                            </span>
                            <span className="text-sm font-heading font-bold text-[#2B2520]">
                              {(() => {
                                const numericTotal = typeof order.total === "number" && order.total > 0
                                  ? order.total
                                  : typeof order.subtotal === "number" && order.subtotal > 0
                                    ? order.subtotal + (typeof order.shipping_fee === "number" ? order.shipping_fee : 0)
                                    : null;
                                
                                if (numericTotal !== null) {
                                  return formatPrice(numericTotal);
                                }
                                
                                if (order.display_total) {
                                  const rawVal = parseFloat(order.display_total.toString().replace(/[^0-9.]/g, ""));
                                  if (!isNaN(rawVal) && rawVal > 0) {
                                    if (order.display_total.includes("$") || order.currency === "USD") {
                                      return formatPrice(rawVal * (usdRate || 83.5));
                                    }
                                    return formatPrice(rawVal);
                                  }
                                }
                                return order.display_total || `₹${order.total || 0}`;
                              })()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="inline-block bg-[#FAFAFA] text-[#C19A6B] border border-[#C19A6B]/30 px-3.5 py-1 text-[10px] uppercase tracking-widest font-heading font-bold rounded-full">
                            {order.order_status || "Processing at Loom"}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-5 sm:p-6 divide-y divide-[#EAEAEB]">
                        {Array.isArray(order.items) &&
                          order.items.map((item: any, idx: number) => (
                            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                              <div className="w-16 h-16 bg-[#FAFAFA] rounded-2xl overflow-hidden relative shrink-0 border border-[#EAEAEB]">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name || "Carpet"}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#7A7065] text-xs font-heading">
                                    Rug
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-heading font-bold text-[#2B2520] truncate">
                                  {item.name}
                                </h4>
                                <div className="text-xs font-body text-[#7A7065] mt-0.5">
                                  <span>Size: {item.size}</span>
                                  {item.isCustom && (
                                    <span className="ml-2 text-[#C19A6B] font-heading font-semibold">
                                      (Custom Bespoke)
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-body text-[#7A7065] mt-1">
                                  Quantity: {item.quantity || 1}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Delivery Summary */}
                      {order.shipping_address && (
                        <div className="px-5 sm:px-6 py-4 bg-[#FAFAFA]/50 border-t border-[#EAEAEB] text-xs font-body text-[#7A7065] flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <span className="font-heading font-bold text-[#2B2520]">Deliver To: </span>
                            {order.shipping_address.firstName} {order.shipping_address.lastName},{" "}
                            {order.shipping_address.city}, {order.shipping_address.country}
                          </div>
                          <div className="text-[11px] font-heading font-semibold text-[#7A7065]">
                            Payment: {order.payment_method || "Online"}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: PROFILE DETAILS */}
        {activeTab === "profile" && (
          <div className="bg-white p-5 sm:p-8 md:p-12 border border-[#EAEAEB]/80 rounded-3xl shadow-sm w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-[#EAEAEB]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C19A6B] font-heading font-bold block mb-1">
                  Patron Credentials
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#2B2520]">Profile & Delivery Details</h3>
              </div>
              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#FAFAFA] border border-[#EAEAEB] text-xs font-heading font-semibold text-[#2B2520] rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Verified Patron
              </span>
            </div>

            {profileSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-body"
              >
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{profileSuccessMsg}</span>
              </motion.div>
            )}

            {profileErrorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl leading-relaxed font-body"
              >
                {profileErrorMsg}
              </motion.div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              {/* SECTION 1: PERSONAL DETAILS */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#7A7065] font-heading font-bold mb-4 flex items-center gap-2">
                  <span>1. Personal Information</span>
                  <span className="flex-1 h-[1px] bg-[#EAEAEB]" />
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm text-[#2B2520] font-body outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email || ""}
                      className="w-full bg-[#FAFAFA]/60 border border-[#EAEAEB] p-3.5 text-sm text-[#7A7065] font-body cursor-not-allowed rounded-2xl opacity-75"
                    />
                    <span className="text-[10px] font-body text-[#7A7065] mt-1 block">
                      Primary login email (Managed via Supabase Auth)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                      Phone / Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm text-[#2B2520] font-body outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DEFAULT SHIPPING & DELIVERY ADDRESS */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#7A7065] font-heading font-bold mb-4 flex items-center gap-2">
                  <span>2. Default Shipping & Delivery Address</span>
                  <span className="flex-1 h-[1px] bg-[#EAEAEB]" />
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                      Street Address / House & Suite No.
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. 42 Lotus Heritage Boulevard, Flat 3B"
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm text-[#2B2520] font-body outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                      Apartment / Landmark / Area (Optional)
                    </label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="e.g. Near Royal Palms Park"
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm text-[#2B2520] font-body outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai / New York"
                        className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm text-[#2B2520] font-body outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                        State / Province / Region
                      </label>
                      <input
                        type="text"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="e.g. Maharashtra / NY"
                        className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm text-[#2B2520] font-body outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                        Postal Code / PIN / ZIP
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 400001 / 10001"
                        className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm text-[#2B2520] font-body outline-none focus:border-[#C19A6B] transition-colors rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A7065] font-heading font-bold mb-2">
                        Country
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-[#EAEAEB] p-3.5 text-sm text-[#2B2520] font-body outline-none focus:border-[#C19A6B] transition-colors rounded-2xl cursor-pointer"
                      >
                        <option value="India">India (IN)</option>
                        <option value="United States">United States (US)</option>
                        <option value="United Kingdom">United Kingdom (UK)</option>
                        <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                        <option value="Canada">Canada (CA)</option>
                        <option value="Australia">Australia (AU)</option>
                        <option value="Germany">Germany (DE)</option>
                        <option value="France">France (FR)</option>
                        <option value="Italy">Italy (IT)</option>
                        <option value="Saudi Arabia">Saudi Arabia (SA)</option>
                        <option value="Singapore">Singapore (SG)</option>
                        <option value="Other">Other International Destination</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EAEAEB]">
                <div className="text-xs font-body text-[#7A7065]">
                  User ID: <span className="font-heading font-semibold text-[#2B2520]">{user.id.slice(0, 16)}...</span>
                </div>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto bg-[#C19A6B] text-white px-8 py-3.5 text-xs tracking-wider uppercase font-heading font-bold hover:bg-[#B89258] transition-colors rounded-full shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProfile ? "Saving Details..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-20 text-center text-[#C19A6B] font-heading font-semibold text-base animate-pulse">
          Loading Your Account...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

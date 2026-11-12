"use client";

import { useState } from "react";

interface ContactProps {
  initialData: any;
}

export default function ContactClient({ initialData }: ContactProps) {
  const contactData = initialData;

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Cloud-driven content with matching cloud defaults
  const title = contactData?.header?.title || "Connect With Us";
  const description =
    contactData?.header?.description ||
    "For bespoke dimensions, custom designs, bulk orders, or manufacturing inquiries directly from our Bhadohi unit.";
  const btnText = contactData?.header?.btnText || "Send Message";

  const displayEmail = contactData?.info?.email || "nrenterprises@gmail.com";
  const displayAddress =
    contactData?.info?.address ||
    "Bhadohi — 221401, Uttar Pradesh, India.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setErrorMessage("Please provide your email address and inquiry message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "Patron";

      // 1. Direct Web3Forms delivery
      try {
        const formData = new FormData();
        formData.append("access_key", "b6a79918-e395-4ef6-b840-127c9ba68fb8");
        formData.append("name", fullName);
        formData.append("email", email.trim());
        formData.append("phone", phone.trim());
        formData.append("message", message.trim());
        formData.append("subject", `[NR Enterprises Atelier] New Inquiry from ${fullName}`);
        formData.append("from_name", "NR Enterprises Website");

        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData,
        });
      } catch (web3Err) {
        console.warn("Web3Forms email delivery notice:", web3Err);
      }

      // 2. Save to Supabase database
      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            message: message.trim(),
          }),
        });
      } catch (apiErr) {
        console.warn("Database persistence notice:", apiErr);
      }

      setIsSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2B070B] font-sans pt-2 sm:pt-4 pb-20 sm:pb-28 px-2.5 sm:px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Header Title (Hidden on mobile so the card lands directly on top) */}
        <div className="hidden sm:block text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5EB] border border-[#4A1017]/40 text-[11px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C6B38] shadow-2xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C6B38]" />
            Direct Atelier Support
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-heading mb-4 text-[#2B070B] tracking-tight">
            {title}
          </h1>
          <p className="text-[#5A4E42] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* 3 Quick Contact Channels in Royal Persian Maroon */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-quick-inquire", {
                  detail: { subject: "Bespoke Rug Inquiry" }
                }));
              }
            }}
            className="bg-gradient-to-b from-[#2D080C] via-[#350A10] to-[#240609] p-6 rounded-2xl border border-[#4A1017] shadow-md hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(74,16,23,0.52)] transition-all group flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#4A1017] text-[#FAF5EB] flex items-center justify-center mb-3 group-hover:bg-[#FAF5EB] group-hover:text-[#240609] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#FAF5EB] mb-1">
              QUICK INQUIRE
            </span>
            <span className="font-heading font-bold text-sm text-[#FAF5EB]">Instant Atelier Desk</span>
            <span className="text-[11px] text-[#FAF5EB]/80 mt-0.5">Click to open inquiry form</span>
          </button>

          <div
            className="bg-gradient-to-b from-[#2D080C] via-[#350A10] to-[#240609] p-6 rounded-2xl border border-[#4A1017] shadow-md hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(74,16,23,0.52)] transition-all group flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-[#4A1017] text-[#FAF5EB] flex items-center justify-center mb-3 group-hover:bg-[#FAF5EB] group-hover:text-[#240609] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#FAF5EB] mb-1">
              ORIGIN ATELIER
            </span>
            <span className="font-heading font-bold text-sm text-[#FAF5EB]">Bhadohi, India</span>
            <span className="text-[11px] text-[#FAF5EB]/80 mt-0.5">Carpet City of India</span>
          </div>

          <a
            href={`mailto:${displayEmail}`}
            className="bg-gradient-to-b from-[#2D080C] via-[#350A10] to-[#240609] p-6 rounded-2xl border border-[#4A1017] shadow-md hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(74,16,23,0.52)] transition-all group flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-[#4A1017] text-[#FAF5EB] flex items-center justify-center mb-3 group-hover:bg-[#FAF5EB] group-hover:text-[#240609] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#FAF5EB] mb-1">
              EMAIL INQUIRY
            </span>
            <span className="font-heading font-bold text-sm text-[#FAF5EB]">{displayEmail}</span>
            <span className="text-[11px] text-[#FAF5EB]/80 mt-0.5">Quick response guaranteed</span>
          </a>
        </div>

        {/* Contact Form */}
        {isSuccess ? (
          <div className="bg-white p-10 sm:p-14 rounded-3xl shadow-xl border border-[#4A1017] text-center space-y-4">
            <div className="w-16 h-16 bg-[#2B070B] text-[#FAF5EB] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-[#4A1017]">
              ✓
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-[#2B070B]">
              Inquiry Received
            </h3>
            <p className="text-sm text-[#5A4E42] max-w-md mx-auto leading-relaxed">
              Thank you for reaching out. Your message has been sent directly to our master weaving atelier team (
              <strong>{displayEmail}</strong>). We will get in touch shortly.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="mt-4 inline-block bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white border border-[#4A1017] px-8 py-3 text-xs font-heading font-bold uppercase tracking-[0.16em] transition-colors rounded-full shadow-md cursor-pointer"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 sm:p-12 rounded-3xl shadow-xl border border-[#4A1017]/25"
          >
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B] mb-2"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Eleanor"
                  className="w-full bg-[#FAF8F5] border border-[#4A1017]/25 rounded-xl px-4 py-3 text-sm text-[#2B070B] placeholder-[#8C7A63] outline-none focus:border-[#4A1017] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B] mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full bg-[#FAF8F5] border border-[#4A1017]/25 rounded-xl px-4 py-3 text-sm text-[#2B070B] placeholder-[#8C7A63] outline-none focus:border-[#4A1017] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B] mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#FAF8F5] border border-[#4A1017]/25 rounded-xl px-4 py-3 text-sm text-[#2B070B] placeholder-[#8C7A63] outline-none focus:border-[#4A1017] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B] mb-2"
                >
                  City & Country (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. London, United Kingdom"
                  className="w-full bg-[#FAF8F5] border border-[#4A1017]/25 rounded-xl px-4 py-3 text-sm text-[#2B070B] placeholder-[#8C7A63] outline-none focus:border-[#4A1017] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-xs font-heading font-bold uppercase tracking-wider text-[#2B070B] mb-2"
              >
                Your Inquiry / Custom Requirements *
              </label>
              <textarea
                name="message"
                id="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your desired rug dimensions, color palette, pile texture, or interior requirements..."
                rows={5}
                className="w-full bg-[#FAF8F5] border border-[#4A1017]/25 rounded-xl px-4 py-3 text-sm text-[#2B070B] placeholder-[#8C7A63] outline-none focus:border-[#4A1017] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2B070B] hover:bg-[#3D0C12] text-[#FAF5EB] hover:text-white border border-[#4A1017] py-4 rounded-full text-xs font-heading font-bold uppercase tracking-[0.18em] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Delivering Inquiry..." : btnText}
            </button>
          </form>
        )}

        {/* Workshop Address Card */}
        <div className="mt-14 bg-[#FAF5EB] p-8 rounded-2xl border border-[#4A1017]/30 text-center shadow-xs">
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-[#8C6B38] block mb-1">
            ORIGIN OF CRAFT
          </span>
          <h4 className="text-xl font-bold font-heading text-[#2B070B] mb-2">
            NR Enterprises Atelier & Workshop
          </h4>
          <p className="text-xs sm:text-sm text-[#5A4E42] max-w-md mx-auto leading-relaxed">
            {displayAddress}
          </p>
        </div>
      </div>
    </div>
  );
}

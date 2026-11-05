import React from "react";

export default function PaymentMethods() {
  const methods = [
    {
      name: "Razorpay",
      title: "Razorpay Secure Gateway",
      icon: (
        <svg className="h-3.5 sm:h-5.5 max-w-full w-auto" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Razorpay Blade Symbol */}
          <path d="M16.5 2L5 26H11.5L20 2H16.5Z" fill="#0C2340" />
          <path d="M21 2L15.5 14H21.5L25 2H21Z" fill="#0284C7" />
          <path d="M12.5 14L8 26H14L17.5 14H12.5Z" fill="#0284C7" />
          {/* Razorpay Wordmark */}
          <text x="30" y="19" fill="#0C2340" fontFamily="sans-serif" fontSize="15" fontWeight="bold" letterSpacing="-0.5">
            Razorpay
          </text>
        </svg>
      ),
    },
    {
      name: "Payoneer",
      title: "Payoneer Global Payments",
      icon: (
        <svg className="h-3.5 sm:h-5.5 max-w-full w-auto" viewBox="0 0 110 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Payoneer Circle */}
          <circle cx="13" cy="13" r="9" stroke="url(#payoneerGradient)" strokeWidth="3.2" fill="none" />
          <defs>
            <linearGradient id="payoneerGradient" x1="4" y1="4" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF4800" />
              <stop offset="0.5" stopColor="#FF007A" />
              <stop offset="1" stopColor="#7928CA" />
            </linearGradient>
          </defs>
          {/* Payoneer Wordmark */}
          <text x="28" y="18" fill="#1A1A1A" fontFamily="sans-serif" fontSize="14" fontWeight="700" letterSpacing="-0.3">
            payoneer
          </text>
        </svg>
      ),
    },
    {
      name: "Visa",
      title: "Visa Cards",
      icon: (
        <svg className="h-3 sm:h-4.5 max-w-full w-auto" viewBox="0 0 50 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M19.2 1.2L12.6 15.2H8.3L5.1 3.8C4.9 3 4.7 2.7 4.1 2.3C3.1 1.7 1.5 1.2 0 0.9L0.1 0.4H7.2C8.1 0.4 8.9 1 9.1 2.1L10.8 11.2L15 1.2H19.2ZM35.8 10.4C35.8 6.4 30.2 6.2 30.2 4.4C30.2 3.8 30.8 3.2 32 3C32.6 2.9 34.2 2.8 35.9 3.6L36.6 0.5C35.6 0.1 34.4 0 32.8 0C28.8 0 26 2.1 26 5.2C26 9.7 32.2 9.4 32.2 11.6C32.2 12.3 31.4 12.9 30 12.9C28.4 12.9 26.6 12.2 25.7 11.7L25 14.9C26.1 15.4 28.2 15.8 30.2 15.8C34.4 15.8 35.8 13.5 35.8 10.4ZM46.3 15.2H50L46.8 1.2H43.4C42.6 1.2 41.9 1.6 41.6 2.3L35.5 15.2H39.8L40.7 12.7H45.8L46.3 15.2ZM41.8 9.7L43.9 4.1L45.2 9.7H41.8ZM25.2 1.2L21.8 15.2H17.7L21.1 1.2H25.2Z"
            fill="#1A1F71"
          />
        </svg>
      ),
    },
    {
      name: "Mastercard",
      title: "Mastercard",
      icon: (
        <svg className="h-4 sm:h-6.5 max-w-full w-auto" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#EB001B" />
          <circle cx="26" cy="12" r="10" fill="#F79E1B" fillOpacity="0.95" />
          <path
            d="M19 4.8A10 10 0 0 0 14.8 12A10 10 0 0 0 19 19.2A10 10 0 0 0 23.2 12A10 10 0 0 0 19 4.8Z"
            fill="#FF5F00"
          />
        </svg>
      ),
    },
    {
      name: "American Express",
      title: "American Express (Amex)",
      icon: (
        <svg className="h-4 sm:h-6.5 max-w-full w-auto" viewBox="0 0 44 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="44" height="24" rx="3.5" fill="#016FD0" />
          <path
            d="M9.8 16.5L8.3 13.2H5.7L4.2 16.5H2L6.2 7.5H8.2L12 16.5H9.8ZM7 10L6.1 12H7.9L7 10ZM13 16.5V7.5H16L18 13.5L20 7.5H23V16.5H21V10.2L18.8 16.5H17.2L15 10.2V16.5H13ZM24.5 16.5V7.5H30.5V9.3H26.8V11.1H30V12.9H26.8V14.7H30.5V16.5H24.5ZM35.5 12L39 7.5H41.5L37.2 12L41.8 16.5H39.2L35.5 12ZM32 7.5H34.5L32 12L34.5 16.5H32L30.5 13.8L32 7.5Z"
            fill="white"
            fillRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "RuPay",
      title: "RuPay Debit & Credit Cards",
      icon: (
        <svg className="h-3 sm:h-4.5 max-w-full w-auto" viewBox="0 0 68 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="14" fill="#0A3A82" fontFamily="sans-serif" fontSize="15" fontWeight="900" fontStyle="italic">
            Ru
          </text>
          <text x="23" y="14" fill="#107C41" fontFamily="sans-serif" fontSize="15" fontWeight="900" fontStyle="italic">
            Pay
          </text>
          {/* RuPay Orange & Green Arrows */}
          <path d="M54 2L60 9L54 16H58L64 9L58 2H54Z" fill="#F37021" />
          <path d="M60 2L66 9L60 16H64L70 9L64 2H60Z" fill="#0A3A82" />
        </svg>
      ),
    },
    {
      name: "UPI",
      title: "UPI (Google Pay, PhonePe, Paytm, BHIM)",
      icon: (
        <svg className="h-3.5 sm:h-5.5 max-w-full w-auto" viewBox="0 0 54 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* UPI Arrows */}
          <path d="M12 2L4 18H8.5L14.5 6L12 2Z" fill="#097F52" />
          <path d="M17 2L9 18H13.5L19.5 6L17 2Z" fill="#F37021" />
          <text x="23" y="15" fill="#2B2520" fontFamily="sans-serif" fontSize="13" fontWeight="900" letterSpacing="0.5">
            UPI
          </text>
        </svg>
      ),
    },
    {
      name: "NetBanking",
      title: "Net Banking (50+ Indian Banks)",
      icon: (
        <div className="flex items-center space-x-1 sm:space-x-1.5 px-0.5">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#0C2340] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 10h20v2H2v-2zm2-7l8-3 8 3v2H2V3zm1 8h2v7H5v-7zm5 0h2v7h-2v-7zm5 0h2v7h-2v-7zm5 0h2v7h-2v-7zM1 21h22v2H1v-2z" />
          </svg>
          <span className="text-[9px] sm:text-xs font-bold tracking-tight text-[#0C2340] uppercase whitespace-nowrap">
            NetBanking
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center justify-center gap-1.5 sm:gap-3 w-full max-w-md sm:max-w-none mx-auto">
      {methods.map((method) => (
        <div
          key={method.name}
          title={method.title}
          className="h-9 sm:h-11 px-1 sm:px-4 bg-white border border-[#DCD3C4] rounded-lg shadow-2xs flex items-center justify-center hover:border-[#9E7848] hover:shadow-xs transition-all duration-200 cursor-default select-none overflow-hidden"
        >
          {method.icon}
        </div>
      ))}
    </div>
  );
}

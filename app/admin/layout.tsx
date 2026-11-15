"use client";

import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔓 Direct Open Access: Login wall completely removed as requested
  return (
    <div className="relative min-h-screen bg-[#FAF8F5]">
      {children}
    </div>
  );
}

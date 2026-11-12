"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrollDirection } from "@/lib/useScrollDirection";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();

  // Hide on admin dashboard routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      name: "Home",
      href: "/",
      isActive: pathname === "/",
      icon: (active: boolean) => (
        <svg
          className="w-[20px] h-[20px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill={active ? "#FAF5EB" : "none"}
          stroke={active ? "#FAF5EB" : "currentColor"}
          strokeWidth={active ? "2" : "1.75"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {active ? (
            <path
              d="M3.75 11.25L12 3.75l8.25 7.5v8.25a1.5 1.5 0 01-1.5 1.5h-4.5v-5.25a1.5 1.5 0 00-1.5-1.5h-1.5a1.5 1.5 0 00-1.5 1.5v5.25H5.25a1.5 1.5 0 01-1.5-1.5v-8.25z"
              fill="#FAF5EB"
            />
          ) : (
            <path d="M3.75 11.25L12 3.75l8.25 7.5v8.25a1.5 1.5 0 01-1.5 1.5h-4.5v-5.25a1.5 1.5 0 00-1.5-1.5h-1.5a1.5 1.5 0 00-1.5 1.5v5.25H5.25a1.5 1.5 0 01-1.5-1.5v-8.25z" />
          )}
        </svg>
      ),
    },
    {
      name: "Shop",
      href: "/collections",
      isActive: pathname.startsWith("/collections") || pathname.startsWith("/product"),
      icon: (active: boolean) => (
        <svg
          className="w-[20px] h-[20px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill={active ? "#FAF5EB" : "none"}
          stroke={active ? "#FAF5EB" : "currentColor"}
          strokeWidth={active ? "2" : "1.75"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {active ? (
            <>
              <path d="M16 10a4 4 0 01-8 0" />
              <path
                d="M5 7h14l1.2 13.2a1.5 1.5 0 01-1.5 1.6H5.3a1.5 1.5 0 01-1.5-1.6L5 7z"
                fill="#FAF5EB"
              />
              <path d="M16 10a4 4 0 01-8 0" stroke="#240609" strokeWidth="2" />
            </>
          ) : (
            <>
              <path d="M16 10a4 4 0 01-8 0" />
              <path d="M5 7h14l1.2 13.2a1.5 1.5 0 01-1.5 1.6H5.3a1.5 1.5 0 01-1.5-1.6L5 7z" />
            </>
          )}
        </svg>
      ),
    },
    {
      name: "Story",
      href: "/legacy",
      isActive: pathname === "/legacy" || pathname === "/process",
      icon: (active: boolean) => (
        <svg
          className="w-[20px] h-[20px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill={active ? "#FAF5EB" : "none"}
          stroke={active ? "#FAF5EB" : "currentColor"}
          strokeWidth={active ? "2" : "1.75"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {active ? (
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill="#FAF5EB"
            />
          ) : (
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          )}
        </svg>
      ),
    },
    {
      name: "Account",
      href: "/account",
      isActive: pathname.startsWith("/account") || pathname === "/login" || pathname === "/signup",
      icon: (active: boolean) => (
        <svg
          className="w-[20px] h-[20px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill={active ? "#FAF5EB" : "none"}
          stroke={active ? "#FAF5EB" : "currentColor"}
          strokeWidth={active ? "2" : "1.75"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {active ? (
            <>
              <circle cx="12" cy="7.5" r="3.75" fill="#FAF5EB" />
              <path d="M4.5 20.25a7.5 7.5 0 0115 0" fill="#FAF5EB" />
            </>
          ) : (
            <>
              <circle cx="12" cy="7.5" r="3.75" />
              <path d="M4.5 20.25a7.5 7.5 0 0115 0" />
            </>
          )}
        </svg>
      ),
    },
  ];

  return (
    <aside
      aria-label="Mobile Navigation Bar"
      className={`lg:hidden fixed bottom-3.5 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] z-[90] bg-[#240609]/95 backdrop-blur-xl border border-[#4A1017] shadow-[0_12px_36px_rgba(42,8,12,0.6)] rounded-none p-1.5 px-3 flex justify-around items-center select-none transition-transform duration-300 ease-in-out ${
        scrollDirection === "down" ? "translate-y-[130px]" : "translate-y-0"
      }`}
    >
      <nav className="flex items-center justify-around w-full">
        {navItems.map((item) => {
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-none transition-all duration-200 cursor-pointer active:scale-95 ${
                item.isActive
                  ? "text-[#FAF5EB]"
                  : "text-[#D8C9C5] hover:text-[#FAF5EB]"
              }`}
            >
              {/* Active ambient glow pill */}
              {item.isActive && (
                <span className="absolute inset-0 bg-[#4A1017]/40 border border-[#FAF5EB]/30 rounded-none pointer-events-none" />
              )}

              <div className="relative flex items-center justify-center mb-0.5 z-10">
                {item.icon(item.isActive)}
              </div>
              <span
                className={`text-[10px] tracking-[0.14em] uppercase leading-tight font-heading transition-colors z-10 ${
                  item.isActive ? "font-bold text-[#FAF5EB]" : "font-semibold text-[#D8C9C5]"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || searchParams.get("redirect") || "/account";

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push(next);
        } else {
          // Listen for state change in case tokens are in hash
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (session) {
                router.push(next);
              }
            }
          );
          // Fallback timeout
          setTimeout(() => {
            router.push(next);
          }, 2000);

          return () => subscription.unsubscribe();
        }
      } catch (err) {
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [next, router]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 border-2 border-[#C19A6B] border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-xl font-serif text-[#3A332C]">Authenticating...</h2>
      <p className="text-xs text-[#7A7065] mt-2">Connecting your NR Enterprises session safely.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5F7] pt-40 pb-40 text-center text-[#C19A6B] font-serif text-lg animate-pulse">
          Authenticating...
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

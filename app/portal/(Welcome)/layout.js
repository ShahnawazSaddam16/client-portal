"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

export default function PortalLayout({ children }) {
  const router = useRouter();
  const { user, loading, refetch } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log(loading,user)
    if (loading) return;

    if (user) {
      // User is confirmed — allow render
      setAuthChecked(true);
      return;
    }
    refetch().then((freshUser) => {
      if (freshUser) {
        setAuthChecked(true);
      } else {
        router.replace("/");
      }
    });
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="text-center">
          <p className="text-lg font-medium">Checking your session...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

export default function PortalLayout({ children }) {
  const router = useRouter();
  const { user, loading, refetch } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Still waiting for the initial AuthContext fetch to settle
    if (loading) return;

    if (user) {
      // User is confirmed — allow render
      setAuthChecked(true);
      return;
    }

    // AuthContext loaded but user is null.
    // This can happen due to a React 18 concurrent render race where
    // Login.js's refetch() state update hasn't committed before navigation.
    // Do one independent check before deciding to redirect.
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


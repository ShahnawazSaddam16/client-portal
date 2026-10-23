"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import SideBar from "@/components/app-shell/SideBar";
import ProjectById from "@/components/Portal/Welcome/Projects/ProjectById";


export default function ProjectIdPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="text-center">
          <p className="text-lg font-medium">Checking your session...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex min-h-screen bg-white">
      <SideBar />
      <main className="flex-1 md:ml-0 w-full">
        <div className="p-6 md:p-8 pt-20 md:pt-8">
        <ProjectById />
        </div>
      </main>
    </main>
  );
}

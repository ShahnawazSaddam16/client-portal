'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import Header from "@/components/Auth/Header";
import Login from "@/components/Auth/Login";
import Image from "next/image";

export default function AuthPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) router.replace("/portal");
  }, [loading, isAuthenticated, router]);

  if (loading || isAuthenticated) return null;

  return (
    <>
    <Header />
    <Login />
    </>
  );
}
import { Suspense } from "react";
import { connection } from "next/server";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Client Portal | Secure Client Access",
  description:
    "Client Portal gives clients secure access to projects, updates, notifications, and key information in one streamlined workspace.",
  keywords: [
    "Client Portal",
    "client portal",
    "project updates",
    "client dashboard",
    "secure client access",
    "notifications",
  ],
  metadataBase: new URL("https://client-portal.buttnetworks.com"),
  openGraph: {
    title: "Client Portal | Secure Client Access",
    description:
      "Manage projects, notifications, and client updates from a secure, centralized portal.",
    url: "https://client-portal.buttnetworks.com",
    siteName: "Client Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Portal | Secure Client Access",
    description:
      "A modern client portal for accessing projects, updates, and notifications securely.",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

async function DynamicMarker() {
  await connection();
  return null;
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <DynamicMarker />
        </Suspense>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
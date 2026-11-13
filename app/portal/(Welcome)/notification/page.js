"use client";

import SideBar from "@/components/app-shell/SideBar";
import AllNotifications from "@/components/Portal/Notification/AllNotifications";

export default function NotificationPage() {
  return (
    <main className="flex min-h-screen bg-white">
      <SideBar />
      <main className="flex-1 md:ml-0 w-full">
        <div className="p-6 md:p-8 pt-20 md:pt-8">
          <AllNotifications />
        </div>
      </main>
    </main>
  );
}

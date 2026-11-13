"use client";

import SideBar from "@/components/app-shell/SideBar";
import ProjectById from "@/components/Portal/Projects/ProjectById";

export default function ProjectIdPage() {
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

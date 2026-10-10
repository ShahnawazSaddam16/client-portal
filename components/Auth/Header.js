import { User2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react'

export default function Header() {
  return (
    <nav className="flex justify-between items-center w-full h-16 px-6 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 shadow-md shadow-blue-900/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center w-10 h-10 justify-center backdrop-blur-sm">
          <Image 
          src={"/favicon.png"}
          width={100}
          height={100}
          alt={"Logo"}
          className="rounded-full"
          />
        </div>
        <h1 className="font-semibold text-lg text-white tracking-tight">
          Butt<span className="text-blue-200">-</span>Networks
        </h1>
      </div>

      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border cursor-pointer
      border-white/20 px-3 py-1.5 rounded-full hover:bg-white/20 transition duration-150">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-900">
          <User2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-sm text-white">Client</span>
      </div>
    </nav>
  );
}
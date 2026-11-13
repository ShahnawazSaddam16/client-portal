import { User2 } from "lucide-react";
import Image from "next/image";
import React, {useState} from "react";
import QuotePopUp from "./QuotePopUp";

export default function Header() {
  const [open, setOpen] = useState("");

  return (
    <>
    <nav className="flex justify-between items-center w-full h-16 px-3 sm:px-6 gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 shadow-md shadow-blue-900/20">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 justify-center backdrop-blur-sm">
          <Image
            src={"/favicon.png"}
            width={100}
            height={100}
            alt={"Logo"}
            className="rounded-full"
          />
        </div>
        <h1 className="font-semibold text-base sm:text-lg text-white tracking-tight truncate">
          Butt<span className="text-blue-200">-</span>Networks
        </h1>
      </div>

      <div className="flex gap-2 sm:gap-3 shrink-0">

        <button
        onClick={()=>{setOpen(true)}}
          className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm border cursor-pointer
      border-white/20 px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/20 transition duration-150 whitespace-nowrap"
        >
          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-900">
            <User2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-medium text-xs sm:text-sm text-white sm:hidden">Quote</span>
          <span className="font-medium text-sm text-white hidden sm:inline">Request a Quote</span>
        </button>

        <div
          className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm border cursor-pointer
      border-white/20 px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/20 transition duration-150 whitespace-nowrap"
        >
          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-900">
            <User2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-medium text-sm text-white hidden sm:inline">Client</span>
        </div>
      </div>
    </nav>
    <QuotePopUp open={open} setOpen={setOpen}/>
    </>
  );
}
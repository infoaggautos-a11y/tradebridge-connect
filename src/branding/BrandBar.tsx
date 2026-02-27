import React from "react";

// Lightweight branding bar to elevate the TradeBridge brand
export function BrandBar() {
  return (
    <div className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm py-1.5 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-semibold">TradeBridge</span>
        <span className="opacity-90 hidden sm:inline">Connect</span>
      </div>
      <span className="hidden sm:inline">Brand Kit</span>
    </div>
  );
}

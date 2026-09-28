import React from 'react';
import { Menu, Terminal } from 'lucide-react';

export default function Header({
  onOpenSapModal,
  onOpenAuthModal,
  onOpenMobileSidebar,
  user
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 py-3 flex items-center justify-between shadow-xs">

      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition touch-manipulation"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            Quality Inspection Tracker
          </h1>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            For Shop-Floor Supervisors
          </p>
        </div>
      </div>

      {/* Right: SAP Webhook & User Profile Pill */}
      <div className="flex items-center space-x-2">

        {/* SAP Webhook Tester Button (Clean Corporate Styling) */}
        <button
          onClick={onOpenSapModal}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition touch-manipulation"
          title="SAP Webhook Tester"
        >

          <span className="hidden sm:inline">SAP Webhook</span>
        </button>

        {/* Supervisor Profile Pill */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 transition touch-manipulation"
        >
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
            {user ? user.name.charAt(0) : 'P'}
          </div>
          <span className="truncate max-w-[90px] sm:max-w-[140px]">
            {user ? user.name : 'Parth Modi'}
          </span>
        </button>

      </div>

    </header>
  );
}

import React from 'react';
import { LayoutDashboard, ClipboardList, LogOut, X } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onOpenAuthModal,
  user,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inspections', label: 'Inspections', icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div>
          {/* Top Brand Logo */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-rose-600 font-black text-xl tracking-wider leading-none">
                ARVIND
              </div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none pt-1">
                LIMITED
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isAction) {
                      onOpenLogModal();
                    } else {
                      setActiveTab(item.id);
                    }
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User / Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 overflow-hidden text-left hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                {user ? user.name.charAt(0) : 'G'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-100 truncate">
                  {user ? user.name : 'Guest User'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {user ? 'Shift Supervisor' : 'Not Signed In'}
                </div>
              </div>
            </button>

            {user ? (
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition flex items-center space-x-1"
                title="Logout of supervisor session"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

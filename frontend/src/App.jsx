import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import InspectionTable from './components/InspectionTable';
import LogInspectionPanel from './components/LogInspectionPanel';
import LogInspectionModal from './components/LogInspectionModal';
import ResolveModal from './components/ResolveModal';
import SapWebhookModal from './components/SapWebhookModal';
import AuthModal from './components/AuthModal';

import {
  useInspectionsQuery,
  useSummaryQuery,
  useInspectionMutations
} from './hooks/useInspectionsQuery';
import { loginUser, request } from './utils/api';
import { getOfflineQueue, syncOfflineQueue } from './utils/offlineStorage';
import { CheckCircle2, AlertCircle, Lock, LogIn } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User Session State: Initialize directly from localStorage
  const [user, setUser] = useState(() => {
    const isLoggedOut = localStorage.getItem('arvind_logged_out');
    if (isLoggedOut === 'true') {
      return null;
    }
    const savedUserStr = localStorage.getItem('arvind_user');
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.name) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    // Default initial supervisor session
    const defaultParth = { id: 1, name: 'Parth Modi', role: 'supervisor', email: 'parth@arvind.com' };
    localStorage.setItem('arvind_user', JSON.stringify(defaultParth));
    return defaultParth;
  });

  // Network & Offline States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(getOfflineQueue().length);

  // Filters State (Default latest first: sortBy='date', sortOrder='desc')
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // TanStack Queries & Mutations
  const {
    data: listData,
    isLoading: isListLoading
  } = useInspectionsQuery(filters);

  const {
    data: summaryData,
    isLoading: isSummaryLoading
  } = useSummaryQuery();

  const {
    createMutation,
    resolveMutation,
    sapMutation,
    invalidateAll
  } = useInspectionMutations();

  // Modal Dialog States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isSapModalOpen, setIsSapModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast Feedback State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Trigger manual refresh across queries & offline sync
  const handleTriggerSync = useCallback(async () => {
    if (!navigator.onLine) {
      showToast('Device is offline. Connect to network to sync data.', 'error');
      return;
    }

    const { syncedCount, errors } = await syncOfflineQueue((endpoint, method, payload) =>
      request(endpoint, method, payload)
    );

    setPendingSyncCount(getOfflineQueue().length);

    if (syncedCount > 0) {
      showToast(`Synced ${syncedCount} offline record(s) to server successfully!`, 'success');
      invalidateAll();
    } else if (errors.length > 0) {
      showToast(`Sync warning: ${errors.length} items failed to sync`, 'error');
    } else {
      showToast('No pending offline items to sync.', 'info');
      invalidateAll();
    }
  }, [invalidateAll]);

  // Online / Offline Network Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network connected! Syncing offline queue...', 'info');
      handleTriggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Network disconnected. Operating in offline storage mode.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleTriggerSync]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      severity: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
      search: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  // Submit New Inspection
  const handleCreateInspection = async (formData) => {
    try {
      const res = await createMutation.mutateAsync(formData);
      setIsLogModalOpen(false);

      if (res.isOffline) {
        showToast(res.message, 'warning');
        setPendingSyncCount(getOfflineQueue().length);
      } else {
        showToast(`Inspection ${res.inspection.inspection_code} logged successfully!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to log inspection', 'error');
    }
  };

  // Resolve Inspection
  const handleResolveInspection = async (id, resolutionNote) => {
    try {
      const res = await resolveMutation.mutateAsync({ id, resolutionNote });
      setIsResolveModalOpen(false);
      setSelectedInspection(null);

      if (res.isOffline) {
        showToast(res.message, 'warning');
        setPendingSyncCount(getOfflineQueue().length);
      } else {
        showToast('Inspection marked as resolved!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to resolve inspection', 'error');
    }
  };

  // SAP Webhook Submission
  const handleSendSapWebhook = async (payload) => {
    try {
      const res = await sapMutation.mutateAsync(payload);
      showToast(`SAP Webhook processed! Code: ${res.inspection.inspection_code}`, 'success');
      return res;
    } catch (err) {
      showToast(err.message || 'SAP Webhook execution failed', 'error');
      throw err;
    }
  };

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const res = await loginUser(email, password);
    localStorage.removeItem('arvind_logged_out');
    localStorage.setItem('arvind_token', res.token);
    localStorage.setItem('arvind_user', JSON.stringify(res.user));
    setUser(res.user);
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.setItem('arvind_logged_out', 'true');
    localStorage.removeItem('arvind_token');
    localStorage.removeItem('arvind_user');
    setUser(null);
    showToast('Signed out. Please log in to access the dashboard.', 'info');
  };

  const inspections = listData?.inspections || [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row antialiased selection:bg-blue-500 selection:text-white font-sans relative">
      
      {/* Full-Screen Auth Guard Overlay when user is logged out */}
      {!user && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Authentication Required</h2>
              <p className="text-xs text-slate-500 mt-1">
                Please sign in as supervisor to view and manage shop-floor quality inspections.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-left space-y-0.5 font-mono">
              <div>Demo Account: <span className="text-slate-900 font-bold">parth@arvind.com</span></div>
              <div>Password: <span className="text-slate-900 font-bold">arvind123</span></div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Parth Modi</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container Layout (Blurred when logged out) */}
      <div className={`min-h-screen flex flex-col lg:flex-row w-full ${!user ? 'filter blur-xs opacity-30 pointer-events-none select-none' : ''}`}>
        
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLogModal={() => {
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              setIsLogModalOpen(true);
            }
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          user={user}
          onLogout={handleLogout}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          
          {/* Top Header */}
          <Header
            isOnline={isOnline}
            pendingSyncCount={pendingSyncCount}
            onSyncClick={handleTriggerSync}
            onOpenSapModal={() => setIsSapModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            user={user}
          />

          {/* Dashboard Body Container */}
          <main className="flex-1 p-3 sm:p-5 overflow-y-auto min-w-0">
            
            {/* Toast Notification Banner */}
            {toast && (
              <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                <div
                  className={`p-3.5 rounded-xl border shadow-md flex items-center justify-between text-xs font-semibold ${
                    toast.type === 'success'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : toast.type === 'warning'
                      ? 'bg-amber-500 text-slate-950 border-amber-600'
                      : toast.type === 'error'
                      ? 'bg-rose-600 text-white border-rose-700'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {toast.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{toast.message}</span>
                  </div>
                  <button onClick={() => setToast(null)} className="ml-2 text-current opacity-75 hover:opacity-100">
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* TAB VIEW 1: Dashboard View (Summary Cards + Table (8 cols) + Form Panel (4 cols)) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-5">
                <SummaryCards summaryData={summaryData} loading={isSummaryLoading} />

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 min-w-0">
                  <div className="xl:col-span-8 min-w-0">
                    <InspectionTable
                      inspections={inspections}
                      loading={isListLoading}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onResetFilters={handleResetFilters}
                      onResolveClick={(item) => {
                        setSelectedInspection(item);
                        setIsResolveModalOpen(true);
                      }}
                      onLogNewClick={() => setIsLogModalOpen(true)}
                      title="Recent Inspections"
                    />
                  </div>

                  <div className="hidden xl:block xl:col-span-4 min-w-0">
                    <LogInspectionPanel
                      onSubmit={handleCreateInspection}
                      submitting={createMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 2: Inspections View (Full 12-Column Table View) */}
            {activeTab === 'inspections' && (
              <div className="space-y-5">
                <SummaryCards summaryData={summaryData} loading={isSummaryLoading} />
                
                <div className="w-full">
                  <InspectionTable
                    inspections={inspections}
                    loading={isListLoading}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                    onResolveClick={(item) => {
                      setSelectedInspection(item);
                      setIsResolveModalOpen(true);
                    }}
                    onLogNewClick={() => setIsLogModalOpen(true)}
                    title="All Quality Inspections"
                  />
                </div>
              </div>
            )}

          </main>

          {/* Minimal Footer */}
          <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 px-6 mt-auto">
            <div className="flex items-center justify-between text-[11px]">
              <span>© 2026 Arvind Limited · Quality Inspection Tracker</span>
              <span>Shop-Floor Operations</span>
            </div>
          </footer>

        </div>

      </div>

      {/* Modals & Dialogs */}
      <LogInspectionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSubmit={handleCreateInspection}
        submitting={createMutation.isPending}
      />

      <ResolveModal
        inspection={selectedInspection}
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setSelectedInspection(null);
        }}
        onSubmit={handleResolveInspection}
        submitting={resolveMutation.isPending}
      />

      <SapWebhookModal
        isOpen={isSapModalOpen}
        onClose={() => setIsSapModalOpen(false)}
        onSendWebhook={handleSendSapWebhook}
        loading={sapMutation.isPending}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        user={user}
      />

    </div>
  );
}

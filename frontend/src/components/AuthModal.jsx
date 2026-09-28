import React, { useState } from 'react';
import { X, User, Lock, KeyRound } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, user, onLogout }) {
  const [email, setEmail] = useState('parth@arvind.com');
  const [password, setPassword] = useState('arvind123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Supervisor Session</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info if logged in */}
        {user ? (
          <div className="p-5 space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{user.name}</div>
              <div className="text-slate-600">Email: {user.email}</div>
              <div className="text-blue-700 font-semibold uppercase text-[10px]">Role: Shift Supervisor</div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800">Demo Supervisor Account:</span>
              <br />
              Email: <code className="font-mono bg-slate-200 px-1 rounded">parth@arvind.com</code>
              <br />
              Password: <code className="font-mono bg-slate-200 px-1 rounded">arvind123</code>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-2.5 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              {loading ? <span>Authenticating...</span> : <span>Sign In</span>}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

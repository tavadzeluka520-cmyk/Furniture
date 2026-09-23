import React, { useState } from 'react';
import { X, User as UserIcon, ShieldCheck, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenAdmin }) => {
  const { currentUser, isAdmin, login, logout } = useStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    const res = await login(email.trim(), name.trim() || undefined);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to sign in');
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    setError('');
    // Try both gamil.com / gmail.com
    const res = await login('tavadzeluka520@gamil.com', 'Luka Tavadze (Admin)');
    setLoading(false);
    if (res.success) {
      onClose();
      onOpenAdmin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/15 p-6 sm:p-8 z-10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-400">
              <UserIcon className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                {currentUser.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                {currentUser.email}
              </span>
              {isAdmin && (
                <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Authorized Administrator</span>
                </span>
              )}
            </div>

            <div className="pt-2 space-y-3">
              {isAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Launch Admin Hub</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Client & Admin Authentication</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
                Sign In to AURA
              </h2>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Julian Thorne"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Administrator Fast Verification Portal */}
            <div className="pt-4 border-t border-white/10 text-center">
              <span className="text-[11px] text-slate-500 block mb-2">
                Administrator designated account:
              </span>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-950/70 text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Sign in as tavadzeluka520@gamil.com</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

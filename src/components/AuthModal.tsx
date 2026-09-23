import React, { useState } from 'react';
import { X, User as UserIcon, ShieldCheck, LogOut, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenAdmin }) => {
  const { currentUser, isAdmin, login, logout } = useStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

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
    const res = await login('tavadzeluka520@gmail.com', 'Luka Tavadze (Admin)');
    setLoading(false);
    if (res.success) {
      onClose();
      onOpenAdmin();
    }
  };

  const handleGoogleAccountSelect = async (selectedEmail: string, selectedName: string) => {
    setLoading(true);
    setError('');
    const res = await login(selectedEmail, selectedName);
    setLoading(false);
    if (res.success) {
      setShowGoogleChooser(false);
      onClose();
      // If they chose the admin account, automatically open the Admin Hub for them!
      if (selectedEmail === 'tavadzeluka520@gmail.com') {
        onOpenAdmin();
      }
    } else {
      setError(res.error || 'Failed to authenticate via Google account');
    }
  };

  // Real accounts matching the user's screenshot exactly!
  const googleAccounts = [
    { name: 'Luka Tavadze', email: 'tavadzeluka520@gmail.com', isAdmin: true, avatarColor: 'bg-indigo-600' },
    { name: 'Luka Tavadze', email: 'tavadzeluka38@gmail.com', isAdmin: false, avatarColor: 'bg-emerald-600' },
    { name: 'Luka Tavadze', email: 'lukatavadze780@gmail.com', isAdmin: false, avatarColor: 'bg-amber-500' },
    { name: 'nikosolomonishvili@gmail.com', email: 'nikosolomonishvili@gmail.com', isAdmin: false, avatarColor: 'bg-blue-600' },
    { name: 'Luka Tavadze', email: 'tavadzeluka282@gmail.com', isAdmin: false, avatarColor: 'bg-teal-600' },
    { name: 'Beso Tavadze', email: 'tavadzebeso03@gmail.com', isAdmin: false, avatarColor: 'bg-pink-600' },
    { name: 'Asmati Guchua', email: 'asmatiguchua@gmail.com', isAdmin: false, avatarColor: 'bg-purple-600' }
  ];

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

        {showGoogleChooser ? (
          /* Google Accounts Chooser matching User's screenshot */
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-white/10">
              <div className="flex justify-center mb-1.5">
                <GoogleIcon />
              </div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Google-ით შესვლა / Sign in with Google
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                აირჩიეთ ანგარიში / Choose an account to register or sign in instantly
              </p>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {googleAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGoogleAccountSelect(acc.email, acc.name)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/20 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${acc.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                      {acc.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        <span>{acc.name}</span>
                        {acc.isAdmin && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400/30">
                            Owner Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {acc.email}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleChooser(false)}
              className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Back to Email Form
            </button>
          </div>
        ) : currentUser ? (
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

            {/* Quick 1-Click Google Login Selector based on User Screen */}
            <button
              type="button"
              onClick={() => setShowGoogleChooser(true)}
              className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.15)] active:scale-98 transition-all cursor-pointer"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-2 text-[10px] uppercase font-mono tracking-widest text-slate-500 justify-center">
              <span className="h-px bg-white/10 flex-1" />
              <span>Or sign in with email</span>
              <span className="h-px bg-white/10 flex-1" />
            </div>

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
                <span>Sign in as tavadzeluka520@gmail.com</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


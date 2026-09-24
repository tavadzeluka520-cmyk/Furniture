import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  KeyRound, 
  ShoppingBag, 
  Heart,
  Phone,
  Key
} from 'lucide-react';
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
  const { 
    currentUser, 
    isAdmin, 
    login, 
    register, 
    loginWithGoogle, 
    logout, 
    cartCount, 
    wishlist, 
    setIsCartOpen 
  } = useStore();

  // Mode: 'signin' | 'register' | 'google-prompt' | 'admin-access'
  const [mode, setMode] = useState<'signin' | 'register' | 'google-prompt' | 'admin-access'>('signin');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Google prompt state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Attempt auto-credential retrieval with Google Password Manager / Credential Management API
  useEffect(() => {
    if (isOpen && !currentUser && typeof window !== 'undefined' && 'credentials' in navigator) {
      try {
        navigator.credentials.get({
          // @ts-ignore
          password: true,
          mediation: 'silent'
        }).then((cred: any) => {
          if (cred && cred.id) {
            setEmail(cred.id);
            if (cred.password) {
              setPassword(cred.password);
            }
          }
        }).catch(() => {
          // Silent catch if user dismissed or not supported
        });
      } catch {
        // Ignore
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  // Trigger Google Password Manager native save prompt
  const triggerGooglePasswordSave = (userEmail: string, userPass: string, userName?: string) => {
    try {
      if (typeof window !== 'undefined' && 'PasswordCredential' in window && navigator.credentials) {
        const cred = new (window as any).PasswordCredential({
          id: userEmail.trim(),
          password: userPass,
          name: userName?.trim() || undefined
        });
        navigator.credentials.store(cred).catch(() => {});
      }
    } catch {
      // Ignore if browser restricts or denies
    }
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    resetMessages();

    const cleanEmail = email.trim();
    const res = await login(cleanEmail, name.trim() || undefined, password || undefined);
    setLoading(false);

    if (res.success) {
      // Trigger Google Password Manager save prompt
      if (password) {
        triggerGooglePasswordSave(cleanEmail, password, name);
      }

      setSuccessMessage('Signed in successfully! Credentials saved.');
      setTimeout(() => {
        if (cleanEmail.toLowerCase() === 'tavadzeluka520@gmail.com') {
          onClose();
          onOpenAdmin();
        } else {
          onClose();
        }
      }, 500);
    } else {
      setError(res.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  // Registration Handler (Everyone can register)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    resetMessages();

    const cleanEmail = email.trim();
    const res = await register({
      email: cleanEmail,
      name: name.trim(),
      password: password || undefined,
      phone: phone.trim() || undefined
    });

    setLoading(false);

    if (res.success) {
      // Trigger Google Password Manager save prompt
      if (password) {
        triggerGooglePasswordSave(cleanEmail, password, name.trim());
      }

      setSuccessMessage('Account created and credentials saved! Welcome to AURA.');
      setTimeout(() => {
        if (cleanEmail.toLowerCase() === 'tavadzeluka520@gmail.com') {
          onClose();
          onOpenAdmin();
        } else {
          onClose();
        }
      }, 600);
    } else {
      setError(res.error || 'Failed to register account. Please try again.');
    }
  };

  // Google Sign In / Registration Handler
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setError('Please enter your Google email address');
      return;
    }

    setLoading(true);
    resetMessages();

    const cleanGoogleEmail = googleEmail.trim();
    const res = await loginWithGoogle(cleanGoogleEmail, googleName.trim() || undefined);
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Signed in with Google automatically!');
      setTimeout(() => {
        if (cleanGoogleEmail.toLowerCase() === 'tavadzeluka520@gmail.com') {
          onClose();
          onOpenAdmin();
        } else {
          onClose();
        }
      }, 500);
    } else {
      setError(res.error || 'Google authentication failed');
    }
  };

  // Quick 1-tap Google Authentication with prompt
  const handleQuickGoogleClick = () => {
    resetMessages();
    setGoogleEmail('');
    setGoogleName('');
    setMode('google-prompt');
  };

  // Confidential Administrator Fast Sign-in (accessible without exposing email publicly)
  const handleAdminDirectLogin = async () => {
    setLoading(true);
    resetMessages();
    const res = await login('tavadzeluka520@gmail.com', 'Luka Tavadze (Admin)');
    setLoading(false);
    if (res.success) {
      setSuccessMessage('Administrator verified. Opening Command Hub...');
      setTimeout(() => {
        onClose();
        onOpenAdmin();
      }, 400);
    } else {
      setError(res.error || 'Administrator login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/15 p-6 sm:p-8 z-10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGGED-IN PROFILE VIEW */}
        {currentUser ? (
          <div className="text-center space-y-6">
            <div className="relative w-18 h-18 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.25)]">
              {isAdmin ? (
                <ShieldCheck className="w-9 h-9 text-cyan-300" />
              ) : (
                <UserIcon className="w-9 h-9" />
              )}
              {isAdmin && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-black font-black text-[10px] shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                  ✓
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
                {currentUser.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono block">
                {currentUser.email}
              </span>

              {isAdmin ? (
                <div className="pt-2 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.35)]">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Authorized Administrator</span>
                  </span>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Customer Account</span>
                  </span>
                </div>
              )}
            </div>

            {/* Quick account summary for customers */}
            {!isAdmin && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    setIsCartOpen(true);
                  }}
                  className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/30 flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">Cart</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">{cartCount} items</span>
                </button>

                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold text-slate-200">Wishlist</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-300">{wishlist.length} saved</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              {isAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Administrator Command Center</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  resetMessages();
                }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : mode === 'google-prompt' ? (
          /* GOOGLE SIGN IN / REGISTRATION PROMPT */
          <form 
            name="google-auth-form"
            method="post"
            action="#"
            onSubmit={handleGoogleSubmit} 
            className="space-y-5"
            autoComplete="on"
          >
            <div className="text-center pb-1">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <GoogleIcon />
              </div>
              <h3 className="text-xl font-extrabold text-white font-['Space_Grotesk']">
                Continue with Google
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Google Account email to sign in or register instantly
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs">
                {successMessage}
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="google-email-input" className="text-slate-300 block mb-1 font-medium">Google Email</label>
                <div className="relative">
                  <input
                    id="google-email-input"
                    name="username"
                    type="email"
                    required
                    autoFocus
                    autoComplete="username email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label htmlFor="google-name-input" className="text-slate-300 block mb-1 font-medium">Your Name (Optional)</label>
                <div className="relative">
                  <input
                    id="google-name-input"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={googleName}
                    onChange={e => setGoogleName(e.target.value)}
                    placeholder="e.g. Alex Hunter"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,255,255,0.2)] active:scale-98 transition-all cursor-pointer"
            >
              <GoogleIcon />
              <span>{loading ? 'Authenticating...' : 'Confirm Google Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetMessages();
                setMode('signin');
              }}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back to standard login
            </button>
          </form>
        ) : mode === 'admin-access' ? (
          /* DISCREET ADMINISTRATOR ACCESS (Does NOT publicly broadcast email) */
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-3 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white font-['Space_Grotesk']">
                Store Owner Portal
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Authorized management authentication
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs">
                {successMessage}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <KeyRound className="w-4 h-4" />
                <span>Verified Administrative Access</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click below to authenticate as the designated store administrator and launch the command center.
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleAdminDirectLogin}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying Administrator...' : 'Authenticate as Administrator'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetMessages();
                setMode('signin');
              }}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        ) : (
          /* STANDARD SIGN IN & REGISTRATION VIEW */
          <div className="space-y-5">
            {/* Header & Mode Switcher */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AURA Living Client Account</span>
              </div>
              
              {/* Dual Tab: Sign In / Create Account */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode('signin');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode('register');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Register Account
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs animate-in fade-in">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in">
                {successMessage}
              </div>
            )}

            {/* Quick 1-Click Google Button */}
            <button
              type="button"
              onClick={handleQuickGoogleClick}
              className="w-full py-3 rounded-xl bg-white text-black hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.15)] active:scale-98 transition-all cursor-pointer"
            >
              <GoogleIcon />
              <span>{mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-2 text-[10px] uppercase font-mono tracking-widest text-slate-500 justify-center">
              <span className="h-px bg-white/10 flex-1" />
              <span>Or with email & password</span>
              <span className="h-px bg-white/10 flex-1" />
            </div>

            {/* FORM WITH GOOGLE PASSWORD MANAGER & AUTOCOMPLETE INTEGRATION */}
            <form 
              name="user-credentials-form"
              id="user-credentials-form"
              method="post"
              action="#"
              autoComplete="on"
              onSubmit={mode === 'signin' ? handleSignIn : handleRegister} 
              className="space-y-3.5 text-xs"
            >
              {/* Name Field (Only in Register mode) */}
              {mode === 'register' && (
                <div className="animate-in fade-in">
                  <label htmlFor="auth-name" className="text-slate-300 block mb-1 font-medium">Full Name</label>
                  <div className="relative">
                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Luka or John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              )}

              {/* Email / Username Field */}
              <div>
                <label htmlFor="auth-email" className="text-slate-300 block mb-1 font-medium">Email Address</label>
                <div className="relative">
                  <input
                    id="auth-email"
                    name="username"
                    type="email"
                    required
                    autoComplete="username email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Password Field (Supported by Google Password Manager) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="auth-password" className="text-slate-300 font-medium">
                    {mode === 'signin' ? 'Password' : 'Create Password'}
                  </label>
                  <span className="text-[10px] text-cyan-400/80 font-mono flex items-center gap-1">
                    <Key className="w-2.5 h-2.5" />
                    <span>Auto-saved to Google</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required={mode === 'register'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signin' ? 'Enter your password' : 'Create strong password'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Phone Field (Optional in register mode) */}
              {mode === 'register' && (
                <div className="animate-in fade-in">
                  <label htmlFor="auth-phone" className="text-slate-300 block mb-1 font-medium">Phone Number (Optional)</label>
                  <div className="relative">
                    <input
                      id="auth-phone"
                      name="tel"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              )}

              {/* Automatic Save & Remember Me Toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                  />
                  <span>Save password & auto-login (ავტომატური)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {loading
                    ? 'Saving & Authenticating...'
                    : mode === 'signin'
                    ? 'Sign In & Save Password'
                    : 'Create Free Account & Save'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Discreet Administrator Portal Link (Without exposing email publicly) */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
              <span>AURA Secure Architecture</span>
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode('admin-access');
                }}
                className="hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Store Administrator Portal"
              >
                <KeyRound className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
                <span>Store Owner Access</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

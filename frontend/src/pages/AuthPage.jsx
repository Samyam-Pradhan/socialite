import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import React from "react";
import Navbar from "../components/Navbar";
import {
  Mail, Lock, User, Eye, EyeOff, CheckCircle,
  AlertCircle, ArrowRight, XCircle, X, Sparkles,
} from "lucide-react";

let toastId = 0;
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "success", title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
  }, []);

  return { toasts, addToast, removeToast };
}

const TOAST_CONFIG = {
  success: {
    icon: <CheckCircle size={18} />,
    bar:  "#22c55e",
    bg:   "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    border:"#86efac",
    iconColor: "#16a34a",
    titleColor:"#14532d",
    textColor: "#166534",
  },
  error: {
    icon: <XCircle size={18} />,
    bar:  "#ef4444",
    bg:   "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
    border:"#fca5a5",
    iconColor: "#dc2626",
    titleColor:"#7f1d1d",
    textColor: "#991b1b",
  },
  info: {
    icon: <Sparkles size={18} />,
    bar:  "#762EF8",
    bg:   "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
    border:"#d8b4fe",
    iconColor: "#762EF8",
    titleColor:"#3b0764",
    textColor: "#6b21a8",
  },
};

function ToastItem({ toast, onRemove }) {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.success;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        minWidth: 300,
        maxWidth: 380,
        position: "relative",
        overflow: "hidden",
        animation: toast.leaving
          ? "toastOut .35s cubic-bezier(0.4,0,1,1) forwards"
          : "toastIn .35s cubic-bezier(0,0,0.2,1) forwards",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 4, background: cfg.bar, borderRadius: "14px 0 0 14px",
      }} />

      <div style={{
        flexShrink: 0, marginTop: 1,
        color: cfg.iconColor,
        display: "flex", alignItems: "center",
      }}>
        {cfg.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontSize: 13, fontWeight: 700, color: cfg.titleColor, marginBottom: 2 }}>
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div style={{ fontSize: 12, color: cfg.textColor, lineHeight: 1.55 }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          flexShrink: 0, marginTop: 1, padding: 2, border: "none",
          background: "transparent", cursor: "pointer",
          color: cfg.textColor, opacity: 0.6,
          display: "flex", alignItems: "center",
          borderRadius: 6, transition: "opacity .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)   scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0)   scale(1);    }
          to   { opacity: 0; transform: translateX(100%) scale(0.95); }
        }
      `}</style>
      <div style={{
        position: "fixed", top: 20, right: 20, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        alignItems: "flex-end",
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const { toasts, addToast, removeToast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!isLogin) {
      if (!name) newErrors.name = "Name is required";
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const requestData = isLogin ? { email, password } : { name, email, password };
    const url = isLogin ? "http://localhost:8000/login" : "http://localhost:8000/signup";

    try {
      const res = await axios.post(url, requestData, {
        headers: { "Content-Type": "application/json" },
      });

      if (isLogin) {
        if (res.data.access_token) {
          localStorage.setItem("token", res.data.access_token);
          localStorage.setItem("token_type", res.data.token_type);
          localStorage.setItem("user_email", email);

          const nameFromEmail = email.split("@")[0];
          const formattedName = nameFromEmail
            .split(/[._-]/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          localStorage.setItem("user_name", formattedName);

          addToast({
            type: "success",
            title: "Welcome back! ",
            message: "Login successful. Redirecting you now…",
            duration: 2500,
          });

          setTimeout(() => { window.location.href = "/dashboard"; }, 1800);
        }
      } else {
        localStorage.setItem("user_name", name);
        addToast({
          type: "info",
          title: "Account created! ",
          message: "You're all set. Sign in to get started.",
          duration: 4000,
        });
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
        setName("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      addToast({
        type: "error",
        title: "Oops!",
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      {/* Toast portal */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="flex flex-col lg:flex-row">

            {/* ── Left: Form ── */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">

                {/* Brand */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Socialite
                  </h2>
                  <p className="text-gray-500 mt-2">
                    {isLogin ? "Welcome back! Please sign in to continue." : "Join our community and start connecting!"}
                  </p>
                </div>

                {/* Toggle */}
                <div className="bg-gray-100 p-1 rounded-2xl mb-8">
                  <div className="flex relative">
                    <div className={`absolute top-1 bottom-1 w-1/2 rounded-xl bg-white shadow-md transition-transform duration-300 ${isLogin ? "translate-x-0" : "translate-x-full"}`} />
                    <button
                      className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors relative z-10 ${isLogin ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                      onClick={() => { setIsLogin(true); setErrors({}); }}
                    >
                      Sign In
                    </button>
                    <button
                      className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors relative z-10 ${!isLogin ? "text-purple-600" : "text-gray-600 hover:text-gray-900"}`}
                      onClick={() => { setIsLogin(false); setErrors({}); }}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                        <input
                          type="text"
                          placeholder="John Doe"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-purple-200 focus:border-purple-400"}`}
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.name}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"}`}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"}`}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.password}
                      </p>
                    )}
                  </div>
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-purple-200 focus:border-purple-400"}`}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}
                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>
                      <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing…</span>
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? "Sign In" : "Create Account"}</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Switch */}
                  <p className="text-center text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                      className={`ml-2 font-semibold ${isLogin ? "text-blue-600 hover:text-blue-700" : "text-purple-600 hover:text-purple-700"}`}
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>

                  {/* Terms — signup only */}
                  {!isLogin && (
                    <p className="text-xs text-center text-gray-500 mt-4">
                      By signing up, you agree to our{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>{" "}and{" "}
                      <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">Privacy Policy</a>
                    </p>
                  )}
                </form>
              </div>
            </div>
            <div className="lg:w-1/2 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute inset-0" style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }} />
              </div>

              <div className="relative z-10 text-center text-white flex flex-col items-center">
                <img
                  src="https://illustrations.popsy.co/gray/work-from-home.svg"
                  alt="Authentication illustration"
                  className="w-105 h-auto mx-auto mb-10 drop-shadow-2xl"
                />
                <h2 className="text-3xl font-bold mb-4">Your World, Connected</h2>
                <p className="text-white/85 text-lg max-w-md mx-auto mb-8">
                  Socialite brings people together — share your moments, explore trending topics, and stay connected with the people who matter most.
                </p>
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  {[
                    "Connect with millions of users",
                    "Share your thoughts and moments",
                    "Discover trending topics daily",
                  ].map(f => (
                    <div key={f} className="flex items-center gap-3">
                      <CheckCircle className="text-green-300 shrink-0" size={20} />
                      <span className="text-white/90">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                {[0.4, 0.6, 0.8, 0.6, 0.4].map((o, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: `rgba(255,255,255,${o})` }} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
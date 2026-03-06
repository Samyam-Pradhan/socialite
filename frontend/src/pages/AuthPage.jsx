import { useState } from "react";
import axios from "axios";
import React from "react";
import Navbar from "../components/Navbar";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

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
      if (!name) {
        newErrors.name = "Name is required";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    const requestData = isLogin 
      ? { email, password }
      : { name, email, password };

    const url = isLogin
      ? "http://localhost:8000/login"
      : "http://localhost:8000/signup";

    try {
      const res = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (isLogin) {
        if (res.data.access_token) {
          localStorage.setItem('token', res.data.access_token);
          localStorage.setItem('token_type', res.data.token_type);
          localStorage.setItem('user_email', email);
          
          const nameFromEmail = email.split('@')[0];
          const formattedName = nameFromEmail.split(/[._-]/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          
          localStorage.setItem('user_name', formattedName);
          
          // Show success message before redirect
          alert("Login Successful! 🎉");
          window.location.href = '/dashboard';
        }
      } else {
        localStorage.setItem('user_name', name);
        alert("Account Created Successfully! 🎉");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
        setName("");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          "Something went wrong";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-6xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Side - Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                {/* Logo/Brand */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Socialite
                  </h2>
                  <p className="text-gray-500 mt-2">
                    {isLogin ? "Welcome back! Please sign in to continue." : "Join our community and start connecting!"}
                  </p>
                </div>

                {/* Toggle Buttons */}
                <div className="bg-gray-100 p-1 rounded-2xl mb-8">
                  <div className="flex relative">
                    <div 
                      className={`absolute top-1 bottom-1 w-1/2 rounded-xl bg-white shadow-md transition-transform duration-300 ${
                        isLogin ? 'translate-x-0' : 'translate-x-full'
                      }`}
                    />
                    <button
                      className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors relative z-10 ${
                        isLogin ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => {
                        setIsLogin(true);
                        setErrors({});
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors relative z-10 ${
                        !isLogin ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => {
                        setIsLogin(false);
                        setErrors({});
                      }}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field - Signup Only */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                        <input
                          type="text"
                          placeholder="John Doe"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                            errors.name 
                              ? 'border-red-300 focus:ring-red-200' 
                              : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400'
                          }`}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.email 
                            ? 'border-red-300 focus:ring-red-200' 
                            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                        }`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.password 
                            ? 'border-red-300 focus:ring-red-200' 
                            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                        }`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

                  {/* Confirm Password - Signup Only */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                            errors.confirmPassword 
                              ? 'border-red-300 focus:ring-red-200' 
                              : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400'
                          }`}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Remember Me & Forgot Password - Login Only */}
                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? "Sign In" : "Create Account"}</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Switch between forms */}
                  <p className="text-center text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrors({});
                      }}
                      className={`ml-2 font-semibold ${
                        isLogin ? 'text-blue-600 hover:text-blue-700' : 'text-purple-600 hover:text-purple-700'
                      }`}
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>

                  {/* Terms - Signup Only */}
                  {!isLogin && (
                    <p className="text-xs text-center text-gray-500 mt-4">
                      By signing up, you agree to our{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">Privacy Policy</a>
                    </p>
                  )}
                </form>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="lg:w-1/2 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full"></div>
                
                {/* Grid Pattern */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }}></div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center text-white">
                <img
                  src="https://illustrations.popsy.co/gray/work-from-home.svg"
                  alt="Authentication illustration"
                  className="w-80 h-auto mx-auto mb-8 drop-shadow-2xl"
                />
                
                <h2 className="text-3xl font-bold mb-4">
                  {isLogin ? "Welcome Back!" : "Join Our Community"}
                </h2>
                
                <p className="text-white/90 text-lg max-w-md mx-auto mb-8">
                  {isLogin 
                    ? "Connect with friends and the world around you on Socialite." 
                    : "Create your account and start sharing your moments with the world."}
                </p>

                {/* Feature List */}
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-300 shrink-0" size={20} />
                    <span className="text-white/90">Connect with millions of users</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-300 shrink-0" size={20} />
                    <span className="text-white/90">Share your thoughts and moments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-300 shrink-0" size={20} />
                    <span className="text-white/90">Discover trending topics</span>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl max-w-sm mx-auto">
                  <p className="text-sm text-white/80 italic">
                    "Socialite has completely changed how I connect with people. It's amazing!"
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">Alex Johnson</p>
                      <p className="text-xs text-white/60">@alexj</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Decoration */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
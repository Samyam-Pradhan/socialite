import { useState } from "react";
import axios from "axios";
import React from "react";
import Navbar from "../components/Navbar"; 

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      if (!name.trim()) {
        alert("Name is required!");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters long!");
        return;
      }
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

      console.log('Response:', res.data);

      if (isLogin) {
        if (res.data.access_token) {
          localStorage.setItem('token', res.data.access_token);
          localStorage.setItem('token_type', res.data.token_type);
          localStorage.setItem('user_email', email);
          
          // Format name from email (e.g., "john.doe@gmail.com" -> "John Doe")
          const nameFromEmail = email.split('@')[0];
          const formattedName = nameFromEmail.split(/[._-]/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          
          localStorage.setItem('user_name', formattedName);
          
          alert("Login Successful! 🎉");
          
          // Redirect to dashboard
          window.location.href = '/dashboard';
        } else {
          alert("Login failed: No token received");
        }
      } else {
        // Store name from signup
        localStorage.setItem('user_name', name);
        
        alert("Account Created Successfully! 🎉");
        
        // Switch to login form after successful signup
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
        setName("");
      }
    } catch (error) {
      console.error('Error details:', error);
      
      if (error.response) {
        alert(error.response.data?.detail || error.response.data?.message || "Something went wrong");
      } else if (error.request) {
        alert("No response from server. Please check if the backend is running.");
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">

      <Navbar />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <div className="flex flex-1 flex-col lg:flex-row m-4 lg:m-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 min-h-[calc(100vh-120px)]">

        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Toggle Switch */}
            <div className="mb-8">
              <div className="bg-gray-100 p-1 rounded-2xl inline-flex relative">
                <button
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isLogin 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    setIsLogin(true);
                    setName("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Login
                </button>
                <button
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    !isLogin 
                      ? 'bg-white text-purple-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    setIsLogin(false);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? "Welcome Back!" : "Create Your Account"}
            </h1>
            <p className="text-gray-500 mb-8">
              {isLogin 
                ? "Please enter your details to sign in." 
                : "Get started with your free account today."}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field - only for signup */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isLogin 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            {/* Switch between Login/Signup */}
            <p className="mt-6 text-center text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setName("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className={`ml-2 font-semibold ${
                  isLogin ? 'text-blue-600 hover:text-blue-700' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>

            {/* Terms */}
            {!isLogin && (
              <p className="mt-6 text-xs text-center text-gray-500">
                By signing up, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - ILLUSTRATION */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex-col items-center justify-center relative overflow-hidden">
          {/* Animated circles */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full"></div>
          </div>

          {/* Illustration */}
          <div className="relative z-10 text-center">
            <img
              src="https://illustrations.popsy.co/gray/work-from-home.svg"
              alt="Authentication illustration"
              className="w-96 h-auto mb-8 drop-shadow-2xl"
            />
            
            <h2 className="text-white text-3xl font-bold mb-4">
              {isLogin ? "Welcome Back!" : "Join Our Community"}
            </h2>
            
            <p className="text-white/80 text-lg max-w-md">
              {isLogin 
                ? "Access your account and continue your journey with us." 
                : "Create an account and unlock amazing features tailored just for you."}
            </p>
            
            {/* Decorative elements */}
            <div className="flex gap-2 justify-center mt-8">
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
  );
}

export default AuthPage;
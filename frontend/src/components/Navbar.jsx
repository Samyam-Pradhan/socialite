import React from "react";
import { Feather } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="shrink-0 flex items-center gap-3">
            {/* Feather Icon exactly like Dashboard */}
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Feather size={16} className="text-white" />
            </div>
            <a href="#" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Socialite
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            {["About", "Features", "Privacy & Security", "Help Center"].map((link) => (
              <a
                key={link}
                href="#"
                className="relative text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors duration-300 group"
              >
                {link}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
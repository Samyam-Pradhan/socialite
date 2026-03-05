import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="shrink-0">
            <a href="#" className="text-2xl font-black text-gray-900 tracking-tighter">
              Socia<span className="text-[#A24BFB]">Lite</span>
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            {["About", "Features", "Privacy & Security", "Help Center"].map((link) => (
              <a
                key={link}
                href="#"
                className="relative text-sm font-semibold text-gray-500 hover:text-[#A24BFB] transition-colors duration-300 group"
              >
                {link}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#A24BFB] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
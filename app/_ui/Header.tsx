"use client";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, RefObject } from "react";
import useAuth from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useOnclickOutside } from "@/hooks/useOnclickOutside";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const { user, loading } = useUser();
  const router = useRouter();


  useOnclickOutside(dropdownRef as RefObject<HTMLDivElement>, () => setIsDropdownOpen(false));

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="w-full h-16 bg-white border-b border-gray-200 shadow-sm">
        <div className="h-full px-6 flex items-center justify-end">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="w-full h-16 bg-white shadow-sm">
      <div className="h-full px-6 flex items-center justify-end">
        <div className="relative" ref={dropdownRef}>
          {/* User Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-800">
                {user.name}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => router.push("/profile")}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <User size={18} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
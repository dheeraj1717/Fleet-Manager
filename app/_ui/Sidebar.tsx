"use client";

import {
  Briefcase,
  ChevronLeft,
  Home,
  IdCard,
  Receipt,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menu = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Invoices", icon: Receipt, path: "/invoices" },
  { name: "Vehicles", icon: Truck, path: "/vehicles" },
  { name: "Drivers", icon: IdCard, path: "/drivers" },
  { name: "Jobs", icon: Briefcase, path: "/jobs" },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-12" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-2 border-b border-gray-200">
        <h1
          className={`font-bold text-xl text-gray-800 transition-opacity duration-200 pl-2 ${
            isCollapsed ? "hidden w-0" : "opacity-100"
          }`}
        >
          Fleet Manager
        </h1>
        <button
          onClick={handleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            size={20}
            className={`text-gray-600 transition-transform duration-300 cursor-pointer ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              href={item.path}
              key={item.path}
              className={`flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group ${isCollapsed ? "" : "px-3"} ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 ${
                  isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-900"
                }`}
              />
              <span
                className={`font-medium text-sm transition-opacity duration-200 ${
                  isCollapsed ? "opacity-0 w-0" : "opacity-100"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
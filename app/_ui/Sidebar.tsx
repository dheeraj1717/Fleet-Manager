"use client";

import {
  Briefcase,
  ChevronRight,
  Home,
  IdCard,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const menu = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Vehicles", icon: Truck, path: "/vehicles" },
  { name: "Drivers", icon: IdCard, path: "/drivers" },
  { name: "Jobs", icon: Briefcase, path: "/jobs" },
];
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    //close sidebar when size is less than 768px
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  return (
    <div className={`border-r z-50 border-[#c9c9c9] min-h-screen py-4 shadow-md relative ${isCollapsed ? "w-[50px]" : "w-[250px]"}`}>
      <div className="absolute right-2 top-4 cursor-pointer text-lg">{isCollapsed ? <ChevronRight onClick={handleCollapse} /> : <ChevronRight className="rotate-180" onClick={handleCollapse} />}</div>
      <div className="flex flex-col">
        <div className="flex justify-center items-center">
          <span className={`text-xl font-semibold ${isCollapsed ? "hidden" : ""}`}>Fleet Manager</span>
        </div>
        <div className="flex flex-col gap-1 mt-5">
          {menu.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link
                href={m.path}
                key={i}
                className="flex gap-2 items-center hover:bg-gray-50 px-4 py-2 cursor-pointer transition-colors delay-100 text-lg text-gray-500 hover:text-[#327df4]"
              >
                {Icon && <Icon size={20}/>}
                  <span className={`${isCollapsed ? "hidden" : ""}`}>{m.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

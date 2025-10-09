"use client";
import { useState } from "react";
import Login from "../_components/Login";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full py-3 bg-white border-b border-[#c9c9c9] shadow-sm">
        <button  onClick={() => setIsOpen(true)}>Login</button>
        {isOpen && <Login setIsOpen={setIsOpen}/>}
    </div>
  )
}

export default Header
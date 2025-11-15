import Sidebar from "../_ui/Sidebar";
import Header from "../_ui/Header";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 🔐 Server-side check
  const loggedIn = isAuthenticated();

  if (!loggedIn) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Header />
        <div className="p-2 w-full">{children}</div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./_ui/Sidebar";

export const metadata: Metadata = {
  title: "Fleet Manager",
  description: "Created to manage your fleet of vehicles and drivers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="flex">
          <Sidebar />
          <div className="p-2 w-full">{children}</div>
        </div>
      </body>
    </html>
  );
}

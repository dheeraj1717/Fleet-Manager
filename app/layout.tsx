import type { Metadata } from "next";
import './globals.css'

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
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import Navbar from "@/components/Navbar";
import CartCookieSyncer from "@/components/CartCookieSyncer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <CartCookieSyncer />
        {children}
      </body>
    </html>
  );
}
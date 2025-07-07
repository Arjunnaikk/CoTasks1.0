import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { ProvidersQuery } from "./providersquery";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "CoTask - Collaborate. Manage. Succeed.",
  description: " A collaborative task management platform to streamline team workflows and boost productivity.",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <Providers>
        <ProvidersQuery>
          <Navbar />
          <div className="flex flex-row">
            <Sidebar />
            {children}
            <Toaster />
          </div>
        </ProvidersQuery>
        </Providers>
      </body>
    </html>
  );
}

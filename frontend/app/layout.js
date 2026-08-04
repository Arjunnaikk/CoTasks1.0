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
    <html lang="en" className="h-screen overflow-hidden">
      <body
        className="antialiased bg-zinc-950 bg-grid-pattern h-screen overflow-hidden text-zinc-100 selection:bg-white selection:text-black font-sans flex flex-col"
      >
        <Providers>
        <ProvidersQuery>
          <Navbar />
          <div className="flex flex-row flex-1 overflow-hidden w-full min-w-0">
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

import "./globals.css";
import { Suspense } from "react";
import HistoryNavigation from "@/components/HistoryNavigation";
import Providers from "@/components/Providers";
import SettingsLoader from "@/components/SettingsLoader";

export const metadata = {
  title: "Content Creator Nexus",
  description: "Creator productivity platform for planning, publishing, and growth.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SettingsLoader />
          <Suspense fallback={null}>
            <HistoryNavigation />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}

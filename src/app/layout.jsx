"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import SettingsLoader from "@/components/SettingsLoader";

export default function RootLayout({ children, session }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <SettingsLoader />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

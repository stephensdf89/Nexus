export const dynamic = "force-dynamic";

import "./globals.css";
import SettingsLoader from "@/components/SettingsLoader";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SettingsLoader />
        {children}
      </body>
    </html>
  );
}

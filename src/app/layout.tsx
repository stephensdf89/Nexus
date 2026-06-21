export const dynamic = "force-dynamic";

import "./globals.css";

export default function RootLayout({ children }: { children: import("react").ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
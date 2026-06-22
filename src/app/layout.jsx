import "./globals.css";
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
          {children}
        </Providers>
      </body>
    </html>
  );
}

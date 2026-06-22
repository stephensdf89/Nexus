export const dynamic = "force-dynamic";

import "./globals.css";
import AccessibilityLoader from "@/components/AccessibilityLoader";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-transparent text-white antialiased">
        <AccessibilityLoader />

        <a
          href="#app-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-cyan-500 focus:text-slate-950 focus:px-3 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>

        <header className="border-b border-cyan-400/20 bg-slate-950/35 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="inline-flex items-center gap-3 text-lg font-bold tracking-wide">
              <img
                src="/logo.png"
                alt="Nexus logo"
                width="36"
                height="36"
                className="h-9 w-9 rounded-md ring-1 ring-cyan-300/35"
              />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-violet-300 bg-clip-text text-transparent">
                Creator Nexus
              </span>
            </a>
            <nav aria-label="Global" className="flex items-center gap-4 text-sm">
              <a href="/dashboard" className="hover:text-cyan-300 transition-colors">
                Dashboard
              </a>
              <a href="/analytics" className="hover:text-cyan-300 transition-colors">
                Analytics
              </a>
              <a href="/settings" className="hover:text-cyan-300 transition-colors">
                Settings
              </a>
            </nav>
          </div>
        </header>

        <main id="app-content" className="mx-auto w-full max-w-7xl px-4 py-6">
          {children}
        </main>

        <footer className="mt-auto border-t border-cyan-400/20 bg-slate-950/30">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 text-xs text-gray-300">
            <div className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Nexus mark" width="20" height="20" className="h-5 w-5 rounded-sm" />
              <p>© {new Date().getFullYear()} Creator Nexus</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

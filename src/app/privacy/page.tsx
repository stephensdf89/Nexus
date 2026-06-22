export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-3xl mx-auto bg-slate-800/40 border border-cyan-500/30 rounded-xl p-8 backdrop-blur-sm">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Privacy Policy</h1>
        <p className="mb-6 text-gray-200">
          Content Creator Nexus (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates this website and
          provides tools for creators to manage and analyze their social media
          presence. This Privacy Policy explains how we collect, use, and protect
          your information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-cyan-400">Information We Collect</h2>
        <p className="mb-6 text-gray-200">
          We may collect basic profile information from social login providers
          such as Facebook, Instagram, TikTok, Twitter, Discord, and Twitch. This
          may include your name, profile picture, and platform-specific user ID.
          We do not collect passwords.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-cyan-400">How We Use Information</h2>
        <p className="mb-6 text-gray-200">
          Information is used solely to authenticate your account, personalize
          your experience, and provide creator analytics features. We do not sell
          or share your data with third parties.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-cyan-400">Data Security</h2>
        <p className="mb-6 text-gray-200">
          We use industry-standard security practices to protect your information.
          Authentication is handled through secure OAuth providers.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-cyan-400">Contact</h2>
        <p className="text-gray-200">
          If you have questions about this Privacy Policy, contact us at:
        </p>
      </div>
    </main>
  );
}

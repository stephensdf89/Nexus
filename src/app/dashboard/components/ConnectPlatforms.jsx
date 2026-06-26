"use client";

export default function ConnectPlatforms() {
  const platforms = [
    "instagram",
    "tiktok",
    "youtube",
    "facebook",
    "linkedin",
    "x"
  ];

  return (
    <div>
      <h2>Connect Platforms</h2>
      {platforms.map((p) => (
        <div key={p}>
          <a href={`/api/postpulse/connect?platform=${p}`}>
            Connect {p.toUpperCase()}
          </a>
        </div>
      ))}
    </div>
  );
}

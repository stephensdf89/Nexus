"use client";

import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import EditProfileModal from "@/components/EditProfileModal";
import { TwitterIcon, InstagramIcon } from "@/components/icons/SocialIcons";
import { useUser } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getSupabaseClient } from "@/lib/supabaseClient";
import uploadProfilePhoto from "@/lib/uploadProfilePhoto";
import { saveProfilePhotoToDB } from "@/lib/uploadProfilePhoto";
import enhanceImage from "@/utils/enhanceImage";

const TAB_OPTIONS = ["posts", "drafts", "saved", "analytics"];

const SOCIAL_HOSTS = {
  instagram: "https://instagram.com/",
  twitter: "https://twitter.com/",
  x: "https://x.com/",
  youtube: "https://youtube.com/@",
  tiktok: "https://www.tiktok.com/@",
  twitch: "https://www.twitch.tv/",
  linkedin: "https://www.linkedin.com/in/",
  facebook: "https://www.facebook.com/",
  pinterest: "https://www.pinterest.com/",
};

const iconStyle =
  "text-gray-400 hover:text-red-500 transition drop-shadow-[0_0_6px_rgba(255,0,0,0.6)] hover:drop-shadow-[0_0_12px_rgba(255,0,0,0.9)]";

function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function formatHandle(value) {
  if (!value) {
    return null;
  }

  return String(value).replace(/^@+/, "").trim() || null;
}

function makeUsername(displayName, email, metadataUsername) {
  if (metadataUsername) {
    return metadataUsername.startsWith("@") ? metadataUsername : `@${metadataUsername}`;
  }

  const fallback = displayName || email?.split("@")[0] || "creator";
  const slug = fallback
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `@${slug || "creator"}`;
}

function titleCase(value) {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function buildSocialLink(integration) {
  const provider = integration.provider || integration.platform || "platform";
  const handle = formatHandle(
    integration.page_name || integration.username || integration.account_name || integration.platform_id
  );
  const hrefBase = SOCIAL_HOSTS[provider];
  const href = handle && hrefBase ? `${hrefBase}${handle}` : null;

  return {
    id: integration.id || `${provider}-${handle || "link"}`,
    provider,
    label: titleCase(provider),
    handle: handle ? `@${handle}` : "Connected",
    href,
  };
}

function readAccessToken() {
  if (typeof document === "undefined") {
    return "";
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("sb-access-token="));

  return cookie ? decodeURIComponent(cookie.split("=")[1] || "") : "";
}

function EmptyState({ title, copy }) {
  return (
    <div className="rounded-2xl border border-dashed border-red-500/30 bg-black/40 p-8 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-zinc-400">{copy}</p>
    </div>
  );
}

function ProfileContent() {
  const authContext = useUser();
  const user = authContext?.user;

  const [profile, setProfile] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [profileSettings, setProfileSettings] = useState({ twitter: "", instagram: "" });
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [autoEnhance, setAutoEnhance] = useState(true);

  async function loadProfile() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (data) {
      setProfile(data);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadProfile();
    });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);

      const supabase = getSupabaseClient();
      const authMetadata = user.user_metadata || {};
      const displayName = authMetadata.display_name || user.email?.split("@")[0] || "Creator";

      const settingsPromise = supabase
        ? supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null });

      const integrationsPromise = supabase
        ? supabase.from("integrations").select("*").eq("user_id", user.id)
        : Promise.resolve({ data: [] });

      const scheduledPostsPromise = fetch("/api/content/scheduled", {
        headers: {
          "x-user-id": user.id || "",
          "x-user-email": user.email || "",
        },
      })
        .then(async (response) => (response.ok ? response.json() : { scheduled_posts: [] }))
        .catch(() => ({ scheduled_posts: [] }));

      const analyticsPromise = fetch("/api/analytics/summary")
        .then(async (response) => (response.ok ? response.json() : null))
        .catch(() => null);

      const settingsApiPromise = fetch("/api/settings", {
        credentials: "include",
        headers: readAccessToken() ? { "x-supabase-auth": readAccessToken() } : {},
      })
        .then(async (response) => {
          if (!response.ok) {
            return {};
          }

          const payload = await response.json();
          return payload?.settings ?? {};
        })
        .catch(() => ({}));

      const [settingsResult, integrationsResult, scheduledResult, analyticsResult, settingsApiResult] = await Promise.all([
        settingsPromise,
        integrationsPromise,
        scheduledPostsPromise,
        analyticsPromise,
        settingsApiPromise,
      ]);

      if (cancelled) {
        return;
      }

      const connectedIntegrations = Array.isArray(integrationsResult?.data) ? integrationsResult.data : [];
      const settings = settingsResult?.data || null;
      const persistedProfileSettings = settingsApiResult && typeof settingsApiResult === "object" ? settingsApiResult : {};
      const persistedDisplayName = persistedProfileSettings.displayName || authMetadata.display_name;
      const persistedUsername = persistedProfileSettings.username || authMetadata.username;
      const fallbackBio = connectedIntegrations.length
        ? `Building momentum across ${connectedIntegrations.map((item) => titleCase(item.provider || item.platform)).join(", ")}.`
        : "Creator profile loading. Connect platforms and publish content to make this page yours.";
      const persistedAvatarUrl = persistedProfileSettings.avatarUrl || null;

      setProfile({
        displayName: persistedDisplayName || displayName,
        username: makeUsername(persistedDisplayName || displayName, user.email, persistedUsername),
        avatar_url: persistedAvatarUrl || authMetadata.avatar_url || authMetadata.picture || null,
        bio: persistedProfileSettings.bio || settings?.bio || authMetadata.bio || fallbackBio,
        region: settings?.region || "Global",
        language: settings?.language || "en",
      });
      setProfileSettings({
        twitter: persistedProfileSettings.twitter || "",
        instagram: persistedProfileSettings.instagram || "",
      });
      setIntegrations(connectedIntegrations);
      setScheduledPosts(Array.isArray(scheduledResult?.scheduled_posts) ? scheduledResult.scheduled_posts : []);
      setAnalyticsSummary(analyticsResult);
      setLoading(false);
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || loading || !profile) {
    return (
      <AppShell contentClassName="flex-1 px-6 py-16 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center rounded-3xl border border-red-500/20 bg-black/50 px-6 py-20 text-zinc-300 shadow-[0_0_40px_rgba(255,0,0,0.12)]">
          Loading profile...
        </div>
      </AppShell>
    );
  }

  const socialLinks = [
    ...integrations.map(buildSocialLink),
    ...(profileSettings.twitter
      ? [{ id: "profile-twitter", provider: "twitter", label: "Twitter", handle: `@${formatHandle(profileSettings.twitter)}`, href: `${SOCIAL_HOSTS.twitter}${formatHandle(profileSettings.twitter)}` }]
      : []),
    ...(profileSettings.instagram
      ? [{ id: "profile-instagram", provider: "instagram", label: "Instagram", handle: `@${formatHandle(profileSettings.instagram)}`, href: `${SOCIAL_HOSTS.instagram}${formatHandle(profileSettings.instagram)}` }]
      : []),
  ].filter((link, index, array) => array.findIndex((item) => item.id === link.id || (item.provider === link.provider && item.handle === link.handle)) === index);
  const engagementRate = analyticsSummary?.totalViews
    ? `${((analyticsSummary.totalEngagement / analyticsSummary.totalViews) * 100).toFixed(1)}%`
    : "Pending";
  const followersCount = formatNumber(analyticsSummary?.totalFollowers ?? null);
  const followingCount = socialLinks.length ? formatNumber(socialLinks.length) : "--";
  const postsCount = formatNumber(scheduledPosts.length);

  const handleSaveProfile = async (values) => {
    if (!user) {
      return;
    }

    setIsSavingProfile(true);
    setSaveError("");

    try {
      const accessToken = readAccessToken();
      const headers = { "Content-Type": "application/json" };
      const preview = values.avatarUrl;
      let finalImage = preview;
      let uploadedAvatarUrl = null;

      if (preview && preview.startsWith("data:image")) {
        if (autoEnhance) {
          finalImage = await enhanceImage(preview);
        }
        uploadedAvatarUrl = await uploadProfilePhoto(finalImage, user.id);

        if (uploadedAvatarUrl) {
          await saveProfilePhotoToDB(user.id, uploadedAvatarUrl);
        }
      }

      const settingsPayload = {
        displayName: values.displayName,
        username: values.username,
        bio: values.bio,
        twitter: values.twitter,
        instagram: values.instagram,
        avatarUrl: uploadedAvatarUrl || finalImage || "",
      };

      if (accessToken) {
        headers["x-supabase-auth"] = accessToken;
      }

      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ settings: settingsPayload }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile settings");
      }

      setProfile((current) => ({
        ...current,
        displayName: values.displayName || current.displayName,
        username: makeUsername(values.displayName || current.displayName, user.email, values.username),
        bio: values.bio || current.bio,
        avatar_url: uploadedAvatarUrl || finalImage || current.avatar_url,
      }));
      setProfileSettings({
        twitter: values.twitter || "",
        instagram: values.instagram || "",
      });
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save profile settings");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <AppShell contentClassName="flex-1 px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-500/30 bg-[radial-gradient(circle_at_top_left,_rgba(255,0,38,0.18),_transparent_32%),linear-gradient(180deg,rgba(10,10,10,0.98),rgba(0,0,0,0.96))] p-8 text-white shadow-[0_0_55px_rgba(255,0,0,0.14)]">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar_url || "/defaultpfp.png"}
            alt="Profile"
            className="h-28 w-28 rounded-full border-4 border-red-600 object-cover shadow-[0_0_20px_rgba(255,0,0,0.5)]"
          />

          <div>
            <h1 className="text-3xl font-bold">{profile.displayName || "Creator"}</h1>
            <p className="text-gray-400">@{profile.username}</p>
            <p className="mt-2 max-w-xl">{profile.bio}</p>

            <div className="flex gap-4 mt-4">
              {profile.twitter && (
                <a
                  href={`https://twitter.com/${profile.twitter}`}
                  target="_blank"
                  className={iconStyle}
                >
                  <TwitterIcon className="w-6 h-6" />
                </a>
              )}

              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  className={iconStyle}
                >
                  <InstagramIcon className="w-6 h-6" />
                </a>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 transition hover:bg-red-700"
              >
                Edit Profile
              </button>

              {profile.twitter && (
                <a href={`https://twitter.com/${profile.twitter}`} className="text-red-500">
                  Twitter
                </a>
              )}

              {socialLinks.length > 0 ? (
                socialLinks.map((link) => (
                  link.href ? (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-red-500/40 bg-black/40 px-3 py-2 text-sm text-gray-200 transition hover:border-red-400 hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <span
                      key={link.id}
                      className="rounded-md border border-red-500/40 bg-black/40 px-3 py-2 text-sm text-gray-200"
                    >
                      {link.label}
                    </span>
                  )
                ))
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap gap-6 text-center md:gap-10">
          <div>
            <p className="text-2xl font-bold">{followersCount}</p>
            <p className="text-sm text-gray-400">Followers</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{followingCount}</p>
            <p className="text-sm text-gray-400">Following</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{postsCount}</p>
            <p className="text-sm text-gray-400">Posts</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{engagementRate}</p>
            <p className="text-sm text-gray-400">Engagement score</p>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-black/35 p-6">
          <div className="mb-6 flex flex-wrap gap-3 border-b border-red-500/20 pb-4">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-2 capitalize transition ${
                  activeTab === tab
                    ? "bg-red-600 text-white shadow-[0_0_18px_rgba(255,0,0,0.24)]"
                    : "bg-black/40 text-gray-400 hover:bg-red-950/60 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "posts" ? (
              <EmptyState
                title="Published posts will appear here"
                copy="This profile layout is ready for a live post feed. Connect your publishing pipeline or social sync to populate the public-facing grid."
              />
            ) : null}

            {activeTab === "drafts" ? (
              scheduledPosts.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {scheduledPosts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-2xl border border-red-500/20 bg-black/45 p-5 shadow-[0_0_24px_rgba(255,0,0,0.08)]"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {(post.platforms || []).map((platform) => (
                          <span
                            key={`${post.id}-${platform}`}
                            className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-red-200"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-base leading-7 text-zinc-200">{post.content}</p>
                      <div className="mt-5 flex items-center justify-between text-sm text-zinc-400">
                        <span>{titleCase(post.status || "draft")}</span>
                        <span>{new Date(post.scheduled_time).toLocaleString()}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No drafts in the queue"
                  copy="Your scheduled content and in-progress ideas will show up here once you start planning posts."
                />
              )
            ) : null}

            {activeTab === "saved" ? (
              <EmptyState
                title="Saved inspiration is coming next"
                copy="Use this tab for bookmarked concepts, competitor references, and hooks worth revisiting. The slot is ready for the next backend pass."
              />
            ) : null}

            {activeTab === "analytics" ? (
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                <article className="rounded-2xl border border-red-500/20 bg-black/45 p-5 shadow-[0_0_24px_rgba(255,0,0,0.08)]">
                  <p className="text-xs uppercase tracking-[0.28em] text-red-300/70">Analytics Placeholder</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">Post-level performance will land here</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                    Use this surface for top-performing posts, saves, click-through rate, and conversion snapshots once the profile analytics model is wired in.
                  </p>
                </article>

                <article className="rounded-2xl border border-red-500/20 bg-black/45 p-5 shadow-[0_0_24px_rgba(255,0,0,0.08)]">
                  <p className="text-sm text-zinc-400">Current audience sync</p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {formatNumber(analyticsSummary?.totalFollowers ?? null)}
                  </p>
                  <p className="mt-2 text-sm text-red-200">followers tracked across connected analytics</p>
                  <div className="mt-6 rounded-2xl border border-dashed border-red-500/25 bg-black/40 p-4 text-sm text-zinc-400">
                    Engagement score: {engagementRate}
                  </div>
                </article>
              </div>
            ) : null}
          </div>
        </div>

        <EditProfileModal
          isOpen={isEditing}
          onClose={() => {
            if (isSavingProfile) {
              return;
            }
            setSaveError("");
            setIsEditing(false);
          }}
          initialValues={{
            displayName: profile.displayName,
            username: profile.username,
            bio: profile.bio,
            twitter: profileSettings.twitter,
            instagram: profileSettings.instagram,
          }}
          onSave={handleSaveProfile}
          isSaving={isSavingProfile}
          error={saveError}
          autoEnhance={autoEnhance}
          setAutoEnhance={setAutoEnhance}
        />
      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
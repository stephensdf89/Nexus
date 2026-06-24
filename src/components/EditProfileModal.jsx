"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import enhanceImage from "@/utils/enhanceImage";
import { supabase } from "@/lib/supabase";
import uploadProfilePhoto, { saveProfileFields } from "@/lib/uploadProfilePhoto";
import { detectPlatform, extractHandle, fetchInstagramMeta, fetchTwitterMeta, validateSocial } from "@/lib/socialValidation";

let usernameCheckTimeout;

const icons = {
  twitter: "🐦",
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
};

export default function EditProfileModal({
  isOpen,
  onClose,
  initialValues,
  isSaving = false,
  error = "",
  autoEnhance = false,
  setAutoEnhance = () => {},
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [bio, setBio] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [socialStatus, setSocialStatus] = useState({
    twitter: null,
    instagram: null,
  });
  const [socialPreview, setSocialPreview] = useState({
    twitter: null,
    instagram: null,
  });
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  function generateUsernameSuggestions(base) {
    const clean = base.toLowerCase().replace(/[^a-z0-9]/g, "");
    const adjectives = ["cosmic", "neon", "chaotic", "digital", "shadow", "crimson"];

    const endings = [
      "official",
      "real",
      "hq",
      "creator",
      "tv",
      "online",
      "studio",
      "live",
      Math.floor(Math.random() * 9999),
      Math.floor(Math.random() * 99999),
    ];

    const suggestions = [];

    for (let i = 0; i < 6; i++) {
      const ending = endings[Math.floor(Math.random() * endings.length)];
      suggestions.push(`${adjectives[i]}${clean}${ending}`);
    }

    return suggestions;
  }

  async function checkUsernameAvailability(value) {
    clearTimeout(usernameCheckTimeout);

    setCheckingUsername(true);

    usernameCheckTimeout = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", value)
        .maybeSingle();

      // If no user found OR the username belongs to the current user -> available
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!data || data.id === user.id) {
        setUsernameAvailable(true);
        setSuggestions([]);
      } else {
        setUsernameAvailable(false);
        setSuggestions(generateUsernameSuggestions(value));
      }

      setCheckingUsername(false);
    }, 400); // debounce delay
  }

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!data) {
      return;
    }

    setName(data.name || "");
    setUsername(data.username || "");
    setBio(data.bio || "");
    setTwitter(data.twitter || "");
    setInstagram(data.instagram || "");
    setPreview(data.avatar_url || null);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(initialValues?.displayName || "");
    setUsername((initialValues?.username || "").replace(/^@+/, ""));
    setBio(initialValues?.bio || "");
    setTwitter(initialValues?.twitter || "");
    setInstagram(initialValues?.instagram || "");
    setPreview(initialValues?.avatarUrl || null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropper(false);
    loadProfile();
  }, [initialValues, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCropper(true);
  };

  const saveProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    let finalImage = preview;

    // If user uploaded a new image
    if (preview && preview.startsWith("data:image")) {
      finalImage = await enhanceImage(preview);
      const uploadedUrl = await uploadProfilePhoto(finalImage, user.id);

      if (uploadedUrl) {
        await saveProfileFields(user.id, { avatar_url: uploadedUrl });
      }
    }

    // Save text fields
    await saveProfileFields(user.id, {
      name,
      username,
      bio,
      twitter: extractHandle(twitter, "twitter"),
      instagram: extractHandle(instagram, "instagram"),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm md:items-center md:p-6">
      <div className="my-4 w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-red-600 bg-[#111] p-8 shadow-[0_0_25px_rgba(255,0,0,0.4)] md:max-h-[calc(100vh-3rem)]">
        <h2 className="mb-6 text-2xl font-bold text-white">Edit Profile</h2>

        <div className="mb-6">
          <p className="mb-2 text-gray-300">Profile Photo</p>

          <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.3)] transition hover:bg-red-600/10">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                className="h-24 w-24 rounded-full border-4 border-red-600 object-cover shadow-[0_0_20px_rgba(255,0,0,0.5)]"
              />
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-lg">Drag & Drop</p>
                <p className="text-sm">or click to upload</p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

        </div>

        <label className="mb-4 block">
          <p className="mb-1 text-gray-300">Display Name</p>
          <input
            className="w-full rounded border border-gray-700 bg-black p-2 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <p className="text-gray-300 mb-1">Username</p>
          <input
            className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            value={username}
            onChange={(e) => {
              const value = e.target.value.toLowerCase().replace(/\s+/g, "");
              setUsername(value);
              checkUsernameAvailability(value);
            }}
          />

          {/* Status */}
          {checkingUsername && (
            <p className="text-gray-400 text-sm mt-1">Checking…</p>
          )}

          {usernameAvailable === true && !checkingUsername && (
            <p className="text-green-500 text-sm mt-1">Available</p>
          )}

          {usernameAvailable === false && !checkingUsername && (
            <p className="text-red-500 text-sm mt-1">Username is taken</p>
          )}

          {usernameAvailable === false && suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-gray-300 mb-2">Suggestions:</p>

              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setUsername(s);
                      checkUsernameAvailability(s);
                    }}
                    className="px-3 py-1 bg-red-600/20 border border-red-600 rounded-md text-red-400 hover:bg-red-600/40 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </label>

        <label className="mb-4 block">
          <p className="mb-1 text-gray-300">Bio</p>
          <textarea
            className="h-24 w-full rounded border border-gray-700 bg-black p-2 text-white"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <p className="text-gray-300 mb-1">Twitter</p>

          <div className="flex items-center gap-2">
            <span className="text-xl">{icons.twitter}</span>

            <input
              className="w-full p-2 rounded bg-black border border-gray-700 text-white"
              value={twitter}
              onChange={(e) => {
                const value = e.target.value;
                setTwitter(value);

                const platform = detectPlatform(value);
                const valid = validateSocial(value, platform);
                const handle = extractHandle(value, platform);

                setSocialStatus((prev) => ({
                  ...prev,
                  twitter: valid ? "valid" : "invalid",
                }));

                if (valid) {
                  fetchTwitterMeta(handle).then((img) => {
                    setSocialPreview((prev) => ({
                      ...prev,
                      twitter: img,
                    }));
                  });
                }
              }}
            />
          </div>

          {socialStatus.twitter === "valid" && (
            <p className="text-green-500 text-sm mt-1">Valid Twitter link</p>
          )}

          {socialStatus.twitter === "invalid" && twitter.length > 0 && (
            <p className="text-red-500 text-sm mt-1">Invalid Twitter link</p>
          )}

          {socialPreview.twitter && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-black/40 border border-red-600 rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.3)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={socialPreview.twitter}
                alt="Twitter profile preview"
                className="w-12 h-12 rounded-full border border-red-600"
              />
              <div>
                <p className="text-white font-semibold">@{extractHandle(twitter, "twitter")}</p>
                <p className="text-red-400 text-sm">Twitter</p>
              </div>
            </div>
          )}
        </label>

        <label className="block mb-4">
          <p className="text-gray-300 mb-1">Instagram</p>

          <div className="flex items-center gap-2">
            <span className="text-xl">{icons.instagram}</span>

            <input
              className="w-full p-2 rounded bg-black border border-gray-700 text-white"
              value={instagram}
              onChange={(e) => {
                const value = e.target.value;
                setInstagram(value);

                const platform = detectPlatform(value);
                const valid = platform === "instagram" && validateSocial(value, platform);
                const handle = extractHandle(value, platform);

                setSocialStatus((prev) => ({
                  ...prev,
                  instagram: valid ? "valid" : "invalid",
                }));

                if (valid) {
                  fetchInstagramMeta(handle).then((img) => {
                    setSocialPreview((prev) => ({
                      ...prev,
                      instagram: img,
                    }));
                  });
                }
              }}
            />
          </div>

          {socialStatus.instagram === "valid" && (
            <p className="text-green-500 text-sm mt-1">Valid Instagram link</p>
          )}

          {socialStatus.instagram === "invalid" && instagram.length > 0 && (
            <p className="text-red-500 text-sm mt-1">Invalid Instagram link</p>
          )}
        </label>

        <label className="mb-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={autoEnhance}
            onChange={() => setAutoEnhance(!autoEnhance)}
          />
          <span className="text-gray-300">Auto-Enhance Photo</span>
        </label>

        {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            disabled={usernameAvailable === false}
            onClick={saveProfile}
            className={`px-4 py-2 rounded transition ${
              usernameAvailable === false
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>

      {showCropper && preview ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 p-4 md:items-center md:p-6">
          <div className="my-4 w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-red-600 bg-[#111] p-6 shadow-[0_0_25px_rgba(255,0,0,0.4)] md:max-h-[calc(100vh-3rem)]">
            <h2 className="mb-4 text-xl font-bold text-white">Adjust Photo</h2>

            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-black">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_croppedArea, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-4 w-full"
            />

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowCropper(false)}
                className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  const cropped = await getCroppedImg(preview, croppedAreaPixels);
                  const enhanced = await enhanceImage(cropped);
                  setPreview(enhanced);
                  setShowCropper(false);
                }}
                className="rounded bg-red-600 px-4 py-2 hover:bg-red-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
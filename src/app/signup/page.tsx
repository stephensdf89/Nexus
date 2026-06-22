"use client";
import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  const getPasswordStrength = (password: string): number => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  };

  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      const savedEmail = sessionStorage.getItem("pendingEmail") || "";
      const savedPassword = sessionStorage.getItem("pendingPassword") || "";
      if (savedEmail || savedPassword) {
        sessionStorage.removeItem("pendingEmail");
        sessionStorage.removeItem("pendingPassword");
      }
      return {
        name: "",
        username: "",
        email: savedEmail,
        password: savedPassword,
        confirmPassword: "",
      };
    }
    return {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === "password") {
      setStrength(getPasswordStrength(value));
    }
  };

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!form.password.trim()) newErrors.password = "Password is required.";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!acceptedTerms) newErrors.acceptedTerms = "You must accept the terms to continue.";

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setErrors({ api: data.error });
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen fade-in flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="Content Creator Nexus Logo"
          width={140}
          height={140}
          className="rounded-md shadow-lg logo-pop"
        />
      </div>

      <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md border border-cyan-500/30 slide-up">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Create Your Account
        </h1>

        {submitted && (
          <p className="text-emerald-400 text-center mb-4">
            Account created successfully!
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-white block mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              aria-label="Full Name"
              aria-required="true"
              className="w-full p-3 rounded bg-black/40 border border-red-700 text-white input-glow"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-400 text-sm error-shake">{errors.name}</p>}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="text-white block mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              aria-label="Username"
              aria-required="true"
              className="w-full p-3 rounded bg-black/40 border border-red-700 text-white input-glow"
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="text-orange-400 text-sm">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-white block mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              aria-label="Email Address"
              aria-required="true"
              className="w-full p-3 rounded bg-black/40 border border-red-700 text-white input-glow"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-orange-400 text-sm">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-white block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                aria-label="Password"
                aria-required="true"
                className="w-full p-3 rounded bg-black/40 border border-red-700 text-white input-glow pr-12"
                value={form.password}
                onChange={handleChange}
              />

              {/* Toggle Button */}
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded strength-animate ${
                        strength >= level
                          ? level === 1
                            ? "bg-red-600"
                            : level === 2
                            ? "bg-orange-500"
                            : level === 3
                            ? "bg-yellow-400"
                            : "bg-green-500"
                          : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm mt-1 text-gray-300">
                  {strength === 0 && "Too weak"}
                  {strength === 1 && "Weak"}
                  {strength === 2 && "Moderate"}
                  {strength === 3 && "Strong"}
                  {strength === 4 && "Very strong"}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-orange-400 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="text-white block mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                aria-label="Confirm Password"
                aria-required="true"
                className="w-full p-3 rounded bg-black/40 border border-red-700 text-white input-glow pr-12"
                value={form.confirmPassword}
                onChange={handleChange}
              />

              {/* Toggle Button */}
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-3 mt-4">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              aria-required="true"
              aria-label="Accept Terms and Privacy Policy"
              className="mt-1 h-5 w-5 accent-red-700 cursor-pointer"
            />

            <label htmlFor="terms" className="text-gray-300 text-sm leading-tight cursor-pointer">
              I agree to the{" "}
              <a href="/terms" className="text-red-400 underline hover:text-red-300">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-red-400 underline hover:text-red-300">
                Privacy Policy
              </a>.
            </label>
          </div>

          {errors.acceptedTerms && (
            <p className="text-red-400 text-sm mt-1">{errors.acceptedTerms}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!acceptedTerms}
            className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded font-semibold transition btn-pulse"
          >
            Create Account
          </button>
        </form>

        {errors.api && (
          <p className="text-red-400 text-sm error-shake">{errors.api}</p>
        )}

        <p className="text-center text-gray-300 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-orange-400 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
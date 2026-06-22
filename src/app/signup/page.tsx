"use client";
import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!form.password.trim()) newErrors.password = "Password is required.";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setSubmitted(true);

    // TODO: Hook into your backend or NextAuth credentials provider
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="Content Creator Nexus Logo"
          width={140}
          height={140}
          className="rounded-lg shadow-2xl"
        />
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md border border-cyan-500/30">
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
              className="w-full p-3 rounded bg-slate-800/60 border border-cyan-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-orange-400 text-sm">{errors.name}</p>}
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
              className="w-full p-3 rounded bg-slate-800/60 border border-cyan-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition"
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
              className="w-full p-3 rounded bg-slate-800/60 border border-cyan-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition"
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
            <input
              id="password"
              name="password"
              type="password"
              aria-label="Password"
              aria-required="true"
              className="w-full p-3 rounded bg-slate-800/60 border border-cyan-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-orange-400 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="text-white block mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              aria-label="Confirm Password"
              aria-required="true"
              className="w-full p-3 rounded bg-slate-800/60 border border-cyan-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-orange-400 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white py-3 rounded font-semibold transition shadow-lg"
          >
            Create Account
          </button>
        </form>

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
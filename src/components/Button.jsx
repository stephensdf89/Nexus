"use client";

export default function Button({ children, variant = "primary", style = {}, ...props }) {
  const palette =
    variant === "secondary"
      ? { background: "#f3f4f6", color: "#111827", border: "1px solid #d1d5db" }
      : { background: "#111827", color: "#ffffff", border: "1px solid #111827" };

  return (
    <button
      {...props}
      style={{
        borderRadius: 8,
        padding: "8px 12px",
        cursor: "pointer",
        ...palette,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

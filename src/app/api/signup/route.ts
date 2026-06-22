import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { users } from "@/lib/userStore";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, username, email, password } = body;

  const exists = users.find((u) => u.email === email);

  if (exists) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    name,
    username,
    email,
    password: hashed,
  };

  users.push(newUser);

  return NextResponse.json({ success: true });
}

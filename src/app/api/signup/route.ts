import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { users } from "@/lib/userStore";
import {
  createValidationErrorResponse,
  validateRequestBody,
  type ValidationSchema,
} from "@/lib/requestValidation";

const SIGNUP_SCHEMA: ValidationSchema = {
  name: { type: "string", required: true, minLength: 1, maxLength: 120 },
  username: { type: "string", required: true, minLength: 3, maxLength: 60 },
  email: { type: "string", required: true, minLength: 3, maxLength: 255 },
  password: { type: "string", required: true, minLength: 8, maxLength: 128 },
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return createValidationErrorResponse(["Invalid JSON in request body"]);
  }

  const validation = validateRequestBody(body, SIGNUP_SCHEMA);
  if (!validation.valid) {
    return createValidationErrorResponse(validation.errors);
  }

  const name = String(validation.data?.name || "").trim();
  const username = String(validation.data?.username || "").trim();
  const email = String(validation.data?.email || "").trim().toLowerCase();
  const password = String(validation.data?.password || "");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return createValidationErrorResponse([{ field: "email", message: "Invalid email format" }]);
  }

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



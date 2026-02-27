import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";

const TOKEN_NAME = "history_token";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export function getEnvCredentials() {
  const username = process.env.AUTH_USERNAME || "teacher";
  const password = process.env.AUTH_PASSWORD || "secret123";
  return { username, password };
}

export function signToken(payload: { username: string }) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign(payload, secret, { expiresIn: MAX_AGE });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  try {
    return jwt.verify(token, secret) as { username: string };
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  cookies().set(TOKEN_NAME, token, {
    httpOnly: true,
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function clearAuthCookie() {
  cookies().set(TOKEN_NAME, "", { httpOnly: true, maxAge: 0, path: "/" });
}

export function getTokenFromRequest(req: NextRequest) {
  return req.cookies.get(TOKEN_NAME)?.value || headers().get("cookie")?.split(`${TOKEN_NAME}=`)?.[1]?.split(";")?.[0];
}

export function requireAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

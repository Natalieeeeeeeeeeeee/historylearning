import { NextRequest, NextResponse } from "next/server";

const TOKEN_NAME = "history_token";

function getToken(req: NextRequest) {
  return req.cookies.get(TOKEN_NAME)?.value;
}

function base64UrlToUint8Array(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
  const base64 = input + "=".repeat(pad);
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function verifyJwtHmac(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;
  const keyData = new TextEncoder().encode(secret);
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = base64UrlToUint8Array(signature);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data)));
  if (sigBuf.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sigBuf.length; i++) diff |= sigBuf[i] ^ expected[i];
  return diff === 0;
}

async function isAuthenticated(req: NextRequest) {
  const token = getToken(req);
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  if (!token || !secret) return false;
  try {
    return await verifyJwtHmac(token, secret);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPaths =
    pathname.startsWith("/api/analyze") ||
    pathname.startsWith("/api/grade") ||
    pathname.startsWith("/api/why") ||
    pathname.startsWith("/api/tutor") ||
    pathname.startsWith("/api/flashcards") ||
    pathname.startsWith("/api/compare") ||
    pathname.startsWith("/api/videos") ||
    pathname.startsWith("/api/essay-feedback");
  if (!protectedPaths) return NextResponse.next();

  const ok = await isAuthenticated(req);
  if (ok) return NextResponse.next();

  return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
}

export const config = {
  matcher: ["/api/analyze", "/api/grade"]
};

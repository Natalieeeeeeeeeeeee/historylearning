import { NextResponse } from "next/server";
import { getEnvCredentials, signToken, setAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};
    const creds = getEnvCredentials();
    if (username !== creds.username || password !== creds.password) {
      return NextResponse.json({ message: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }
    const token = signToken({ username });
    setAuthCookie(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ message: "Đăng nhập thất bại" }, { status: 500 });
  }
}

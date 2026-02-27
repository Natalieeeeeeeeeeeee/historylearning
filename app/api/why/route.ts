import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { historySchema } from "@/lib/schema";
import { chatWhy } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  try {
    const body = await req.json();
    const question = (body.question || "").toString();
    const history = historySchema.parse(body.history);
    if (!question.trim()) return NextResponse.json({ message: "Thiếu câu hỏi" }, { status: 400 });

    const answer = await chatWhy(history, question);
    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Không trả lời được" }, { status: 500 });
  }
}

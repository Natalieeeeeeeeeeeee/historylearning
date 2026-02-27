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
    const history = historySchema.parse(body.history);
    const prompt = `
Tạo 10 flashcard Q/A ngắn gọn cho sự kiện lịch sử sau. Dạng JSON array: [{"q":"...","a":"..."}].
Ưu tiên mốc thời gian, nguyên nhân, kết quả, ý nghĩa.
${history.event_name}
${history.timeline.start || ""} - ${history.timeline.end || ""}
`;
    const raw = await chatWhy(history, prompt);
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return NextResponse.json({ cards: parsed.slice(0, 10) });
    } catch {
      // fallthrough
    }
    return NextResponse.json({ cards: [] });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Không tạo được flashcard" }, { status: 500 });
  }
}

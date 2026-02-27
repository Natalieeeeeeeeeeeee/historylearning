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
    const essay = (body.essay || "").toString();
    if (!essay.trim()) return NextResponse.json({ message: "Thiếu bài tự luận" }, { status: 400 });

    const prompt = `
Chấm lỗi tự luận lịch sử. Trả về JSON:
{"score":0-10,"patterns":["..."],"suggest":"..."}
patterns liệt kê lỗi như thiếu mốc thời gian, thiếu dẫn chứng, suy luận nhân quả yếu.
Ngữ cảnh: ${history.event_name}
Bài: ${essay}
`;
    const resp = await chatWhy(history, prompt);
    try {
      const parsed = JSON.parse(resp);
      return NextResponse.json({ feedback: parsed });
    } catch {
      return NextResponse.json({ feedback: { score: 0, patterns: [], suggest: resp } });
    }
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Không chấm được" }, { status: 500 });
  }
}

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
    const other = (body.other || "").toString();
    if (!other.trim()) return NextResponse.json({ message: "Thiếu sự kiện so sánh" }, { status: 400 });

    const prompt = `
So sánh 2 sự kiện lịch sử theo bảng JSON:
{
 "fields":["Nguyên nhân","Diễn biến","Kết quả","Ý nghĩa"],
 "event_a":"${history.event_name}",
 "event_b":"${other}",
 "rows":[{"field":"...","a":"...","b":"..."}]
}
Chỉ dựa vào kiến thức sự kiện A (đã cho) và kiến thức thường gặp; nếu thiếu ghi "Không đủ dữ kiện".
`;
    const ans = await chatWhy(history, prompt);
    try {
      const parsed = JSON.parse(ans);
      return NextResponse.json({ table: parsed });
    } catch {
      return NextResponse.json({ table: null, raw: ans });
    }
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Không so sánh được" }, { status: 500 });
  }
}

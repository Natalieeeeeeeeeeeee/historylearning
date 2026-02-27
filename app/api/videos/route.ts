import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { historySchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  try {
    const body = await req.json();
    const history = historySchema.parse(body.history);
    const gaps = (body.gaps as string[]) || [];
    const baseQuery = `${history.event_name} lịch sử tóm tắt`;
    const topics = gaps.length ? gaps : ["nguyên nhân", "diễn biến", "ý nghĩa"];
    const suggestions = topics.slice(0, 3).map((t, i) => {
      const q = `${baseQuery} ${t}`;
      return {
        title: `Video mục tiêu: ${t}`,
        goal: `Xem để trả lời: ${t}`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
        id: i
      };
    });
    return NextResponse.json({ suggestions });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Không gợi ý được video" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { historySchema } from "@/lib/schema";
import { chatWhy } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Level = "Remember" | "Understand" | "Apply" | "Analyze";

const bloomPrompts: Record<Level, string> = {
  Remember: "Hỏi lại dữ kiện cơ bản, mốc thời gian, nhân vật.",
  Understand: "Hỏi vì sao/nguyên nhân/ý nghĩa ngắn gọn.",
  Apply: "Đặt tình huống tương tự, hỏi vận dụng kiến thức để giải thích.",
  Analyze: "Hỏi phản biện đa góc nhìn, hệ quả dài hạn hoặc so sánh."
};

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  try {
    const body = await req.json();
    const mode: "generate" | "feedback" = body.mode || "generate";
    const history = historySchema.parse(body.history);

    if (mode === "generate") {
      const questions = await Promise.all(
        (["Remember", "Understand", "Apply", "Analyze"] as Level[]).map(async (level) => {
          const q = await chatWhy(history, `${bloomPrompts[level]}\nTạo 1 câu hỏi.`);
          return { level, question: q };
        })
      );
      return NextResponse.json({ questions });
    }

    if (mode === "feedback") {
      const qa = body.answers as { level: Level; question: string; answer: string }[];
      const results = await Promise.all(
        qa.map(async (item) => {
          const reply = await chatWhy(history, `Câu hỏi: ${item.question}\nTrả lời của HS: ${item.answer}\nNhận xét ngắn gọn (<=2 câu).`);
          return { level: item.level, feedback: reply };
        })
      );
      return NextResponse.json({ feedback: results });
    }

    return NextResponse.json({ message: "Mode không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Tutor lỗi" }, { status: 500 });
  }
}

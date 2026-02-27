import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { gradeShortAnswer, gradeWhyQuestions } from "@/lib/llm";
import { whyQuestionsSchema, miniTestSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

  try {
    const body = await req.json();
    const { type } = body || {};

    if (type === "why") {
      const parsed = whyQuestionsSchema.parse(body.questions);
      const answers = body.answers as Record<number, string>;
      const result = await gradeWhyQuestions(parsed, answers || {});
      return NextResponse.json({ result });
    }

    if (type === "short") {
      const parsedTest = miniTestSchema.parse(body.mini_test);
      const index = body.index ?? 0;
      const answer = body.answer || "";
      const rubric = parsedTest.short_answer[index]?.rubric || [];
      const result = await gradeShortAnswer(rubric, answer);
      return NextResponse.json({ result });
    }

    return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Chấm thất bại" }, { status: 500 });
  }
}

"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { HistoryResponse } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

type ChatMessage = { role: "assistant" | "user"; text: string; meta?: string };

export function WhyQuestions({ data }: { data: HistoryResponse }) {
  const suggestions = useMemo(() => {
    const base = data.why_questions.map((q) => q.q);
    const fallback = [
      "Vì sao sự kiện này xảy ra?",
      "Vì sao kết quả trên lại quan trọng?",
      "Vì sao có sự thay đổi trong diễn biến?"
    ];
    const merged = [...base, ...fallback].filter(Boolean);
    const unique = Array.from(new Set(merged));
    return unique.slice(0, Math.max(3, unique.length));
  }, [data.why_questions]);
  const [currentQuestion, setCurrentQuestion] = useState<string>(suggestions[0] || "");
  const [questionInput, setQuestionInput] = useState<string>(suggestions[0] || "");
  const [answer, setAnswer] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [grading, setGrading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentQuestion) {
      setChat([{ role: "assistant", text: currentQuestion }]);
      setAnswer("");
    }
  }, [currentQuestion]);

  const handleUseSuggestion = (q: string) => {
    setQuestionInput(q);
    setCurrentQuestion(q);
    setChat([{ role: "assistant", text: q }]);
    setAnswer("");
  };

  const handleSend = async () => {
    const question = questionInput.trim() || currentQuestion.trim();
    if (!question) {
      toast({ title: "Chọn hoặc nhập câu hỏi trước" });
      return;
    }
    if (!answer.trim()) {
      toast({ title: "Nhập câu trả lời đã" });
      return;
    }
    setCurrentQuestion(question);
    setChat((prev) => [...prev, { role: "assistant", text: question }, { role: "user", text: answer }]);
    setGrading(true);
    try {
      const res = await fetch("/api/why", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history: data })
      });
      if (!res.ok) throw new Error("Không gọi được trợ lý");
      const json = await res.json();
      const reply = json.answer || "Không đủ dữ kiện từ ghi chép.";
      setChat((prev) => [...prev, { role: "assistant", text: reply, meta: "reply" }]);
      toast({ title: "Đã trả lời", variant: "success" });
    } catch (err: any) {
      toast({ title: "Lỗi", description: err?.message || "Không trả lời được" });
    } finally {
      setGrading(false);
      setAnswer("");
    }
  };

  const handleEnterSend = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => handleUseSuggestion(q)}
            className={`rounded-full border px-3 py-2 text-xs transition ${currentQuestion === q ? "bg-primary text-white border-primary" : "bg-white"}`}
          >
            {q}
          </button>
        ))}
      </div>

      <Input
        placeholder="Nhập hoặc chỉnh câu hỏi vì sao"
        value={questionInput}
        onChange={(e) => setQuestionInput(e.target.value)}
        className="text-sm"
      />

      <div className="rounded-2xl border bg-gradient-to-br from-white to-blue-50 p-4 space-y-3 max-h-[360px] overflow-y-auto">
        {chat.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
            <div
              className={`rounded-2xl px-3 py-2 text-sm shadow ${
                m.role === "assistant" ? "bg-white text-foreground border" : "bg-primary text-white"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {chat.length === 0 && <p className="text-sm text-muted-foreground">Chọn câu hỏi mẫu hoặc nhập câu hỏi, sau đó trả lời để nhận phản hồi.</p>}
        <div ref={chatEndRef} />
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Nhập câu hỏi của bạn..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleEnterSend}
          className="h-24"
        />
        <Button onClick={handleSend} disabled={grading}>
          {grading ? "Đang gửi..." : "Gửi"}
        </Button>
      </div>
    </div>
  );
}

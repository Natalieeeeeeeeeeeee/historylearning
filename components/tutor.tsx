"use client";

import { useEffect, useState } from "react";
import { HistoryResponse } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Level = "Remember" | "Understand" | "Apply" | "Analyze";
type Question = { level: Level; question: string };
type Feedback = { level: Level; feedback: string };

export function Tutor({ data }: { data: HistoryResponse }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<Level, string>>({ Remember: "", Understand: "", Apply: "", Analyze: "" });
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "generate", history: data })
      });
      const json = await res.json();
      setQuestions(json.questions || []);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    setLoading(true);
    try {
      const payload = questions.map((q) => ({ level: q.level, question: q.question, answer: answers[q.level] || "" }));
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "feedback", history: data, answers: payload })
      });
      const json = await res.json();
      setFeedback(json.feedback || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={loadQuestions} disabled={loading}>
          Tạo chuỗi câu hỏi Bloom
        </Button>
        <Button size="sm" onClick={submitAnswers} disabled={loading || questions.length === 0}>
          Gửi trả lời
        </Button>
      </div>
      {questions.map((q) => (
        <div key={q.level} className="rounded-xl border p-4 bg-white/80 space-y-2">
          <div className="text-xs font-semibold text-primary">{q.level}</div>
          <p className="text-sm font-semibold">{q.question}</p>
          <Textarea
            placeholder="Trả lời..."
            value={answers[q.level]}
            onChange={(e) => setAnswers({ ...answers, [q.level]: e.target.value })}
          />
          {feedback.find((f) => f.level === q.level) && (
            <p className="text-xs text-success">{feedback.find((f) => f.level === q.level)?.feedback}</p>
          )}
        </div>
      ))}
    </div>
  );
}

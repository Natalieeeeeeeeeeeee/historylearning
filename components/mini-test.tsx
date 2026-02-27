"use client";

import { useState } from "react";
import { HistoryResponse } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type McqAnswer = Record<number, string>;
type OrderingAnswer = Record<number, number[]>;

export function MiniTest({ data }: { data: HistoryResponse }) {
  const [mcqAnswers, setMcqAnswers] = useState<McqAnswer>({});
  const [orderingAnswers, setOrderingAnswers] = useState<OrderingAnswer>({});
  const [shortAnswer, setShortAnswer] = useState("");
  const [shortResult, setShortResult] = useState<{ score: number; comment: string } | null>(null);

  const gradeMcq = () => {
    const total = data.mini_test.mcq.length;
    let correct = 0;
    data.mini_test.mcq.forEach((q, idx) => {
      if ((mcqAnswers[idx] || "").toUpperCase() === q.answer) correct += 1;
    });
    toast({ title: "Kết quả trắc nghiệm", description: `${correct}/${total} câu đúng`, variant: "success" });
  };

  const gradeOrdering = () => {
    const total = data.mini_test.ordering.length;
    let correct = 0;
    data.mini_test.ordering.forEach((q, idx) => {
      const ans = orderingAnswers[idx] || [];
      const expected = q.answer_order;
      if (ans.length === expected.length && ans.every((v, i) => v === expected[i])) correct += 1;
    });
    toast({ title: "Kết quả sắp xếp", description: `${correct}/${total} đúng thứ tự`, variant: "success" });
  };

  const gradeShort = async () => {
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "short", mini_test: data.mini_test, index: 0, answer: shortAnswer })
      });
      if (!res.ok) throw new Error("Chấm không thành công");
      const json = await res.json();
      setShortResult(json.result);
      toast({ title: "Đã chấm tự luận", variant: "success" });
    } catch (err: any) {
      toast({ title: "Chấm thất bại", description: err?.message });
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">3 câu trắc nghiệm</h3>
          <Button variant="outline" size="sm" onClick={gradeMcq}>
            Chấm trắc nghiệm
          </Button>
        </div>
        <div className="space-y-4">
          {data.mini_test.mcq.map((q, idx) => (
            <div key={idx} className="rounded-xl border bg-white/70 p-4 space-y-3">
              <p className="font-semibold text-sm">
                Câu {idx + 1}: {q.q}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {q.choices.map((c) => (
                  <label key={c.id} className="flex items-center space-x-2 rounded-lg border p-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`mcq-${idx}`}
                      value={c.id}
                      checked={mcqAnswers[idx] === c.id}
                      onChange={() => setMcqAnswers({ ...mcqAnswers, [idx]: c.id })}
                    />
                    <span>
                      <strong>{c.id}.</strong> {c.text}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Đáp án: {q.answer} - {q.explain}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">2 câu sắp xếp thứ tự</h3>
          <Button variant="outline" size="sm" onClick={gradeOrdering}>
            Chấm sắp xếp
          </Button>
        </div>
        <div className="space-y-4">
          {data.mini_test.ordering.map((q, idx) => (
            <div key={idx} className="rounded-xl border bg-white/70 p-4 space-y-3">
              <p className="font-semibold text-sm">
                Câu {idx + 1}: {q.q}
              </p>
              <p className="text-xs text-muted-foreground">Nhập thứ tự chỉ số 1-{q.items.length}, ví dụ 1,2,3,4</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {q.items.map((item, i) => (
                  <span key={i} className="rounded-full bg-primary/10 text-primary px-3 py-1">
                    {i + 1}. {item}
                  </span>
                ))}
              </div>
              <Input
                placeholder="Ví dụ: 2,1,3,4"
                value={(orderingAnswers[idx] || []).join(",")}
                onChange={(e) => {
                  const nums = e.target.value
                    .split(",")
                    .map((n) => parseInt(n.trim(), 10) - 1)
                    .filter((n) => !isNaN(n));
                  setOrderingAnswers({ ...orderingAnswers, [idx]: nums });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Đáp án đúng: {q.answer_order.map((n) => n + 1).join(", ")} - {q.explain}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">1 câu tự luận ngắn</h3>
          <Button variant="outline" size="sm" onClick={gradeShort} disabled={!shortAnswer}>
            Chấm tự luận
          </Button>
        </div>
        {data.mini_test.short_answer.map((q, idx) => (
          <div key={idx} className="rounded-xl border bg-white/70 p-4 space-y-3">
            <p className="font-semibold text-sm">
              Câu {idx + 1}: {q.q}
            </p>
            <p className="text-xs text-muted-foreground">Rubric: {q.rubric.join("; ")}</p>
            <Textarea value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} placeholder="Nhập câu trả lời" />
            {shortResult && (
              <p className="text-xs text-success">
                Điểm: {shortResult.score}/10 - {shortResult.comment}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

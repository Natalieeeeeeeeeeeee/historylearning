"use client";

import { useState } from "react";
import { HistoryResponse } from "@/lib/schema";
import { Button } from "@/components/ui/button";

type Card = { q: string; a: string; due?: number };

export function Flashcards({ data }: { data: HistoryResponse }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  const load = async () => {
    const res = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: data })
    });
    const json = await res.json();
    const now = Date.now();
    setCards((json.cards || []).map((c: Card, i: number) => ({ ...c, due: now + i * 60000 })));
    setIndex(0);
    setShow(false);
  };

  const handleGrade = (correct: boolean) => {
    const next = (index + 1) % cards.length;
    const interval = correct ? 12 * 60 * 60 * 1000 : 10 * 60 * 1000;
    const updated = cards.map((c, i) => (i === index ? { ...c, due: Date.now() + interval } : c));
    setCards(updated);
    setIndex(next);
    setShow(false);
  };

  if (!cards.length) {
    return (
      <div className="space-y-3">
        <Button onClick={load}>Tạo 10 flashcards</Button>
        <p className="text-sm text-muted-foreground">Sinh tự động từ JSON sự kiện.</p>
      </div>
    );
  }

  const card = cards[index];
  const dueIn = Math.max(0, (card?.due || 0) - Date.now());

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <Button size="sm" variant="outline" onClick={load}>
          Làm mới
        </Button>
        <span className="text-xs text-muted-foreground">
          Thẻ {index + 1}/{cards.length} · ôn lại trong {(dueIn / 60000).toFixed(1)} phút
        </span>
      </div>
      <div className="rounded-2xl border bg-white/80 p-6 text-center space-y-3">
        <p className="text-sm font-semibold">{card.q}</p>
        {show && <p className="text-sm text-primary">{card.a}</p>}
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShow((v) => !v)}>
            {show ? "Ẩn đáp án" : "Xem đáp án"}
          </Button>
          <Button size="sm" variant="success" onClick={() => handleGrade(true)}>
            Nhớ
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleGrade(false)}>
            Quên
          </Button>
        </div>
      </div>
    </div>
  );
}

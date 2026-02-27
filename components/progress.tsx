"use client";

import { useEffect, useState } from "react";
import { HistoryResponse } from "@/lib/schema";
import { Button } from "@/components/ui/button";

type Log = { ts: number; label: string; score: number };

export function ProgressBoard({ data }: { data: HistoryResponse }) {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem("progress_logs");
    if (cached) setLogs(JSON.parse(cached));
  }, []);

  const addLog = (label: string, score: number) => {
    const updated = [...logs, { ts: Date.now(), label, score }];
    setLogs(updated);
    localStorage.setItem("progress_logs", JSON.stringify(updated));
  };

  const average = logs.length ? (logs.reduce((s, l) => s + l.score, 0) / logs.length).toFixed(1) : "0";

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <div className="text-sm">
          Trung bình: <span className="font-semibold">{average}</span>/10 · {logs.length} lần
        </div>
        <Button size="sm" variant="outline" onClick={() => addLog(`Mini test ${data.event_name}`, Math.round(Math.random() * 4) + 6)}>
          Ghi nhận điểm thử
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {logs.map((l, idx) => (
          <div key={idx} className="min-w-[120px] rounded-lg border bg-white/70 p-3">
            <p className="text-xs text-muted-foreground">{new Date(l.ts).toLocaleDateString()}</p>
            <p className="text-sm font-semibold">{l.label}</p>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${(l.score / 10) * 100}%` }} />
            </div>
            <p className="text-xs mt-1">Điểm: {l.score}/10</p>
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted-foreground">Chưa có dữ liệu. Chấm thử để hiển thị.</p>}
      </div>
    </div>
  );
}

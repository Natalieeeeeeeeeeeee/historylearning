"use client";

import { useState } from "react";
import { HistoryResponse } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = { field: string; a: string; b: string };

export function CompareEvents({ data }: { data: HistoryResponse }) {
  const [other, setOther] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);

  const compare = async () => {
    if (!other.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: data, other })
      });
      const json = await res.json();
      setRows(json.table?.rows || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <Input placeholder="Nhập sự kiện khác để so sánh" value={other} onChange={(e) => setOther(e.target.value)} />
        <Button onClick={compare} disabled={loading}>
          So sánh
        </Button>
      </div>
      {rows && (
        <div className="rounded-xl border bg-white/80 overflow-hidden">
          <div className="grid grid-cols-3 bg-muted text-sm font-semibold">
            <div className="p-2">Tiêu chí</div>
            <div className="p-2">{data.event_name}</div>
            <div className="p-2">{other}</div>
          </div>
          {rows.map((r, idx) => (
            <div key={idx} className="grid grid-cols-3 text-sm border-t">
              <div className="p-2 font-semibold">{r.field}</div>
              <div className="p-2">{r.a}</div>
              <div className="p-2">{r.b}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

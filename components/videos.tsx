"use client";

import { useEffect, useState } from "react";
import { HistoryResponse } from "@/lib/schema";
import { Button } from "@/components/ui/button";

type Video = { title: string; goal: string; url: string; id: number };

export function Videos({ data }: { data: HistoryResponse }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: data })
      });
      const json = await res.json();
      setVideos(json.suggestions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          Làm mới gợi ý video
        </Button>
      </div>
      <div className="grid gap-3">
        {videos.map((v) => (
          <a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border bg-white/80 p-4 hover:shadow transition"
          >
            <p className="text-sm font-semibold">{v.title}</p>
            <p className="text-xs text-muted-foreground">{v.goal}</p>
            <p className="text-xs text-primary mt-1">Mở YouTube</p>
          </a>
        ))}
      </div>
    </div>
  );
}

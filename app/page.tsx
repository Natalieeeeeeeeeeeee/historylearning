"use client";

import Link from "next/link";
import { ArrowRight, Camera, Sparkles, ShieldCheck, Brain, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const highlights = [
    { icon: <Camera className="h-6 w-6" />, title: "Chụp nhanh", desc: "Tối ưu cho camera điện thoại, xem trước và chụp lại dễ dàng." },
    { icon: <Sparkles className="h-6 w-6" />, title: "OCR + LLM", desc: "Tesseract xử lý văn bản, LLM dựng khung kiến thức đúng schema." },
    { icon: <ShieldCheck className="h-6 w-6" />, title: "Riêng tư", desc: "Phiên làm việc giữ trong phiên, cookie httpOnly an toàn." },
    { icon: <Brain className="h-6 w-6" />, title: "Tương tác", desc: "Mindmap, câu hỏi vì sao, mini test và chấm nhanh." },
    { icon: <Workflow className="h-6 w-6" />, title: "PWA friendly", desc: "UI mobile first, tải nhanh, chuyển trạng thái mượt." }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <header className="w-full px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg">H</div>
          <div>
            <p className="text-sm text-muted-foreground">HistoryLens</p>
            <p className="text-base font-semibold">Học Lịch sử bằng camera</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-3">
          <Link href="/app">
            <Button variant="ghost" size="sm">
              Vào ứng dụng
            </Button>
          </Link>
          <Link href="/app">
            <Button size="sm" className="shadow-lg">
              Dùng thử
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="flex-1 px-5 sm:px-8 lg:px-12 pb-16 sm:pb-24">
        <div className="w-full grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white px-4 py-2 shadow-sm border text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Biến ghi chép thành mindmap</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              Chụp ảnh bài học <span className="gradient-text">Lịch sử</span> và nhận khung kiến thức ngay.
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              HistoryLens là web app mobile first giúp học sinh chụp ảnh ghi chép, OCR tại chỗ và dùng LLM để tạo khung kiến thức chuẩn: nguyên nhân, diễn
              biến, kết quả, ý nghĩa. Có mindmap, câu hỏi vì sao, mini test để ôn tập.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Link href="/app">
                <Button size="lg" className="w-full sm:w-auto shadow-lg">
                  Vào ứng dụng
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground sm:ml-2">Không cần cài đặt. Dùng thử ngay.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {highlights.map((item) => (
                <Card key={item.title} className="glass border-none">
                  <CardContent className="p-4 flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">{item.icon}</div>
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl border p-6 shadow-xl space-y-4">
            <div className="aspect-[9/16] rounded-2xl bg-gradient-to-br from-primary/10 via-white to-green-50 p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Phiên demo</span>
                <span className="rounded-full bg-white px-3 py-1 text-primary font-medium">PWA ready</span>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-md space-y-3">
                <p className="text-sm font-semibold">Camera preview</p>
                <div className="h-40 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs">Ảnh bài học</div>
                <Button className="w-full">Phân tích</Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• OCR Tesseract tại chỗ</p>
                <p>• LLM GPT-4o with RAG</p>
                <p>• JSON schema cố định, validate bằng zod</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

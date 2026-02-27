"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSteps } from "@/components/loading-steps";
import { KnowledgeGrid } from "@/components/knowledge-sections";
import { Mindmap } from "@/components/mindmap";
import { WhyQuestions } from "@/components/why-questions";
import { MiniTest } from "@/components/mini-test";
import { CameraCapture } from "@/components/camera-capture";
import { toast } from "@/components/ui/use-toast";
import { HistoryResponse } from "@/lib/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, UploadCloud, Loader2 } from "lucide-react";
import { Tutor } from "@/components/tutor";
import { Flashcards } from "@/components/flashcards";
import { Videos } from "@/components/videos";
import { ProgressBoard } from "@/components/progress";
import { CompareEvents } from "@/components/compare-events";

type Step = "Uploading" | "OCR" | "LLM" | "Rendering";

export default function AppPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<HistoryResponse | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/me");
        setAuthed(res.ok);
      } catch {
        setAuthed(false);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Đăng nhập thất bại");
      }
      setAuthed(true);
      toast({ title: "Đăng nhập thành công", variant: "success" });
    } catch (err: any) {
      toast({ title: "Không đăng nhập được", description: err?.message });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
    setResult(null);
    setFiles([]);
  };

  const analyze = async () => {
    if (!files.length) {
      toast({ title: "Chưa có ảnh", description: "Hãy chụp hoặc tải ảnh bài học trước." });
      return;
    }
    setLoading(true);
    setStep("Uploading");
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      setStep("OCR");
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      setStep("LLM");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Không phân tích được");
      setResult(json.data);
      setOcrText(json.ocrText);
      setStep("Rendering");
      setTimeout(() => setStep(null), 400);
      toast({ title: "Đã phân tích bài học", variant: "success" });
    } catch (err: any) {
      setStep(null);
      toast({ title: "Lỗi phân tích", description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">HistoryLens</p>
            <h1 className="text-xl font-bold">Phân tích ghi chép Lịch sử</h1>
          </div>
          {authed && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          )}
        </div>

        {!authed ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Đăng nhập</CardTitle>
                <CardDescription>Chỉ một tài khoản do admin cung cấp.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleLogin}>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Tên đăng nhập</label>
                    <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Mật khẩu</label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  </div>
                  <Button className="w-full" type="submit" disabled={loginLoading}>
                    {loginLoading ? "Đang đăng nhập..." : "Vào ứng dụng"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 lg:gap-6">
            <div className="space-y-4">
              <Card className="glass border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Camera / Upload</CardTitle>
                  <CardDescription>Chụp ảnh bài học hoặc chọn ảnh sẵn có.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CameraCapture onCapture={(f) => setFiles((prev) => [...prev, f])} />
                  <div className="space-y-2">
                    <LoadingSteps current={step} />
                    <Button className="w-full" onClick={analyze} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Phân tích
                        </>
                      )}
                    </Button>
                    {files.length > 0 && (
                      <Button variant="outline" className="w-full" onClick={() => setFiles([])}>
                        Tải ảnh khác
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {ocrText && (
                <Card>
                  <CardHeader>
                    <CardTitle>Văn bản OCR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={ocrText} readOnly className="h-40 text-sm" />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              {!result ? (
                <div className="h-full rounded-2xl border-2 border-dashed border-slate-200 p-6 flex items-center justify-center text-center text-muted-foreground">
                  Chụp hoặc tải ảnh để xem khung kiến thức, mindmap, câu hỏi và mini test.
                </div>
              ) : (
                <Tabs defaultValue="summary" className="space-y-4">
                  <TabsList className="w-full grid grid-cols-6">
                    <TabsTrigger value="summary">Khung</TabsTrigger>
                    <TabsTrigger value="mindmap">Mindmap</TabsTrigger>
                    <TabsTrigger value="why">Vì sao</TabsTrigger>
                    <TabsTrigger value="test">Mini test</TabsTrigger>
                    <TabsTrigger value="tutor">Tutor</TabsTrigger>
                    <TabsTrigger value="more">Khác</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{result.event_name}</CardTitle>
                        <CardDescription>
                          Thời gian: {result.timeline.start || "?"} - {result.timeline.end || "?"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="timeline">
                            <AccordionTrigger>Timeline và ngày chính</AccordionTrigger>
                            <AccordionContent>
                              <ul className="text-sm space-y-1">
                                {result.timeline.key_dates.map((d, idx) => (
                                  <li key={idx} className="flex justify-between border-b pb-1">
                                    <span className="font-medium">{d.date}</span>
                                    <span className="text-muted-foreground">{d.note}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="related">
                            <AccordionTrigger>Sự kiện liên quan</AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {result.related_events.map((r, idx) => (
                                  <li key={idx}>
                                    <span className="font-semibold">{r.name}</span> - {r.relation}
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                    <KnowledgeGrid data={result} />
                  </TabsContent>

                  <TabsContent value="mindmap">
                    <Mindmap data={result} />
                  </TabsContent>

                  <TabsContent value="why">
                    <WhyQuestions data={result} />
                  </TabsContent>

                  <TabsContent value="test">
                    <MiniTest data={result} />
                  </TabsContent>

                  <TabsContent value="tutor">
                    <Tutor data={result} />
                  </TabsContent>

                  <TabsContent value="more" className="space-y-4">
                    <Flashcards data={result} />
                    <Videos data={result} />
                    <ProgressBoard data={result} />
                    <CompareEvents data={result} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

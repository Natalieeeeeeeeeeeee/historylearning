import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { runOcr } from "@/lib/ocr";
import { generateHistoryJson, generateHistoryJsonFromImages } from "@/lib/llm";
import { historySchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_SIZE = 6 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const filesRaw = form.getAll("files");
    let files: File[] = [];
    if (filesRaw.length) {
      files = filesRaw.filter((f): f is File => f instanceof File);
    } else {
      const file = form.get("file");
      if (file && file instanceof File) files = [file];
    }
    if (!files.length) {
      return NextResponse.json({ message: "Thiếu file ảnh" }, { status: 400 });
    }
    let totalSize = 0;
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        return NextResponse.json({ message: "Ảnh phải là JPEG hoặc PNG" }, { status: 400 });
      }
      totalSize += f.size;
    }
    if (totalSize > MAX_SIZE * files.length) {
      return NextResponse.json({ message: "Tổng dung lượng vượt quá giới hạn" }, { status: 400 });
    }

    const useDirectImageAnalysis = process.env.USE_DIRECT_IMAGE_ANALYZE !== "false";
    if (useDirectImageAnalysis && process.env.OPENAI_API_KEY) {
      const images = await Promise.all(
        files.map(async (f) => {
          const buffer = Buffer.from(await f.arrayBuffer());
          return {
            mimeType: f.type || "image/jpeg",
            base64: buffer.toString("base64")
          };
        })
      );
      const data = await generateHistoryJsonFromImages(images);
      const validated = historySchema.parse(data);
      return NextResponse.json({ data: validated, ocrText: "" });
    }

    let combinedText = "";
    for (const f of files) {
      const buffer = Buffer.from(await f.arrayBuffer());
      const text = await runOcr(buffer);
      combinedText += "\n" + text;
    }
    if (!combinedText.trim()) {
      return NextResponse.json({ message: "OCR không đọc được nội dung" }, { status: 422 });
    }

    const data = await generateHistoryJson(combinedText);
    const validated = historySchema.parse(data);

    return NextResponse.json({ data: validated, ocrText: combinedText });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Phân tích thất bại" }, { status: 500 });
  }
}

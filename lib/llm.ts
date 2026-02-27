import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { historySchema, type HistoryResponse } from "@/lib/schema";

type Provider = "openai" | "gemini";

function getProvider(): Provider {
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase();
  if (provider !== "openai" && provider !== "gemini") {
    throw new Error("LLM_PROVIDER must be openai or gemini");
  }
  return provider;
}

const schemaText = `{
  "event_name": "string",
  "timeline": {
    "start": "string | null",
    "end": "string | null",
    "key_dates": [{"date":"string","note":"string"}]
  },
  "causes": [{"title":"string","details":["string"]}],
  "developments": [{"step":"string","details":["string"]}],
  "results": [{"title":"string","details":["string"]}],
  "significance": [{"title":"string","details":["string"]}],
  "related_events": [{"name":"string","relation":"string"}],
  "why_questions": [{"q":"string","expected_points":["string"]}],
  "mini_test": {
    "mcq": [{
      "q":"string",
      "choices":[{"id":"A","text":"string"},{"id":"B","text":"string"},{"id":"C","text":"string"},{"id":"D","text":"string"}],
      "answer":"A|B|C|D",
      "explain":"string"
    }],
    "ordering": [{
      "q":"string",
      "items":["string"],
      "answer_order":[0,1,2,3],
      "explain":"string"
    }],
    "short_answer": [{
      "q":"string",
      "rubric":["string"]
    }]
  }
}`;

function basePrompt(ocrText: string) {
  return `
Bạn là trợ lý Lịch sử. Chỉ dùng thông tin từ đoạn OCR dưới đây để tạo JSON đúng schema. Không bịa. Nếu thiếu dữ kiện, ghi "Không đủ dữ kiện từ ghi chép" trong trường details tương ứng. Trả về JSON thuần, không markdown.

Schema cố định:
${schemaText}

OCR:
${ocrText}
`;
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });
  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "Bạn tạo JSON Lịch sử đúng schema. Không giải thích." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  });
  return res.choices[0]?.message?.content ?? "";
}

async function callOpenAIText(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });
  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "Bạn là trợ lý học tập, trả lời ngắn gọn." },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });
  return res.choices[0]?.message?.content ?? "";
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-pro";
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }], role: "user" }],
    generationConfig: { temperature: 0.2 }
  });
  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

function sanitizeJson(raw: string) {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    raw = raw.slice(firstBrace, lastBrace + 1);
  }
  return raw.replace(/```json|```/g, "").trim();
}

export async function generateHistoryJson(ocrText: string): Promise<HistoryResponse> {
  const provider = getProvider();
  const prompt = basePrompt(ocrText);
  const raw = provider === "openai" ? await callOpenAI(prompt) : await callGemini(prompt);
  const cleaned = sanitizeJson(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("LLM trả về dữ liệu không phải JSON hợp lệ");
  }
  const result = historySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("JSON không đúng schema: " + result.error.errors.map((e) => e.message).join("; "));
  }
  return result.data;
}

export async function gradeWhyQuestions(why: { q: string; expected_points: string[] }[], answers: Record<number, string>) {
  const text = why
    .map((item, idx) => `Câu ${idx + 1}: ${item.q}\nĐiểm mong đợi: ${item.expected_points.join("; ")}\nHọc sinh: ${answers[idx] || ""}`)
    .join("\n\n");
  const prompt = `
Chấm nhanh câu hỏi vì sao theo rubric cho trước. Mỗi câu trả về dạng:
{"q": "...", "score": 0-10, "comment": "..."}
Chỉ dùng thông tin được cấp, không mở rộng.
${text}
`;
  const provider = getProvider();
  const raw = provider === "openai" ? await callOpenAI(prompt) : await callGemini(prompt);
  const cleaned = sanitizeJson(raw);
  try {
    return JSON.parse(cleaned) as { q: string; score: number; comment: string }[];
  } catch {
    return [];
  }
}

export async function gradeShortAnswer(rubric: string[], answer: string) {
  const prompt = `
Chấm bài tự luận ngắn dựa trên rubric cho sẵn. Trả về JSON {"score":0-10,"comment":"..."}.
Rubric: ${rubric.join("; ")}
Bài làm: ${answer}
`;
  const provider = getProvider();
  const raw = provider === "openai" ? await callOpenAI(prompt) : await callGemini(prompt);
  const cleaned = sanitizeJson(raw);
  try {
    return JSON.parse(cleaned) as { score: number; comment: string };
  } catch {
    return { score: 0, comment: "Không đọc được phản hồi" };
  }
}

export async function chatWhy(history: HistoryResponse, question: string) {
  const context = `
Event: ${history.event_name}
Timeline: ${history.timeline.start || ""} - ${history.timeline.end || ""}
Causes: ${history.causes.map((c) => `${c.title}: ${c.details.join("; ")}`).join(" | ")}
Developments: ${history.developments.map((c) => `${c.step}: ${c.details.join("; ")}`).join(" | ")}
Results: ${history.results.map((c) => `${c.title}: ${c.details.join("; ")}`).join(" | ")}
Significance: ${history.significance.map((c) => `${c.title}: ${c.details.join("; ")}`).join(" | ")}
`;
  const prompt = `
Bạn là trợ lý học tập Lịch sử. Trả lời ngắn gọn (tối đa 3 câu) cho câu hỏi "vì sao" dựa trên ngữ cảnh bên dưới. Không bịa thêm ngoài ngữ cảnh. Nếu ngữ cảnh thiếu, nói rõ "Không đủ dữ kiện từ ghi chép".
Ngữ cảnh:
${context}

Câu hỏi: ${question}
Trả lời bằng tiếng Việt, thân thiện, dễ hiểu cho học sinh cấp 3.
`;
  const provider = getProvider();
  const raw = provider === "openai" ? await callOpenAIText(prompt) : await callGemini(prompt);
  const cleaned = raw.replace(/```/g, "").trim();
  // nếu model trả JSON có field response/answer thì lấy ra
  try {
    const obj = JSON.parse(cleaned);
    if (typeof obj === "object" && obj) {
      const candidate = (obj as any).response || (obj as any).answer;
      if (candidate && typeof candidate === "string") return candidate;
    }
  } catch {
    // ignore
  }
  return cleaned;
}

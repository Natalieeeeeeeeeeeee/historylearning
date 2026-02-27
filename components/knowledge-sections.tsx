import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryResponse } from "@/lib/schema";

export function KnowledgeGrid({ data }: { data: HistoryResponse }) {
  const columns = [
    { title: "Nguyên nhân", items: data.causes.map((c) => ({ title: c.title, details: c.details })) },
    { title: "Diễn biến", items: data.developments.map((c) => ({ title: c.step, details: c.details })) },
    { title: "Kết quả", items: data.results.map((c) => ({ title: c.title, details: c.details })) },
    { title: "Ý nghĩa", items: data.significance.map((c) => ({ title: c.title, details: c.details })) }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => (
        <Card key={col.title} className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-lg">{col.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {col.items.length === 0 && <p className="text-sm text-muted-foreground">Không đủ dữ kiện từ ghi chép.</p>}
            {col.items.map((item, idx) => (
              <div key={idx} className="rounded-lg border bg-white/60 p-3 space-y-2">
                <p className="font-semibold text-sm">{item.title}</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {item.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

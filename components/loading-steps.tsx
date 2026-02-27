type Step = "Uploading" | "OCR" | "LLM" | "Rendering";

export function LoadingSteps({ current }: { current: Step | null }) {
  if (!current) return null;
  const steps: Step[] = ["Uploading", "OCR", "LLM", "Rendering"];
  const currentIndex = steps.indexOf(current);
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        {steps.map((step, idx) => (
          <span key={step} className={idx <= currentIndex ? "text-primary font-medium" : ""}>
            {step}
          </span>
        ))}
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

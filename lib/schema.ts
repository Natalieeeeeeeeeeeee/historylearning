import { z } from "zod";

export const timelineSchema = z.object({
  start: z.string().nullable(),
  end: z.string().nullable(),
  key_dates: z.array(z.object({ date: z.string(), note: z.string() }))
});

export const causesSchema = z.array(z.object({ title: z.string(), details: z.array(z.string()) }));
export const developmentsSchema = z.array(z.object({ step: z.string(), details: z.array(z.string()) }));
export const resultsSchema = z.array(z.object({ title: z.string(), details: z.array(z.string()) }));
export const significanceSchema = z.array(z.object({ title: z.string(), details: z.array(z.string()) }));
export const relatedEventsSchema = z.array(z.object({ name: z.string(), relation: z.string() }));
export const whyQuestionsSchema = z.array(z.object({ q: z.string(), expected_points: z.array(z.string()) }));

export const miniTestSchema = z.object({
  mcq: z.array(
    z.object({
      q: z.string(),
      choices: z.array(z.object({ id: z.enum(["A", "B", "C", "D"]), text: z.string() })),
      answer: z.enum(["A", "B", "C", "D"]),
      explain: z.string()
    })
  ),
  ordering: z.array(
    z.object({
      q: z.string(),
      items: z.array(z.string()),
      answer_order: z.array(z.number()),
      explain: z.string()
    })
  ),
  short_answer: z.array(
    z.object({
      q: z.string(),
      rubric: z.array(z.string())
    })
  )
});

export const historySchema = z.object({
  event_name: z.string(),
  timeline: timelineSchema,
  causes: causesSchema,
  developments: developmentsSchema,
  results: resultsSchema,
  significance: significanceSchema,
  related_events: relatedEventsSchema,
  why_questions: whyQuestionsSchema,
  mini_test: miniTestSchema
});

export type HistoryResponse = z.infer<typeof historySchema>;

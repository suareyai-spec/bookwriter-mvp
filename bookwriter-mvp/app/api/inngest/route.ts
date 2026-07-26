import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { generateBook } from "@/inngest/generate-book";
import { generateUniversityCourse } from "@/inngest/generate-university-course";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateBook, generateUniversityCourse],
});

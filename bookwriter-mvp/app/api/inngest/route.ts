import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { generateBook } from "@/inngest/generate-book";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateBook],
});

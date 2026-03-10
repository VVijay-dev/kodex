import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { demoError, helloWorld } from "@/inngest/functions";
import { processMessge } from "@/features/conversations/inngest/process-message";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    demoError,
    processMessge
    /* your functions will be passed here later! */
  ],
});
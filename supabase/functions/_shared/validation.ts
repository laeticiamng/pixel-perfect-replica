import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { corsHeaders } from "./auth.ts";

export { z };

/**
 * Validate a request body against a Zod schema.
 * Returns the parsed data on success, or a 400 Response on failure.
 */
export function validateBody<T extends z.ZodTypeAny>(
  body: unknown,
  schema: T
): z.infer<T> | Response {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    console.warn("[validation] Body rejected:", JSON.stringify(errors));
    return new Response(
      JSON.stringify({ error: "Invalid request payload", details: errors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  return result.data;
}

export function isValidationError(result: unknown): result is Response {
  return result instanceof Response;
}

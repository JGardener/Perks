import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { validateBuild } from "./validate.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Allow": "POST, OPTIONS" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ valid: false, errors: ["Invalid JSON"] }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const result = validateBuild(body);
  return new Response(JSON.stringify(result), {
    status: result.valid ? 200 : 400,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});

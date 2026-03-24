import type { HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

interface AuthResponse {
  authorized: boolean;
  providers?: {
    gemini?: { apiKey: string };
    openrouter?: { apiKey: string };
  };
  defaultProvider?: "gemini" | "openrouter";
  error?: string;
}

const handler = async (
  event: HandlerEvent,
  _context: HandlerContext
): Promise<HandlerResponse> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let password: string;
  try {
    const body = JSON.parse(event.body || "{}");
    password = body.password;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ authorized: false, error: "Invalid request body" }),
    };
  }

  if (!password || password !== process.env.OWNER_PASSWORD) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorized: false, error: "Invalid password" }),
    };
  }

  // Build provider map from available env vars
  const providers: AuthResponse["providers"] = {};
  if (process.env.GEMINI_API_KEY) {
    providers.gemini = { apiKey: process.env.GEMINI_API_KEY };
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.openrouter = { apiKey: process.env.OPENROUTER_API_KEY };
  }

  // Default to OpenRouter if available, otherwise Gemini
  const defaultProvider: "gemini" | "openrouter" = providers.openrouter
    ? "openrouter"
    : "gemini";

  const response: AuthResponse = {
    authorized: true,
    providers,
    defaultProvider,
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  };
};

export { handler };

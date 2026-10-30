export default async (request) => {
  if (request.method !== "GET") return new Response(null, { status: 405 });
  return Response.json(
    {
      status: "up",
      provider: process.env.DOTLINE_GEMINI_API_KEY?.trim() ? "gemini" : "mock",
      model: process.env.DOTLINE_GEMINI_MODEL?.trim() || "gemini-2.5-flash",
      storage: "browser",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
};

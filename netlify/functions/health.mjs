export default async (request) => {
  if (request.method !== "GET") return new Response(null, { status: 405 });
  return Response.json(
    {
      status: "up",
      provider: process.env.DOTLINE_GEMINI_API_KEY ? "gemini" : "mock",
      storage: "browser",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
};

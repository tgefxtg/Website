import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export async function isOwner() {
  const user = await getChatGPTUser();
  if (!user || !env.DB) return false;
  let owner = await env.DB.prepare(
    "SELECT user_id FROM owners WHERE role = 'owner'",
  ).first<{ user_id: string }>();
  // Only the configured, platform-verified owner may bind the stable Site user ID.
  if (
    !owner &&
    env.ADMIN_OWNER_EMAIL &&
    user.email.toLowerCase() === env.ADMIN_OWNER_EMAIL.toLowerCase()
  ) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO owners(role,user_id) VALUES('owner',?)",
    )
      .bind(user.userId)
      .run();
    owner = await env.DB.prepare(
      "SELECT user_id FROM owners WHERE role = 'owner'",
    ).first<{ user_id: string }>();
  }
  return owner?.user_id === user.userId;
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

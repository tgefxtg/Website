import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export async function isOwner() {
  const user = await getChatGPTUser();
  if (!user || !env.DB || !env.ADMIN_OWNER_EMAIL) return false;
  // Runtime configuration is authoritative, including after an owner transfer.
  if (user.email.toLowerCase() !== env.ADMIN_OWNER_EMAIL.toLowerCase()) return false;
  let owner = await env.DB.prepare(
    "SELECT user_id FROM owners WHERE role = 'owner'",
  ).first<{ user_id: string }>();
  // Only the configured, platform-verified owner may bind the stable Site user ID.
  if (
    owner?.user_id !== user.userId &&
    env.ADMIN_OWNER_EMAIL &&
    user.email.toLowerCase() === env.ADMIN_OWNER_EMAIL.toLowerCase()
  ) {
    await env.DB.prepare(
      "INSERT INTO owners(role,user_id) VALUES('owner',?) ON CONFLICT(role) DO UPDATE SET user_id=excluded.user_id",
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

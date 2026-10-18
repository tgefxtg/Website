import {
  getChatGPTUser,
  chatGPTSignInPath,
  chatGPTSignOutPath,
} from "@/app/chatgpt-auth";
import { isOwner } from "@/lib/admin-auth";
import { getPlaces } from "@/lib/places";
import { AdminPanel } from "@/components/admin/panel";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Owner dashboard",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const user = await getChatGPTUser();
  if (!user || !(await isOwner()))
    return (
      <main id="main" className="section admin-login">
        <span className="eyebrow">ABHA TOURIST CENTER / OWNER ACCESS</span>
        <h1>
          Your places.
          <br />
          <em>Your stories.</em>
        </h1>
        <p>
          {user
            ? "This account does not have owner access. Sign in with the website owner’s account."
            : "Sign in to manage destinations, photos, descriptions and package prices."}
        </p>
        <a
          className="button button-green"
          href={
            user ? chatGPTSignOutPath("/admin/") : chatGPTSignInPath("/admin/")
          }
          target="_top"
        >
          {user ? "Sign out and switch account" : "Sign in with ChatGPT"}
        </a>
      </main>
    );
  return (
    <AdminPanel
      initialPlaces={await getPlaces()}
      ownerName={user.displayName}
      signOutUrl={chatGPTSignOutPath("/admin/")}
    />
  );
}

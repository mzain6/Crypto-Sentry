import { auth } from "@/auth";
import { ProfileClient } from "@/components/profile/profile-client";
import { getProfileSummary } from "@/lib/profile";

export default async function ProfilePage() {
  const session = await auth();
  const profile = session?.user?.id
    ? await getProfileSummary(session.user.id)
    : null;

  return (
    <>
      <section className="terminal-page-heading">
        <div className="terminal-page-icon" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>Profile</h1>
          <p>Operator identity and account controls</p>
        </div>
      </section>
      {profile ? (
        <ProfileClient profile={profile} />
      ) : (
        <section className="terminal-panel terminal-empty-panel">
          <div>
            <div className="terminal-panel-kicker">User Instance</div>
            <h2>Profile Not Found</h2>
            <p>Could not load the current profile.</p>
          </div>
        </section>
      )}
    </>
  );
}

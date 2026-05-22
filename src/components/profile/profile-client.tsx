"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

import type { ProfileSummary } from "@/lib/profile";

type ProfileClientProps = {
  profile: ProfileSummary;
};

type PasswordChecks = {
  length: boolean;
  lower: boolean;
  match: boolean;
  number: boolean;
  upper: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getInitial(name: string) {
  return name.slice(0, 1).toUpperCase() || "U";
}

function getPasswordChecks(
  password: string,
  confirmPassword: string,
): PasswordChecks {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    match: password.length > 0 && password === confirmPassword,
    number: /[0-9]/.test(password),
    upper: /[A-Z]/.test(password),
  };
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [avatarPreview, setAvatarPreview] = useState(profile.imageUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const passwordChecks = useMemo(
    () => getPasswordChecks(newPassword, confirmPassword),
    [confirmPassword, newPassword],
  );

  function showMessage(nextMessage: string) {
    setError(null);
    setMessage(nextMessage);
  }

  function showError(nextError: string) {
    setMessage(null);
    setError(nextError);
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setAvatarFile(null);
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showError("Only JPEG and PNG profile pictures are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError("Profile picture must be 2MB or smaller.");
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const profileResponse = await fetch("/api/profile", {
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const profileData = (await profileResponse.json()) as {
        message?: string;
      };

      if (!profileResponse.ok) {
        throw new Error(profileData.message ?? "Could not update profile.");
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const avatarResponse = await fetch("/api/profile/avatar", {
          body: formData,
          method: "POST",
        });
        const avatarData = (await avatarResponse.json()) as {
          imageUrl?: string;
          message?: string;
        };

        if (!avatarResponse.ok) {
          throw new Error(
            avatarData.message ?? "Could not update profile picture.",
          );
        }

        setAvatarPreview(avatarData.imageUrl ?? avatarPreview);
        setAvatarFile(null);
      }

      showMessage("Profile saved.");
      router.refresh();
    } catch (submitError) {
      showError(
        submitError instanceof Error
          ? submitError.message
          : "Could not update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChangingPassword(true);

    try {
      const response = await fetch("/api/profile/password", {
        body: JSON.stringify({
          confirmPassword,
          currentPassword,
          newPassword,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Could not change password.");
      }

      showMessage("Password changed. Redirecting to login...");
      await signOut({ callbackUrl: "/login" });
    } catch (submitError) {
      showError(
        submitError instanceof Error
          ? submitError.message
          : "Could not change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <section className="profile-module-panel">
      {message ? <div className="profile-toast success">{message}</div> : null}
      {error ? <div className="profile-toast error">{error}</div> : null}

      <div className="profile-grid">
        <article className="profile-card profile-identity-card">
          <div className="profile-avatar-large">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={`${profile.name} avatar`} src={avatarPreview} />
            ) : (
              <span>{getInitial(profile.name)}</span>
            )}
          </div>
          <div>
            <div className="terminal-panel-kicker">Operator Identity</div>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
          </div>
          <div className="profile-meta-row">
            <span>Joined</span>
            <strong>{formatDate(profile.createdAt)}</strong>
          </div>
        </article>

        <article className="profile-card profile-activity-card">
          <div className="terminal-panel-heading">
            <h2>Account Activity</h2>
            <p>Read-only operational summary</p>
          </div>
          <div className="profile-stat-grid">
            <div>
              <span>Watchlisted Coins</span>
              <strong>{profile.watchlistCount}</strong>
            </div>
            <div>
              <span>Days Since Joining</span>
              <strong>{profile.daysSinceJoining}</strong>
            </div>
          </div>
        </article>

        <form className="profile-card profile-form" onSubmit={handleProfileSubmit}>
          <div className="terminal-panel-heading">
            <h2>Edit Profile</h2>
            <p>Update display name and profile picture</p>
          </div>

          <label>
            <span>Display Name</span>
            <input
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </label>

          <label>
            <span>Profile Picture</span>
            <input
              accept="image/jpeg,image/png"
              onChange={handleAvatarChange}
              type="file"
            />
            <small>JPEG or PNG, max 2MB.</small>
          </label>

          <button disabled={savingProfile} type="submit">
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form
          className="profile-card profile-form"
          onSubmit={handlePasswordSubmit}
        >
          <div className="terminal-panel-heading">
            <h2>{profile.hasPassword ? "Change Password" : "Set Password"}</h2>
            <p>
              {profile.hasPassword
                ? "Current password required"
                : "Create a local password for manual login"}
            </p>
          </div>

          {profile.hasPassword ? (
            <label>
              <span>Current Password</span>
              <input
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                type="password"
                value={currentPassword}
              />
            </label>
          ) : null}

          <label>
            <span>New Password</span>
            <input
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>

          <label>
            <span>Confirm New Password</span>
            <input
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          <div className="profile-strength-grid">
            <span className={passwordChecks.length ? "passed" : ""}>8 chars</span>
            <span className={passwordChecks.upper ? "passed" : ""}>Uppercase</span>
            <span className={passwordChecks.lower ? "passed" : ""}>Lowercase</span>
            <span className={passwordChecks.number ? "passed" : ""}>Number</span>
            <span className={passwordChecks.match ? "passed" : ""}>Match</span>
          </div>

          <button disabled={changingPassword} type="submit">
            {changingPassword
              ? profile.hasPassword
                ? "Changing..."
                : "Setting..."
              : profile.hasPassword
                ? "Change Password"
                : "Set Password"}
          </button>
        </form>
      </div>
    </section>
  );
}

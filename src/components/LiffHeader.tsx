"use client";

import { useLiff } from "./LiffProvider";

export function LiffHeader() {
  const { browserFallback, error, loggedIn, profile } = useLiff();

  if (!browserFallback && !error && !(loggedIn && profile)) return null;

  return (
    <aside className="liff-status" aria-live="polite">
      {loggedIn && profile ? (
        <div className="liff-profile">
          {profile.pictureUrl ? (
            // LINE profile images are remote user content and are not known at build time.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.pictureUrl} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="liff-profile__initial" aria-hidden="true">
              {profile.displayName.trim().charAt(0).toLocaleUpperCase() || "W"}
            </span>
          )}
          <span>
            <small>Signed in with LINE</small>
            <strong>{profile.displayName}</strong>
          </span>
        </div>
      ) : null}
      {browserFallback ? (
        <p className="liff-browser-notice">
          Browser preview mode — LINE profile features are unavailable.
        </p>
      ) : null}
      {error && !browserFallback ? (
        <p className="liff-error" role="status">
          LINE profile features could not be loaded. You can continue with the consultation.
        </p>
      ) : null}
    </aside>
  );
}

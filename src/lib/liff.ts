import type { LiffInitialisationResult, LiffProfile } from "@/src/types/liff";

let initialisationPromise: Promise<LiffInitialisationResult> | null = null;

export class LiffInitialisationError extends Error {
  constructor(
    message: string,
    readonly insideLine: boolean,
  ) {
    super(message);
    this.name = "LiffInitialisationError";
  }
}

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : "An unknown LIFF error occurred.";
}

export function initialiseLiff(): Promise<LiffInitialisationResult> {
  if (initialisationPromise) return initialisationPromise;

  initialisationPromise = (async () => {
    if (typeof window === "undefined") {
      throw new Error("LIFF can only be initialised in a browser.");
    }

    const { default: liff } = await import("@line/liff");
    const insideLine = liff.isInClient();
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();

    if (!liffId) {
      throw new LiffInitialisationError(
        "NEXT_PUBLIC_LIFF_ID is not configured.",
        insideLine,
      );
    }

    // Keep external browsers in preview mode. In particular, localhost must
    // never be redirected into LINE Login during development.
    try {
      await liff.init({ liffId, withLoginOnExternalBrowser: false });
    } catch (error) {
      throw new LiffInitialisationError(messageFrom(error), insideLine);
    }

    const loggedIn = liff.isLoggedIn();
    let profile: LiffProfile | null = null;
    let profileError: string | null = null;

    if (loggedIn) {
      try {
        const { displayName, pictureUrl } = await liff.getProfile();
        profile = pictureUrl ? { displayName, pictureUrl } : { displayName };
      } catch (error) {
        profileError = `Your LINE profile could not be loaded: ${messageFrom(error)}`;
      }
    }

    return {
      insideLine,
      loggedIn,
      browserFallback: !insideLine,
      profile,
      profileError,
    };
  })();

  return initialisationPromise;
}

export type LiffProfile = Readonly<{
  displayName: string;
  pictureUrl?: string;
}>;

export type LiffState = Readonly<{
  loading: boolean;
  ready: boolean;
  insideLine: boolean;
  loggedIn: boolean;
  browserFallback: boolean;
  profile: LiffProfile | null;
  error: string | null;
}>;

export type LiffInitialisationResult = Readonly<{
  insideLine: boolean;
  loggedIn: boolean;
  browserFallback: boolean;
  profile: LiffProfile | null;
  profileError: string | null;
}>;

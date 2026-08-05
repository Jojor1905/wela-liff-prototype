import type { SVGProps } from "react";

type IconName =
  | "arrow-left"
  | "arrow-right"
  | "camera"
  | "check"
  | "image"
  | "lock"
  | "sparkle"
  | "sun"
  | "glasses"
  | "smile"
  | "scan"
  | "moon"
  | "leaf"
  | "close";

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    "arrow-left": <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>,
    "arrow-right": <><path d="m9 18 6-6-6-6" /><path d="M5 12h10" /></>,
    camera: <><path d="M5 8h2l1.5-2h7L17 8h2v10H5z" /><circle cx="12" cy="13" r="3" /></>,
    check: <path d="m6 12 4 4 8-9" />,
    image: <><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m6 17 4-4 3 3 2-2 3 3" /></>,
    lock: <><rect x="6" y="10" width="12" height="9" rx="2" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></>,
    sparkle: <><path d="M12 3c.5 4 2.5 6 6 6-3.5 0-5.5 2-6 6-.5-4-2.5-6-6-6 3.5 0 5.5-2 6-6Z" /><path d="M18.5 14.5c.2 1.6 1 2.4 2.5 2.5-1.5.1-2.3.9-2.5 2.5-.2-1.6-1-2.4-2.5-2.5 1.5-.1 2.3-.9 2.5-2.5Z" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></>,
    glasses: <><circle cx="8" cy="13" r="3" /><circle cx="16" cy="13" r="3" /><path d="M11 13h2M5 12l-2-1M19 12l2-1" /></>,
    smile: <><circle cx="12" cy="12" r="8.5" /><path d="M9 10h.01M15 10h.01M8.5 14c1 1.35 2.15 2 3.5 2s2.5-.65 3.5-2" /></>,
    scan: <><path d="M8 4H5a1 1 0 0 0-1 1v3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M9 11h.01M15 11h.01M9 15c.9.8 1.9 1.2 3 1.2s2.1-.4 3-1.2" /></>,
    moon: <path d="M19 15.5A7.5 7.5 0 0 1 8.5 5 7.5 7.5 0 1 0 19 15.5Z" />,
    leaf: <><path d="M19 4C11 4 6 8 6 14c0 3 2 5 5 5 6 0 8-7 8-15Z" /><path d="M5 20c2-5 5-8 10-11" /></>,
    close: <><path d="m7 7 10 10" /><path d="M17 7 7 17" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}

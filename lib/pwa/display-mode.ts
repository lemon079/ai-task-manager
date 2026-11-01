/**
 * NeuraTask PWA Display Mode & Platform Detection
 * Single Source of Truth for Install-Only Access
 *
 * ARCHITECTURE NOTE:
 * The Install Gate is a UX boundary, NOT a security boundary.
 * Every API route keeps its own authentication (auth() JWT session),
 * CSRF origin validation, and rate limits. Never rely on the gate
 * for backend data protection.
 */

export type DisplayModeState = "checking" | "standalone" | "browser";

export interface PlatformDetails {
  isInAppBrowser: boolean;
  isIos: boolean;
  isMacSafari: boolean;
  isChromeOrEdge: boolean;
  isFirefox: boolean;
}

/**
 * Live Display Mode Check (Single source of truth)
 * Installed when ANY of:
 * - (display-mode: standalone)
 * - (display-mode: fullscreen)
 * - (display-mode: minimal-ui)
 * - navigator.standalone === true (iOS WebKit standalone)
 *
 * NOTE: Never store this state in cookies or localStorage, because
 * Android Chrome shares cookies with WebAPKs, which would leak
 * browser tab access.
 */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // Build-time escape hatch for development, Playwright, and CI
  if (isBrowserAllowed()) {
    return true;
  }

  const isStandaloneMedia =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches;

  const isIosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  return Boolean(isStandaloneMedia || isIosStandalone);
}

/**
 * Evaluates build-time test escape hatch.
 * In production builds, this is strictly forbidden by next.config.ts.
 */
export function isBrowserAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_BROWSER === "true";
}

/**
 * Sniffs platform to present tailored installation steps.
 * Best-effort only: changes WHICH instructions are shown, never whether the gate applies.
 */
export function detectBrowserPlatform(userAgentString?: string): PlatformDetails {
  if (typeof window === "undefined" && !userAgentString) {
    return {
      isInAppBrowser: false,
      isIos: false,
      isMacSafari: false,
      isChromeOrEdge: true,
      isFirefox: false,
    };
  }

  const ua = (userAgentString || (typeof window !== "undefined" ? window.navigator.userAgent : "")).toLowerCase();

  // In-App Browser detection (Instagram, Facebook, Messenger, LinkedIn, TikTok, Twitter/X, Threads)
  const isInAppBrowser = Boolean(
    /instagram|fbav|fban|messenger|linkedinapp|musical_ly|bytedance|tiktok|twitter|threads/i.test(
      ua
    )
  );

  // iOS detection
  const isIos = Boolean(/iphone|ipad|ipod/i.test(ua));

  // Firefox detection
  const isFirefox = Boolean(/firefox|fxios/i.test(ua));

  // macOS Safari (Desktop Safari Add to Dock support on macOS 14+ Sonoma)
  const isMac = Boolean(/macintosh|mac os x/i.test(ua)) && !isIos;
  const isMacSafari =
    isMac &&
    Boolean(/safari/i.test(ua)) &&
    !Boolean(/chrome|crios|chromium|edg|opr|brave/i.test(ua));

  // Chrome or Chromium-based Edge
  const isChromeOrEdge =
    Boolean(/chrome|chromium|edg/i.test(ua)) &&
    !isFirefox &&
    !isInAppBrowser;

  return {
    isInAppBrowser,
    isIos,
    isMacSafari,
    isChromeOrEdge,
    isFirefox,
  };
}

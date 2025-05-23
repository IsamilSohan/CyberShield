
export const APP_NAME = "Cyber Shield Defender";

export type NavLink = {
  href: string;
  label: string;
  authRequired?: boolean; // True if link should only be shown to authenticated users
  publicOnly?: boolean; // True if link should only be shown to non-authenticated users
  adminRequired?: boolean; // True if link should only be shown to admin users
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Courses" },
  { href: "/study-guide", label: "Study Guide" },
  { href: "/profile", label: "Profile", authRequired: true },
  { href: "/admin", label: "Admin", authRequired: true, adminRequired: true }, // Added admin link
  { href: "/auth/login", label: "Login", publicOnly: true },
  { href: "/auth/register", label: "Register", publicOnly: true },
];

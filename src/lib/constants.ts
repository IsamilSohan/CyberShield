
export const APP_NAME = "Cyber Shield";

export type NavLink = {
  href: string;
  label: string;
  authRequired?: boolean;
  publicOnly?: boolean;
  adminRequired?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Courses" },
  { href: "/blog", label: "Blog" }, // Added Blog link
  { href: "/profile", label: "Profile", authRequired: true },
  { href: "/admin", label: "Admin", authRequired: true, adminRequired: true },
  { href: "/auth/login", label: "Login", publicOnly: true },
  { href: "/auth/register", label: "Register", publicOnly: true },
];

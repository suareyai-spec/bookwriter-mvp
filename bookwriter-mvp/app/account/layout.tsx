import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings | PlotGhost",
  description: "Manage your PlotGhost subscription, billing, and account settings.",
  alternates: { canonical: "/account" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}

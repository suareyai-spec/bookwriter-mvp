import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | PlotGhost",
  description: "Set a new password for your PlotGhost account.",
  alternates: { canonical: "/auth/reset-password" },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

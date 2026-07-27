import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | PlotGhost",
  description: "Reset your PlotGhost account password.",
  alternates: { canonical: "/auth/forgot-password" },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

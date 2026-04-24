import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          backgroundImage: "radial-gradient(circle at 30% 40%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(circle at 70% 60%, rgba(59,130,246,0.1), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 20 }}>
          <span style={{ fontSize: 120, fontWeight: 800, color: "#ffffff" }}>Plot</span>
          <span style={{ fontSize: 120, fontWeight: 800, color: "#6666ff", marginLeft: 20 }}>Ghost</span>
        </div>
        <div style={{ fontSize: 32, color: "#9ca3af", marginBottom: 16 }}>
          AI-Powered Book & Content Generator
        </div>
        <div style={{ fontSize: 22, color: "#6b7280", marginBottom: 40 }}>
          Books · Scripts · Theses · Courses · Comics
        </div>
        <div style={{ width: 200, height: 2, backgroundColor: "#6366f1", opacity: 0.5, borderRadius: 1, marginBottom: 40 }} />
        <div style={{ fontSize: 20, color: "#4b5563" }}>plotghost.ai</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

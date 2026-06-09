import { ImageResponse } from "next/og";
import { PRODUCT_HUNT_TAGLINE } from "@/lib/landing-copy";

export const alt = "Covalynce — Open-source AI spend visibility";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#030304",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 100 100" fill="none">
            <path d="M20 30 H65 V50" stroke="#66FCF1" strokeWidth="10" strokeLinecap="square" />
            <path d="M80 70 H35 V50" stroke="#66FCF1" strokeWidth="10" strokeLinecap="square" />
            <circle cx="50" cy="50" r="5" fill="#66FCF1" />
          </svg>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#f4f4f6", letterSpacing: "-0.03em" }}>
            Covalynce
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <p style={{ fontSize: 56, fontWeight: 700, color: "#f4f4f6", lineHeight: 1.08, margin: 0 }}>
            Know where your AI spend is going.
          </p>
          <p style={{ fontSize: 24, color: "#66FCF1", lineHeight: 1.4, margin: 0, opacity: 0.9 }}>
            {PRODUCT_HUNT_TAGLINE}
          </p>
        </div>

        <div style={{ display: "flex", gap: 32, fontSize: 18, color: "#888", fontWeight: 600 }}>
          <span>AI FinOps · Open Source · Self-host</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

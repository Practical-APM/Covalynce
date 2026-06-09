import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030304",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          <path d="M20 30 H65 V50" stroke="#66FCF1" strokeWidth="10" strokeLinecap="square" />
          <path d="M80 70 H35 V50" stroke="#66FCF1" strokeWidth="10" strokeLinecap="square" />
          <circle cx="50" cy="50" r="5" fill="#66FCF1" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#14342b" }}>
        <svg width="140" height="140" viewBox="0 0 64 64">
          <g stroke="#ecd99a" strokeWidth="3.2" strokeLinecap="round" fill="none">
            <path d="M32 14v36M16.4 23l31.2 18M16.4 41l31.2-18" />
            <path d="M27 17l5 5 5-5M27 47l5-5 5 5M17.5 29.5l6.8-1.8-1.8-6.8M46.5 34.5l-6.8 1.8 1.8 6.8M17.5 34.5l6.8 1.8-1.8 6.8M46.5 29.5l-6.8-1.8 1.8-6.8" />
          </g>
        </svg>
      </div>
    ),
    size
  );
}

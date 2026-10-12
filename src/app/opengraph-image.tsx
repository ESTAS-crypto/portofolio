import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const runtime = "edge";
export const alt = "Evan Atharasya · Portofolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom, #1b7fb3, #03111f)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            marginBottom: "16px",
            letterSpacing: "-0.03em",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#ffd9a0",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          {siteConfig.role}
        </div>
        <div
          style={{
            marginTop: "32px",
            padding: "8px 24px",
            borderRadius: "99px",
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            fontSize: "20px",
            color: "#bfe6fb",
          }}
        >
          Portofolio Interaktif · Web · AI · Creative Development
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

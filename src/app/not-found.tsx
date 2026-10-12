import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgb(27, 127, 179)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", fontWeight: 800 }}>404</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Halaman tidak ditemukan di kedalaman ini.
      </p>
      <Link
        href="/"
        style={{
          padding: "12px 24px",
          background: "rgba(255, 255, 255, 0.2)",
          color: "#fff",
          borderRadius: "99px",
          textDecoration: "none",
          fontWeight: 600,
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        Kembali ke Permukaan
      </Link>
    </div>
  );
}

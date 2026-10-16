import { NextResponse } from "next/server";

// In-memory rate limit store: ip -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // max 5 messages per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak pesan yang dikirim dari perangkat ini. Silakan coba lagi beberapa saat.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message, hp } = body;

    // Honeypot check: automated spambots filling hidden field
    if (hp && String(hp).trim().length > 0) {
      // Silently accept without dispatching email
      return NextResponse.json({ ok: true, note: "Pesan terkirim" });
    }

    // Input validations
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || cleanName.length < 2 || cleanName.length > 80) {
      return NextResponse.json(
        { error: "Nama pengirim wajib diisi (2 - 80 karakter)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Alamat email tidak valid." },
        { status: 400 }
      );
    }

    if (!cleanMessage || cleanMessage.length < 5 || cleanMessage.length > 3000) {
      return NextResponse.json(
        { error: "Pesan wajib diisi (5 - 3000 karakter)." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_TO || "evanatharasya@gmail.com";

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Portofolio Evan <onboarding@resend.dev>",
          to: [recipient],
          subject: `[Portofolio] Pesan dalam Botol dari ${cleanName}`,
          reply_to: cleanEmail,
          text: `Halo Evan,\n\nAda pesan baru dalam botol dari portofoliomu:\n\nNama: ${cleanName}\nEmail: ${cleanEmail}\nIP: ${ip}\nWaktu: ${new Date().toLocaleString("id-ID")}\n\nIsi Pesan:\n${cleanMessage}\n\n---\nKirim balasan langsung dengan membalas email ini.`,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Gagal mengirim via Resend:", errText);
        return NextResponse.json(
          {
            error:
              "Gagal mengirim email melalui layanan pengirim. Silakan hubungi langsung via email evanatharasya@gmail.com.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "Pesan dalam botol berhasil terkirim ke email Evan!",
      });
    }

    // Fallback when RESEND_API_KEY is not yet configured
    console.log(
      `[Contact Mock] From: ${cleanName} <${cleanEmail}> | Message: ${cleanMessage}`
    );

    return NextResponse.json({
      ok: true,
      mock: true,
      message:
        "Pesan tersimpan dalam botol (mode simulasi: tambahkan RESEND_API_KEY di Vercel untuk pengiriman email nyata).",
    });
  } catch (err) {
    console.error("Error in /api/contact:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat memproses pesan." },
      { status: 500 }
    );
  }
}

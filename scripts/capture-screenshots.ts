import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const projects = [
  {
    slug: "luvence-id",
    title: "LUVENCE ID",
    desc: "E-commerce parfum mewah dengan botol 3D interaktif",
    tags: ["React", "Three.js", "Supabase"],
    url: "https://luvence-id.vercel.app/",
    hue: 38,
  },
  {
    slug: "vendtrack",
    title: "VendTrack",
    desc: "Platform intelijen pasar Growtopia & radar moderator",
    tags: ["Next.js", "TypeScript", "Supabase"],
    url: "https://vend-finder.vercel.app/",
    hue: 215,
  },
  {
    slug: "laporan-kunjungan-rumah",
    title: "Laporan Kunjungan Rumah",
    desc: "Aplikasi Android offline-first petugas puskesmas",
    tags: ["Privat", "Flutter", "Supabase"],
    url: null,
    hue: 170,
  },
  {
    slug: "tryout-snbt",
    title: "Tryout SNBT",
    desc: "Platform simulasi ujian SNBT dengan 340+ soal latihan",
    tags: ["JavaScript", "HTML5", "CSS3"],
    url: null,
    hue: 200,
  },
  {
    slug: "genzmart-pro",
    title: "GenZMart PRO",
    desc: "Sistem e-commerce dan point of sale",
    tags: ["PHP", "MySQL", "Bootstrap"],
    url: null,
    hue: 280,
  },
  {
    slug: "nextjs-ai-chatbot",
    title: "AI Chatbot Next.js",
    desc: "Aplikasi chatbot cerdas berbasis Next.js App Router",
    tags: ["TypeScript", "Next.js", "AI SDK"],
    url: null,
    hue: 260,
  },
  {
    slug: "ai-gratis",
    title: "AI Gratis",
    desc: "Integrasi berbagai model AI gratis dan akses publik",
    tags: ["JavaScript", "API", "Web"],
    url: null,
    hue: 190,
  },
  {
    slug: "manajemen-keuangan",
    title: "Manajemen Keuangan",
    desc: "Aplikasi pencatatan arus kas dan anggaran pribadi",
    tags: ["PHP", "MySQL", "Chart.js"],
    url: null,
    hue: 140,
  },
  {
    slug: "track-location",
    title: "Track Location",
    desc: "Pemetaan dan pelacakan koordinat lokasi berbasis Python",
    tags: ["Python", "Flask", "Geolocation"],
    url: null,
    hue: 210,
  },
  {
    slug: "sistem-laporan",
    title: "Sistem Laporan",
    desc: "Portal pelaporan dan pemantauan data interaktif",
    tags: ["JavaScript", "Node.js", "Express"],
    url: null,
    hue: 330,
  },
];

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch (_) {
    try {
      browser = await chromium.launch({ channel: "msedge", headless: true });
    } catch (e) {
      browser = await chromium.launch({ headless: true });
    }
  }
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const publicDir = path.resolve(process.cwd(), "public/projects");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const p of projects) {
    const dir = path.join(publicDir, p.slug);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const targetFile = path.join(dir, "cover.png");

    if (p.url) {
      console.log(`[Capture Live] ${p.title} -> ${p.url}`);
      try {
        await page.goto(p.url, { waitUntil: "domcontentloaded", timeout: 18000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: targetFile });
        console.log(`✓ Saved ${targetFile}`);
        continue;
      } catch (err) {
        console.warn(`! Live capture failed for ${p.url}, generating crisp fallback cover.`, err);
      }
    }

    // Generate crisp 16:10 mockup cover
    console.log(`[Generate Cover] ${p.title} (${p.slug})`);
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1280px;
    height: 800px;
    background: radial-gradient(circle at 75% 25%, hsl(${p.hue}, 85%, 22%), hsl(${p.hue}, 90%, 8%) 65%, #030a14 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .window {
    position: absolute;
    left: 80px;
    right: 80px;
    top: 60px;
    bottom: 60px;
    border-radius: 20px;
    background: rgba(10, 25, 45, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(20px);
    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .chrome {
    height: 52px;
    background: rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 16px;
  }
  .dots { display: flex; gap: 8px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.r { background: #ff5f56; }
  .dot.y { background: #ffbd2e; }
  .dot.g { background: #27c93f; }
  .address {
    flex: 1;
    max-width: 500px;
    margin: 0 auto;
    height: 32px;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.3px;
  }
  .content {
    flex: 1;
    padding: 60px 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 99px;
    background: hsl(${p.hue}, 90%, 55%, 0.18);
    border: 1px solid hsl(${p.hue}, 90%, 65%, 0.4);
    color: hsl(${p.hue}, 90%, 75%);
    font-size: 14px;
    font-weight: 600;
    width: max-content;
    margin-bottom: 24px;
  }
  h1 {
    font-size: 56px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #ffffff 0%, hsl(${p.hue}, 90%, 80%) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p {
    font-size: 22px;
    line-height: 1.5;
    color: #cbd5e1;
    max-width: 800px;
    margin-bottom: 36px;
  }
  .tags {
    display: flex;
    gap: 12px;
  }
  .tag {
    padding: 8px 18px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-size: 15px;
    font-weight: 500;
    color: #e2e8f0;
  }
  .watermark {
    position: absolute;
    bottom: 24px;
    right: 32px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.5px;
  }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="window">
    <div class="chrome">
      <div class="dots">
        <div class="dot r"></div>
        <div class="dot y"></div>
        <div class="dot g"></div>
      </div>
      <div class="address">evan-atharasya.dev/projects/${p.slug}</div>
    </div>
    <div class="content">
      <div class="badge">${p.tags[0]} Showcase</div>
      <h1>${p.title}</h1>
      <p>${p.desc}</p>
      <div class="tags">
        ${p.tags.map((t) => `<div class="tag">${t}</div>`).join("")}
      </div>
    </div>
    <div class="watermark">Evan Atharasya · Project Archive</div>
  </div>
</body>
</html>`;

    await page.setContent(html);
    await page.screenshot({ path: targetFile });
    console.log(`✓ Saved ${targetFile}`);
  }

  await browser.close();
  console.log("All project covers generated successfully.");
}

main().catch(console.error);

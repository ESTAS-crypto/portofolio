import { CvData, CvPdfResult } from "./types";
import { CV_COLORS, CV_MONTH_NAMES_ID } from "./cvConfig";
import { buildCvData } from "./buildCvData";

export function makePDF(data?: CvData): CvPdfResult {
  const cv = data || buildCvData();

  const PW = 595;
  const PH = 842;
  const NAVY = CV_COLORS.NAVY;
  const GRAY = CV_COLORS.GRAY;
  const MUTE = CV_COLORS.MUTE;
  const SEA = CV_COLORS.SEA;
  const SEAD = CV_COLORS.SEAD;
  const GOLD = CV_COLORS.GOLD;
  const GOLD2 = CV_COLORS.GOLD2;
  const LINE = CV_COLORS.LINE;
  const CARD = CV_COLORS.CARD;
  const SKY = CV_COLORS.SKY;
  const WHITE = CV_COLORS.WHITE;

  // Glyph width tables for Helvetica (HW) and Helvetica-Bold (HB) for ASCII 32..126
  const HW = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
  ];

  const HB = [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
    975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
    333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
    611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
  ];

  const sw = (s: string, z: number, b?: boolean | number, sp?: number): number => {
    let w = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i) - 32;
      w += (b ? HB : HW)[c >= 0 && c < 95 ? c : 0];
    }
    return (w * z) / 1000 + (sp || 0) * s.length;
  };

  const f = (n: number) => String(Math.round(n * 100) / 100);

  const hx = (h: string) => {
    const n = parseInt(h.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
      .map((v) => f(v))
      .join(" ");
  };

  const esc = (t: string) =>
    t
      .replace(/[^\x20-\x7e]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  let C: string[] = [];
  const SB: string[] = [];
  const MN: string[] = [];
  const links: [number, number, number, number, string][] = [];

  const op = (s: string) => C.push(s);
  const fill = (h: string) => op(hx(h) + " rg");
  const strk = (h: string) => op(hx(h) + " RG");
  const al = (i: number) => op("/G" + i + " gs");
  const Q0 = () => op("q");
  const Q1 = () => op("Q");

  const rect = (x: number, y: number, w: number, h: number) =>
    op(f(x) + " " + f(y) + " " + f(w) + " " + f(h) + " re f");

  const K = 0.5523;
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    r = Math.min(r, w / 2, h / 2);
    const k = r * (1 - K);
    const a = [
      x + r, y, x + w - r, y, x + w - k, y, x + w, y + k,
      x + w, y + r, x + w, y + h - r, x + w, y + h - k, x + w - k, y + h,
      x + w - r, y + h, x + r, y + h, x + k, y + h, x, y + h - k,
      x, y + h - r, x, y + r, x, y + k, x + k, y, x + r, y,
    ].map(f);
    op(
      a[0] + " " + a[1] + " m " + a[2] + " " + a[3] + " l " + a[4] + " " + a[5] + " " +
      a[6] + " " + a[7] + " " + a[8] + " " + a[9] + " c " + a[10] + " " + a[11] + " l " +
      a[12] + " " + a[13] + " " + a[14] + " " + a[15] + " " + a[16] + " " + a[17] + " c " +
      a[18] + " " + a[19] + " l " + a[20] + " " + a[21] + " " + a[22] + " " + a[23] + " " +
      a[24] + " " + a[25] + " c " + a[26] + " " + a[27] + " l " + a[28] + " " + a[29] + " " +
      a[30] + " " + a[31] + " " + a[32] + " " + a[33] + " c f"
    );
  };

  const circ = (cx: number, cy: number, r: number) => rr(cx - r, cy - r, 2 * r, 2 * r, r);

  const tx = (
    s: string,
    x: number,
    y: number,
    z: number,
    b: boolean | number,
    col: string,
    sp?: number,
    it?: boolean
  ) => {
    fill(col);
    op(
      "BT /F" +
        (it ? 3 : b ? 2 : 1) +
        " " +
        f(z) +
        " Tf " +
        f(sp || 0) +
        " Tc " +
        f(x) +
        " " +
        f(y) +
        " Td (" +
        esc(s) +
        ") Tj ET"
    );
  };

  const lk = (x: number, y: number, w: number, h: number, u: string) =>
    links.push([x, y, x + w, y + h, u]);

  const wrap = (s: string, maxW: number, z: number, b?: boolean | number) => {
    const o: string[] = [];
    let l = "";
    for (const w of s.split(" ")) {
      const t = l ? l + " " + w : w;
      if (l && sw(t, z, b) > maxW) {
        o.push(l);
        l = w;
      } else l = t;
    }
    if (l) o.push(l);
    return o;
  };

  const fit = (s: string, maxW: number, z: number, b?: boolean | number) => {
    while (z > 6 && sw(s, z, b) > maxW) z -= 0.25;
    return z;
  };

  const chip = (
    s: string,
    x: number,
    y: number,
    z: number,
    tc: string,
    bg: string,
    a?: number,
    ph?: number
  ) => {
    ph = ph || 5;
    const h = z + 6;
    const w = sw(s, z, 0) + 2 * ph;
    if (a) {
      Q0();
      al(a);
    }
    fill(bg);
    rr(x, y, w, h, h / 2);
    if (a) Q1();
    tx(s, x + ph, y + (h - z * 0.72) / 2, z, 0, tc);
    return w;
  };

  const wave = (
    base: number,
    amp: number,
    len: number,
    ph: number,
    a: number,
    col: string
  ) => {
    Q0();
    op("0 0 192 842 re W n");
    al(a);
    fill(col);
    let s = "0 " + f(base + amp * Math.sin(ph)) + " m ";
    for (let x = 4; x <= 192; x += 4) {
      s += f(x) + " " + f(base + amp * Math.sin(ph + (x / len) * 6.2832)) + " l ";
    }
    op(s + "192 0 l 0 0 l f");
    Q1();
  };

  // ================= SIDEBAR (digambar ke SB, dimasukkan setelah kolom utama) =================
  C = SB;
  fill(NAVY);
  rect(0, 0, 192, PH);
  Q0();
  op("0 0 192 842 re W n");
  al(1);
  fill(GOLD);
  circ(176, 820, 86);
  al(2);
  circ(176, 820, 52);
  Q1();

  wave(110, 7, 120, 0.4, 3, SEA);
  wave(84, 6, 96, 1.6, 4, SEA);
  wave(58, 6, 140, 3.1, 5, SEA);
  wave(30, 5, 110, 4.4, 4, SKY);

  const monogram = cv.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  fill(GOLD);
  circ(96, 764, 31);
  tx(monogram, 96 - sw(monogram, 25, 1, 0.5) / 2, 764 - 9, 25, 1, NAVY, 0.5);

  let y = PH - 146;
  const SX = 22;
  const SW = 148;
  const sh = (t: string) => {
    tx(t, SX, y, 7.4, 1, GOLD, 1.8);
    Q0();
    al(3);
    strk(GOLD);
    op("0.6 w " + SX + " " + f(y - 5) + " m " + (SX + SW) + " " + f(y - 5) + " l S");
    Q1();
    y -= 20;
  };

  sh("KONTAK");
  cv.contacts.forEach((c) => {
    tx(c.type, SX, y, 6.4, 1, SKY, 1.3);
    const z = fit(c.display, SW, 8.6, 0);
    tx(c.display, SX, y - 11, z, 0, WHITE);
    lk(SX, y - 13, sw(c.display, z, 0), z + 3, c.url);
    y -= 29;
  });

  y -= 8;
  sh("KEAHLIAN");
  cv.skillGroups.forEach((g) => {
    tx(g.category, SX, y, 6.4, 1, SKY, 1.3);
    y -= 17;
    let x = SX;
    g.skills.forEach((s) => {
      const w = sw(s, 7.6, 0) + 10;
      if (x + w > SX + SW) {
        x = SX;
        y -= 17;
      }
      chip(s, x, y, 7.6, WHITE, WHITE, 2);
      x += w + 4;
    });
    y -= 28;
  });

  y -= 4;
  sh("SEKILAS");
  cv.stats.forEach((s) => {
    tx(s.value, SX, y - 14, 22, 1, GOLD);
    tx(s.label, SX + sw(s.value, 22, 1) + 8, y - 12, 8, 0, WHITE);
    y -= 30;
  });

  tx(cv.sidebarQuote1, SX, 134, 8.6, 0, GOLD, 0, true);
  tx(cv.sidebarQuote2, SX, 122, 7.4, 0, SKY);
  lk(SX, 120, sw(cv.sidebarQuote2, 7.4, 0), 9, cv.sidebarQuote2Url);

  // ================= UTAMA (urutan baca pertama) =================
  C = MN;
  const MX = 222;
  const MW = 333;
  let t = PH - 50;

  tx(cv.name, MX, t - 24, 31, 1, NAVY, -0.3);
  tx(cv.role, MX, t - 44, 9.4, 1, SEA, 2.3);
  fill(GOLD2);
  rect(MX, t - 58, 38, 3);
  tx(cv.country, MX + 48, t - 60, 8.2, 0, MUTE);
  t -= 84;

  const sec = (title: string) => {
    tx(title, MX, t, 8.2, 1, NAVY, 1.8);
    const w = sw(title, 8.2, 1, 1.8) + 10;
    Q0();
    strk(LINE);
    op("0.8 w " + f(MX + w) + " " + f(t + 2.6) + " m " + (MX + MW) + " " + f(t + 2.6) + " l S");
    Q1();
    t -= 18;
  };

  sec("RINGKASAN");
  wrap(cv.summary, MW, 9.2, 0).forEach((l) => {
    tx(l, MX, t, 9.2, 0, GRAY);
    t -= 13.4;
  });

  t -= 12;
  sec("PROYEK UNGGULAN");
  cv.featuredProjects.forEach((p) => {
    const pad = 10;
    const iw = MW - pad * 2 - 6;
    const lines = wrap(p.description, iw, 8.5, 0);
    const lw = sw("HASIL", 6.4, 1, 1.2) + 8;
    const rl = wrap(p.result, iw - lw, 8.3, 0);
    const h =
      pad +
      13 +
      19 +
      lines.length * 11.6 +
      4 +
      rl.length * 11.2 +
      (p.displayUrl ? 15 : 4) +
      pad -
      4;
    const top = t;

    Q0();
    fill(CARD);
    rr(MX, top - h, MW, h, 6);
    Q1();

    Q0();
    fill(p.accentColor);
    rr(MX, top - h, 3.4, h, 1.7);
    Q1();

    let cy = top - pad - 9;
    tx(p.title, MX + pad + 4, cy, 10.8, 1, NAVY);

    cy -= 19;
    let cx = MX + pad + 4;
    p.tags.forEach((s) => {
      cx += chip(s, cx, cy - 3.4, 7, SEAD, "#DCEBF5", 0, 4.5) + 4;
    });

    cy -= 14;
    lines.forEach((l) => {
      tx(l, MX + pad + 4, cy, 8.5, 0, GRAY);
      cy -= 11.6;
    });

    cy -= 3;
    tx("HASIL", MX + pad + 4, cy, 6.4, 1, "#9A6412", 1.2);
    rl.forEach((l) => {
      tx(l, MX + pad + 4 + lw, cy, 8.3, 0, GRAY);
      cy -= 11.2;
    });

    if (p.displayUrl) {
      tx(p.displayUrl, MX + pad + 4, cy - 2, 8, 1, SEAD);
      lk(MX + pad + 4, cy - 4, sw(p.displayUrl, 8, 1), 10, p.url);
    }

    t -= h + 9;
  });

  t -= 6;
  sec("PROYEK LAINNYA");
  const rowsFit = (ex: number) => Math.max(0, Math.floor((t - 32 - 56 - ex) / 46) + 1);
  let shownN = cv.otherProjects.length;
  if (Math.ceil(cv.otherProjects.length / 2) > rowsFit(0)) {
    shownN = Math.min(cv.otherProjects.length, rowsFit(14) * 2);
  }

  cv.otherProjects.slice(0, shownN).forEach((o, i) => {
    const col = i % 2;
    const row = i >> 1;
    const x = MX + col * (MW / 2 + 4);
    const yy = t - row * 46;

    fill(o.dotColor);
    circ(x + 3, yy + 3, 3);
    tx(o.title, x + 12, yy, 8.8, 1, NAVY);
    tx(o.tech, x + 12, yy - 10.5, 7.2, 1, SEAD);
    wrap(o.description, MW / 2 - 18, 7.6, 0).forEach((l, j) =>
      tx(l, x + 12, yy - 21 - j * 9.6, 7.6, 0, GRAY)
    );
    lk(x + 10, yy - 34, MW / 2 - 14, 46, o.url);
  });

  const rowsUsed = Math.ceil(shownN / 2);
  if (shownN < cv.otherProjects.length) {
    const nt = "+" + (cv.otherProjects.length - shownN) + " proyek lainnya di portofolio";
    tx(nt, MX, t - rowsUsed * 46 + 6, 7.8, 0, MUTE, 0, true);
    lk(MX, t - rowsUsed * 46 + 4, sw(nt, 7.8, 0), 10, cv.footerUrl);
  }
  t -= rowsUsed * 46 + 4;

  Q0();
  strk(LINE);
  op("0.8 w " + MX + " 44 m " + (MX + MW) + " 44 l S");
  Q1();

  tx(cv.footerNote, MX, 30, 7.6, 0, MUTE);
  const u = cv.footerDisplayUrl;
  tx(u, MX + sw(cv.footerNote + " ", 7.6, 0), 30, 7.6, 1, SEAD);
  lk(MX + sw(cv.footerNote + " ", 7.6, 0), 28, sw(u, 7.6, 1), 10, cv.footerUrl);

  const dn = cv.updatedDate || new Date();
  tx(
    "Diperbarui " + CV_MONTH_NAMES_ID[dn.getMonth()] + " " + dn.getFullYear(),
    MX,
    19,
    7,
    0,
    MUTE
  );

  // ================= PDF =================
  const ALPHA = [0.08, 0.12, 0.18, 0.26, 0.38];
  const objs: string[] = [];
  const add = (o: string) => objs.push(o);

  add("<< /Type /Catalog /Pages 2 0 R /Lang (" + esc(cv.meta.lang) + ") >>");
  add("");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>");
  add(
    "<< /Title (" +
      esc(cv.meta.title) +
      ") /Author (" +
      esc(cv.meta.author) +
      ") /Subject (" +
      esc(cv.meta.subject) +
      ") /Keywords (" +
      esc(cv.meta.keywords) +
      ") >>"
  );

  ALPHA.forEach((a) => add("<< /Type /ExtGState /ca " + a + " /CA " + a + " >>"));

  const body = MN.concat(SB).join("\n");
  add("<< /Length " + body.length + " >>\nstream\n" + body + "\nendstream");
  const content = objs.length;

  const annots = links.map((l) => {
    add(
      "<< /Type /Annot /Subtype /Link /Rect [" +
        [l[0], l[1], l[2], l[3]].map(f).join(" ") +
        "] /Border [0 0 0] /A << /S /URI /URI (" +
        esc(l[4]) +
        ") >> >>"
    );
    return objs.length + " 0 R";
  });

  add(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
      PW +
      " " +
      PH +
      "] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> /ExtGState << /G1 7 0 R /G2 8 0 R /G3 9 0 R /G4 10 0 R /G5 11 0 R >> >> /Contents " +
      content +
      " 0 R /Annots [" +
      annots.join(" ") +
      "] >>"
  );

  objs[1] = "<< /Type /Pages /Count 1 /Kids [" + objs.length + " 0 R] >>";

  let out = "%PDF-1.4\n";
  const off: number[] = [];
  objs.forEach((o, i) => {
    off.push(out.length);
    out += i + 1 + " 0 obj\n" + o + "\nendobj\n";
  });
  const xr = out.length;
  out +=
    "xref\n0 " +
    (objs.length + 1) +
    "\n0000000000 65535 f \n" +
    off.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("") +
    "trailer\n<< /Size " +
    (objs.length + 1) +
    " /Root 1 0 R /Info 6 0 R >>\nstartxref\n" +
    xr +
    "\n%%EOF\n";

  return {
    bytes: new TextEncoder().encode(out),
    endY: t,
  };
}

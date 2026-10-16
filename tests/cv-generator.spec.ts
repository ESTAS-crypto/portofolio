import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { makePDF } from "../src/lib/cv/makePdf";
import { buildCvData } from "../src/lib/cv/buildCvData";
import { CvData, CvOtherProject } from "../src/lib/cv/types";

test.describe("CV Generator Unit & Regression Tests", () => {
  test("generates byte-identical PDF matching reference/cv-contoh.pdf", async () => {
    // Fixed date matching October 2026 for exact byte-for-byte comparison
    const fixedDate = new Date(2026, 9, 1);
    const cvData = buildCvData(fixedDate);
    const result = makePDF(cvData);

    expect(result.bytes.length).toBe(25535);
    expect(result.endY).toBe(54);

    const refPdfPath = path.resolve(process.cwd(), "reference/cv-contoh.pdf");
    const refBuffer = fs.readFileSync(refPdfPath);

    expect(Buffer.from(result.bytes).equals(refBuffer)).toBe(true);
  });

  test("contains exactly 16 link annotations, correct metadata, and reading order", async () => {
    const fixedDate = new Date(2026, 9, 1);
    const result = makePDF(buildCvData(fixedDate));
    const pdfText = Buffer.from(result.bytes).toString("latin1");

    // PDF 1.4 header
    expect(pdfText.startsWith("%PDF-1.4")).toBe(true);

    // Title and author
    expect(pdfText).toContain("/Title (CV Evan Atharasya - Full-stack Developer)");
    expect(pdfText).toContain("/Author (Evan Atharasya)");
    expect(pdfText).toContain("/Lang (id-ID)");

    // Count Link Annotations
    const linkMatches = pdfText.match(/\/Subtype \/Link/g);
    expect(linkMatches?.length).toBe(16);

    // Reading order check: Main column content stream precedes Sidebar content stream
    const nameIndex = pdfText.indexOf("(Evan Atharasya) Tj");
    const roleIndex = pdfText.indexOf("(FULL-STACK DEVELOPER) Tj");
    const kontakIndex = pdfText.indexOf("(KONTAK) Tj");

    expect(nameIndex).toBeGreaterThan(-1);
    expect(roleIndex).toBeGreaterThan(nameIndex);
    // Name and role in main column must appear in stream BEFORE sidebar KONTAK
    expect(roleIndex).toBeLessThan(kontakIndex);
  });

  test("overflow guard: handles 4 additional mock projects (+3 di portofolio)", async () => {
    const baseData = buildCvData();
    const mockProjects: CvOtherProject[] = [
      {
        title: "Mock Project Alpha",
        tech: "TypeScript",
        dotColor: "#3B82C4",
        url: "https://github.com/mock/alpha",
        description: "Simulasi proyek tambahan untuk uji pengaman.",
      },
      {
        title: "Mock Project Beta",
        tech: "Python",
        dotColor: "#3B7DA8",
        url: "https://github.com/mock/beta",
        description: "Alat pengujian responsif.",
      },
      {
        title: "Mock Project Gamma",
        tech: "PHP",
        dotColor: "#7A86B8",
        url: "https://github.com/mock/gamma",
        description: "Aplikasi backend tambahan.",
      },
      {
        title: "Mock Project Delta",
        tech: "JavaScript",
        dotColor: "#E8C547",
        url: "https://github.com/mock/delta",
        description: "Modul interaktif klien.",
      },
    ];

    const testData: CvData = {
      ...baseData,
      otherProjects: [...baseData.otherProjects, ...mockProjects], // 7 + 4 = 11 projects
    };

    const res = makePDF(testData);
    const pdfText = Buffer.from(res.bytes).toString("latin1");

    // Must show +3 proyek lainnya di portofolio
    expect(pdfText).toContain("+3 proyek lainnya di portofolio");
    // Footer remains clear and above page baseline
    expect(res.endY).toBeGreaterThanOrEqual(44);
  });

  test("overflow guard: handles 9 additional mock projects (+8 di portofolio)", async () => {
    const baseData = buildCvData();
    const mockProjects: CvOtherProject[] = Array.from({ length: 9 }, (_, i) => ({
      title: `Mock Project ${i + 1}`,
      tech: "TypeScript",
      dotColor: "#3B82C4",
      url: `https://github.com/mock/${i + 1}`,
      description: `Deskripsi proyek mock ${i + 1}.`,
    }));

    const testData: CvData = {
      ...baseData,
      otherProjects: [...baseData.otherProjects, ...mockProjects], // 7 + 9 = 16 projects
    };

    const res = makePDF(testData);
    const pdfText = Buffer.from(res.bytes).toString("latin1");

    // Must show +8 proyek lainnya di portofolio
    expect(pdfText).toContain("+8 proyek lainnya di portofolio");
    expect(res.endY).toBeGreaterThanOrEqual(44);
  });

  test("browser integration: clicking #cvBtn downloads Evan-Atharasya-CV.pdf", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Open recruiter modal
    const sumBtn = page.locator("#sumBtn");
    await sumBtn.click();

    const modal = page.locator("#sumOv");
    await expect(modal).toBeVisible();

    const cvBtn = page.locator("#cvBtn");
    await expect(cvBtn).toBeVisible();
    await expect(cvBtn).toContainText("Unduh CV (PDF)");

    // Listen for download event
    const downloadPromise = page.waitForEvent("download");
    await cvBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Evan-Atharasya-CV.pdf");

    // Read download stream
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    if (stream) {
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
    }
    const downloadedBuffer = Buffer.concat(chunks);

    // Verify it is a valid PDF 1.4
    expect(downloadedBuffer.toString("latin1").startsWith("%PDF-1.4")).toBe(true);
    expect(downloadedBuffer.length).toBe(25535);

    // Close modal
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });
});


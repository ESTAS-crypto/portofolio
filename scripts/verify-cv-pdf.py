import os
import sys
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image, ImageChops

def main():
    pdf_path = "reference/cv-contoh.pdf"
    preview_path = "reference/cv-preview.png"

    print("=== Testing with pypdf ===")
    reader = PdfReader(pdf_path)

    # 1. Page count
    page_count = len(reader.pages)
    print(f"Page count: {page_count}")
    assert page_count == 1, f"Expected 1 page, got {page_count}"

    page = reader.pages[0]

    # 2. Metadata
    meta = reader.metadata
    print(f"Title: {meta.title}")
    print(f"Author: {meta.author}")
    assert meta.title == "CV Evan Atharasya - Full-stack Developer"
    assert meta.author == "Evan Atharasya"

    # 3. Annotations
    annots = page.get("/Annots")
    annot_count = len(annots) if annots else 0
    print(f"Annotations count: {annot_count}")
    assert annot_count == 16, f"Expected 16 annotations, got {annot_count}"

    # 4. Text extraction and reading order
    text = page.extract_text()
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    print(f"First 5 extracted text lines:")
    for l in lines[:5]:
        print("  -", l)

    assert lines[0] == "Evan Atharasya", f"Expected first line 'Evan Atharasya', got '{lines[0]}'"
    assert "FULL-STACK DEVELOPER" in lines[1], f"Expected second line to contain 'FULL-STACK DEVELOPER', got '{lines[1]}'"

    # 5. Visual Render Comparison at 110 DPI
    print("\n=== Visual Render Comparison with pypdfium2 ===")
    pdf = pdfium.PdfDocument(pdf_path)
    rendered_img = pdf[0].render(scale=110/72).to_pil()
    ref_img = Image.open(preview_path)

    assert rendered_img.size == ref_img.size, f"Size mismatch: {rendered_img.size} vs {ref_img.size}"

    diff = ImageChops.difference(rendered_img.convert("RGB"), ref_img.convert("RGB"))
    bbox = diff.getbbox()
    if bbox is None:
        print("Pixel comparison: 100% PERFECT MATCH (0 pixel difference)!")
    else:
        # Calculate diff percentage
        diff_pixels = sum(1 for pixel in diff.getdata() if any(c > 0 for c in pixel))
        total_pixels = rendered_img.size[0] * rendered_img.size[1]
        diff_pct = (diff_pixels / total_pixels) * 100
        print(f"Diff bounding box: {bbox}, diff pixels: {diff_pixels}/{total_pixels} ({diff_pct:.4f}%)")
        assert diff_pct < 0.01, f"Visual difference {diff_pct}% exceeded tolerance"

    print("\nALL VERIFICATIONS PASSED!")

if __name__ == "__main__":
    main()

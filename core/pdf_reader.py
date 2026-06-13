"""
PDF Reader — Extract text from every page of a PDF.
Uses: pdfplumber (data extraction)
"""
import pdfplumber


def extract_pages(pdf_path: str) -> list[tuple[int, str]]:
    """Returns list of (page_number, text)"""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if text and text.strip():
                pages.append((i, text.strip()))
    return pages

"""
Text Chunker — Split pages into overlapping sentence chunks.
"""
import re


def chunk_pages(pages: list[tuple[int, str]], size=5, overlap=2) -> list[dict]:
    chunks = []
    step = max(1, size - overlap)
    for page_num, text in pages:
        sentences = re.split(r'(?<=[.?!])\s+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        for i in range(0, len(sentences), step):
            window = sentences[i: i + size]
            if window:
                chunks.append({
                    "page": page_num,
                    "text": " ".join(window),
                    "char_count": len(" ".join(window)),
                    "word_count": len(" ".join(window).split()),
                })
    return chunks

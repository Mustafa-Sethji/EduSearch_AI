"""
OCR — Extract text from question images using Tesseract.
Uses: Pillow (image processing), pytesseract (OCR)
"""
import pytesseract
from PIL import Image, ImageFilter, ImageOps


def image_to_text(image_path: str) -> str:
    img = Image.open(image_path).convert("L")
    img = ImageOps.autocontrast(img)
    img = img.filter(ImageFilter.SHARPEN)
    return pytesseract.image_to_string(img, config="--oem 3 --psm 6").strip()

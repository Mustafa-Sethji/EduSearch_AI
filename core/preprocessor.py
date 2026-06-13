"""
Text Preprocessor
- Lowercasing
- Removing special characters
- Removing stopwords
- Tokenization
"""
import re
import unicodedata

# Basic English stopwords (no nltk dependency needed)
STOPWORDS = {
    "a","an","the","is","are","was","were","be","been","being",
    "have","has","had","do","does","did","will","would","could",
    "should","may","might","shall","can","need","dare","ought",
    "in","on","at","to","for","of","with","by","from","up","about",
    "into","through","during","before","after","above","below",
    "between","out","off","over","under","again","then","once",
    "and","but","or","nor","so","yet","both","either","neither",
    "not","no","nor","as","if","than","that","this","these","those",
    "i","me","my","we","our","you","your","he","his","she","her",
    "it","its","they","their","what","which","who","whom","how",
    "all","each","every","some","any","few","more","most","other",
}


def clean_text(text: str) -> str:
    """Full preprocessing pipeline"""
    # Normalize unicode
    text = unicodedata.normalize("NFKC", text)
    # Lowercase
    text = text.lower()
    # Remove special chars, keep alphanumeric + spaces
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()
    # Remove stopwords
    tokens = [w for w in text.split() if w not in STOPWORDS and len(w) > 1]
    return " ".join(tokens)


def tokenize(text: str) -> list[str]:
    return clean_text(text).split()

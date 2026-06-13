"""
Vectorizer
  - Feature Engineering  → TF-IDF converts text to numbers
  - PCA                  → Reduces high-dimensional vectors to smaller size
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD   # PCA for sparse matrices


def build_tfidf(texts: list[str], max_features=5000):
    """
    TF-IDF Vectorization
    TF  = how often word appears in a chunk
    IDF = penalizes common words across all chunks
    Result: each chunk becomes a numeric vector
    """
    vec = TfidfVectorizer(
        max_features=max_features,
        ngram_range=(1, 2),
        strip_accents="unicode",
        lowercase=True,
        max_df=0.85,
        min_df=2,
        sublinear_tf=True,
    )
    matrix = vec.fit_transform(texts)
    return vec, matrix


def apply_pca(matrix, n_components=100):
    """
    PCA (TruncatedSVD for sparse matrices)
    Reduces dimensions: e.g. 5000 → 100
    Keeps the most important information
    Makes similarity search faster
    """
    n = min(n_components, matrix.shape[1] - 1, matrix.shape[0] - 1)
    svd = TruncatedSVD(n_components=n, random_state=42)
    reduced = svd.fit_transform(matrix)
    explained = svd.explained_variance_ratio_.sum()
    return svd, reduced, explained

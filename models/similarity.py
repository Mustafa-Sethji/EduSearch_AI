"""
Similarity Search
"""
import numpy as np
from sklearn.neighbors import NearestNeighbors


def knn_search(query_vec, reduced_matrix, chunks, top_k=10):
    """
    KNN Search
    Fits K-Nearest Neighbors model on PCA-reduced vectors.
    Finds the K closest chunks by cosine distance.
    Score = 1 - distance (higher = more similar).
    """
    k = min(top_k * 3, len(chunks))
    knn = NearestNeighbors(n_neighbors=k, metric="cosine", algorithm="brute")
    knn.fit(reduced_matrix)

    distances, indices = knn.kneighbors(query_vec)

    seen, results = set(), []
    for dist, idx in zip(distances[0], indices[0]):
        score = round(1 - float(dist), 4)
        if score <= 0:
            continue
        page = chunks[idx]["page"]
        if page in seen:
            continue
        seen.add(page)
        results.append({
            "page": page,
            "score": score,
            "snippet": chunks[idx]["text"][:300],
            "method": "KNN",
        })
        if len(results) >= top_k:
            break
    return results

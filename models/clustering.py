"""
Clustering
  - K-Means Clustering → group similar chunks automatically
  - Used to show which TOPIC/CHAPTER a matched page belongs to
"""
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import normalize


def cluster_chunks(reduced_matrix, n_clusters=8):
    """
    K-Means Clustering
    Automatically groups all book chunks into N clusters (topics).
    Each cluster = a different topic/chapter theme.
    """
    n = min(n_clusters, len(reduced_matrix) - 1)
    km = KMeans(n_clusters=n, random_state=42, n_init=10)
    labels = km.fit_predict(reduced_matrix)
    return km, labels


def get_cluster_label(cluster_id: int) -> str:
    """Human-friendly cluster names"""
    names = [
        "Topic A", "Topic B", "Topic C", "Topic D",
        "Topic E", "Topic F", "Topic G", "Topic H",
        "Topic I", "Topic J", "Topic K", "Topic L",
    ]
    return names[cluster_id % len(names)]

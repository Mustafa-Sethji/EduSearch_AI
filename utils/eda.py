"""
EDA (Exploratory Data Analysis)
"""
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import io


def chunks_to_df(chunks: list[dict]) -> pd.DataFrame:
    return pd.DataFrame(chunks)


def plot_page_distribution(df: pd.DataFrame) -> bytes:
    fig, ax = plt.subplots(figsize=(8, 3))
    ax.hist(df["page"], bins=min(40, df["page"].nunique()),
            color="#2563eb", edgecolor="white", linewidth=0.5)
    ax.set_xlabel("Page Number", fontsize=10)
    ax.set_ylabel("Number of Chunks", fontsize=10)
    ax.set_title("Content Distribution Across Pages", fontsize=12, fontweight="bold")
    ax.spines[["top","right"]].set_visible(False)
    plt.tight_layout()
    buf = io.BytesIO(); plt.savefig(buf, format="png", dpi=120); buf.seek(0)
    plt.close(); return buf.read()


def plot_word_count_distribution(df: pd.DataFrame) -> bytes:
    fig, ax = plt.subplots(figsize=(8, 3))
    ax.hist(df["word_count"], bins=30, color="#7c3aed", edgecolor="white", linewidth=0.5)
    ax.set_xlabel("Words per Chunk", fontsize=10)
    ax.set_ylabel("Frequency", fontsize=10)
    ax.set_title("Word Count Distribution (per Chunk)", fontsize=12, fontweight="bold")
    ax.spines[["top","right"]].set_visible(False)
    plt.tight_layout()
    buf = io.BytesIO(); plt.savefig(buf, format="png", dpi=120); buf.seek(0)
    plt.close(); return buf.read()


def plot_difficulty_distribution(chunks: list[dict]) -> bytes:
    from models.classifiers import assign_difficulty
    labels = [assign_difficulty(c) for c in chunks]
    counts = pd.Series(labels).value_counts()
    colors = {"Easy": "#10b981", "Medium": "#f59e0b", "Hard": "#ef4444"}
    fig, ax = plt.subplots(figsize=(5, 3))
    bars = ax.bar(counts.index, counts.values,
                  color=[colors.get(l, "#6b7280") for l in counts.index],
                  edgecolor="white", linewidth=0.5)
    ax.set_title("Content Difficulty Distribution", fontsize=12, fontweight="bold")
    ax.set_ylabel("Number of Chunks")
    ax.spines[["top","right"]].set_visible(False)
    for bar, val in zip(bars, counts.values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                str(val), ha="center", fontsize=9)
    plt.tight_layout()
    buf = io.BytesIO(); plt.savefig(buf, format="png", dpi=120); buf.seek(0)
    plt.close(); return buf.read()


def plot_subject_distribution(chunks: list[dict]) -> bytes:
    from models.classifiers import assign_subject
    labels = [assign_subject(c) for c in chunks]
    counts = pd.Series(labels).value_counts()
    fig, ax = plt.subplots(figsize=(7, 3))
    ax.barh(counts.index[:8], counts.values[:8], color="#0f3460", edgecolor="white")
    ax.set_title("Subject Distribution", fontsize=12, fontweight="bold")
    ax.set_xlabel("Number of Chunks")
    ax.spines[["top","right"]].set_visible(False)
    plt.tight_layout()
    buf = io.BytesIO(); plt.savefig(buf, format="png", dpi=120); buf.seek(0)
    plt.close(); return buf.read()


def get_summary_stats(df: pd.DataFrame, pages: list) -> dict:
    return {
        "total_pages": len(pages),
        "total_chunks": len(df),
        "avg_words": round(df["word_count"].mean(), 1),
        "max_words": int(df["word_count"].max()),
        "min_words": int(df["word_count"].min()),
        "total_words": int(df["word_count"].sum()),
    }

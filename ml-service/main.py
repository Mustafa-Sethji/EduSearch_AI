"""
EduSearch ML Microservice — FastAPI wrapper around the ML pipeline.
"""
import os
import sys
import shutil
import tempfile
import uvicorn  # Added for production startup
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from core.pdf_reader import extract_pages
from core.ocr import image_to_text
from core.chunker import chunk_pages
from core.preprocessor import clean_text
from models.vectorizer import build_tfidf, apply_pca
from models.similarity import knn_search
from models.clustering import cluster_chunks
from models.classifiers import (
    assign_difficulty, assign_subject, train_classifiers, predict_chunk
)
from utils.store import save, load, exists, clear

app = FastAPI(title="EduSearch ML Service", version="1.0.0")

# Updated CORS for production flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = ROOT / "data" / "processed"
DATA_DIR.mkdir(parents=True, exist_ok=True)

N_CLUSTERS = 6
PCA_COMPONENTS = 100


def artifact_prefix(book_id: int) -> str:
    return f"book_{book_id}_"


def save_book_artifacts(book_id: int, state: dict):
    prefix = artifact_prefix(book_id)
    for key, fname in [
        ("chunks", "chunks.pkl"), ("tfidf_mat", "tfidf_mat.pkl"),
        ("tfidf_vec", "vec.pkl"), ("svd", "svd.pkl"),
        ("reduced_mat", "reduced.pkl"), ("cluster_model", "cluster_model.pkl"),
        ("cluster_labels", "cluster_labels.pkl"), ("classifiers", "classifiers.pkl"),
        ("book_name", "book_name.pkl"), ("pages", "pages.pkl"),
    ]:
        path = DATA_DIR / f"{prefix}{fname}"
        import pickle
        with open(path, "wb") as f:
            pickle.dump(state[key], f)


def load_book_artifacts(book_id: int) -> dict:
    prefix = artifact_prefix(book_id)
    import pickle
    keys = ["chunks", "tfidf_mat", "tfidf_vec", "svd", "reduced_mat",
            "cluster_model", "cluster_labels", "classifiers", "book_name", "pages"]
    state = {}
    for key in keys:
        fname = {"tfidf_vec": "vec.pkl", "reduced_mat": "reduced.pkl"}.get(key, f"{key}.pkl")
        path = DATA_DIR / f"{prefix}{fname}"
        if not path.exists():
            raise FileNotFoundError(f"Artifact missing: {path}")
        with open(path, "rb") as f:
            state[key] = pickle.load(f)
    return state


def delete_book_artifacts(book_id: int):
    prefix = artifact_prefix(book_id)
    for f in DATA_DIR.glob(f"{prefix}*"):
        f.unlink(missing_ok=True)


class SearchRequest(BaseModel):
    book_id: int
    query: str
    top_k: int = 8


@app.get("/health")
def health():
    return {"status": "ok", "service": "ml"}


@app.post("/api/build")
async def build_index(book_id: int = Form(...), pdf: UploadFile = File(...)):
    suffix = Path(pdf.filename or "book.pdf").suffix or ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await pdf.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        pages = extract_pages(tmp_path)
        if not pages:
            raise HTTPException(400, "No text extracted from PDF")

        chunks = chunk_pages(pages)
        for c in chunks:
            c["clean_text"] = clean_text(c["text"])
            c["difficulty"] = assign_difficulty(c)
            c["subject"] = assign_subject(c)

        tfidf_vec, tfidf_mat = build_tfidf([c["clean_text"] for c in chunks])
        svd, reduced_mat, _ = apply_pca(tfidf_mat, n_components=PCA_COMPONENTS)
        cluster_model, cluster_labels = cluster_chunks(reduced_mat, n_clusters=N_CLUSTERS)

        for i, c in enumerate(chunks):
            c["cluster"] = int(cluster_labels[i])

        classifiers = train_classifiers(tfidf_mat, chunks)

        metrics = [
            {"modelName": name, "task": info["task"], "accuracy": info["accuracy"], "f1Score": info["f1"]}
            for name, info in classifiers.items()
        ]

        state = {
            "chunks": chunks, "tfidf_mat": tfidf_mat, "tfidf_vec": tfidf_vec,
            "svd": svd, "reduced_mat": reduced_mat, "cluster_model": cluster_model,
            "cluster_labels": cluster_labels, "classifiers": classifiers,
            "book_name": pdf.filename, "pages": pages,
        }
        save_book_artifacts(book_id, state)

        db_chunks = [{
            "page": c["page"], "text": c["text"], "cleanText": c["clean_text"],
            "wordCount": c["word_count"], "charCount": c["char_count"],
            "cluster": c["cluster"], "difficulty": c["difficulty"], "subject": c["subject"],
        } for c in chunks]

        total_words = sum(c["word_count"] for c in chunks)

        return {
            "bookId": book_id,
            "totalPages": len(pages),
            "totalChunks": len(chunks),
            "totalWords": total_words,
            "chunks": db_chunks,
            "metrics": metrics,
            "artifactPath": str(DATA_DIR / artifact_prefix(book_id)),
        }
    finally:
        os.unlink(tmp_path)


@app.post("/api/search")
def search_text(req: SearchRequest):
    try:
        state = load_book_artifacts(req.book_id)
    except FileNotFoundError:
        raise HTTPException(404, "Index not found for this book")

    query_clean = clean_text(req.query)
    if not query_clean.strip():
        raise HTTPException(400, "Query too short after preprocessing")

    qvec = state["tfidf_vec"].transform([query_clean])
    q_reduced = state["svd"].transform(qvec)
    results = knn_search(q_reduced, state["reduced_mat"], state["chunks"], req.top_k)
    predictions = predict_chunk(qvec, state["classifiers"])

    for r in results:
        idx = next((i for i, c in enumerate(state["chunks"]) if c["page"] == r["page"]), None)
        if idx is not None:
            r["difficulty"] = state["chunks"][idx]["difficulty"]
            r["subject"] = state["chunks"][idx]["subject"]
            r["cluster"] = state["chunks"][idx]["cluster"]

    return {
        "query": req.query,
        "queryMeta": {
            "difficulty": assign_difficulty({"text": req.query, "word_count": len(req.query.split())}),
            "subject": assign_subject({"text": req.query}),
            "predictions": predictions,
        },
        "results": results,
    }


@app.post("/api/search/ocr")
async def search_ocr(
    book_id: int = Form(...),
    top_k: int = Form(8),
    image: UploadFile = File(...),
):
    suffix = Path(image.filename or "query.jpg").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await image.read())
        tmp_path = tmp.name

    try:
        extracted = image_to_text(tmp_path)
        if not extracted.strip():
            raise HTTPException(400, "Could not extract text from image")

        req = SearchRequest(book_id=book_id, query=extracted, top_k=top_k)
        result = search_text(req)
        result["extractedText"] = extracted
        return result
    finally:
        os.unlink(tmp_path)


@app.get("/api/analytics/{book_id}")
def analytics(book_id: int):
    try:
        state = load_book_artifacts(book_id)
    except FileNotFoundError:
        raise HTTPException(404, "Index not found")

    chunks = state["chunks"]
    page_dist = {}
    word_dist = {"0-50": 0, "51-100": 0, "101-150": 0, "150+": 0}
    for c in chunks:
        page_dist[c["page"]] = page_dist.get(c["page"], 0) + 1
        wc = c["word_count"]
        if wc <= 50: word_dist["0-50"] += 1
        elif wc <= 100: word_dist["51-100"] += 1
        elif wc <= 150: word_dist["101-150"] += 1
        else: word_dist["150+"] += 1

    return {"pageDistribution": page_dist, "wordCountDistribution": word_dist}


@app.delete("/api/index/{book_id}")
def delete_index(book_id: int):
    delete_book_artifacts(book_id)
    return {"deleted": True}

# Start the server using uvicorn
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

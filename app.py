"""
Smart Student Assistant
ML pipeline:
  - Data Preprocessing
  - EDA
  - TF-IDF (Feature Engineering)
  - PCA (Dimensionality Reduction)
  - KNN (Search)
  - K-Means Clustering
  - Logistic Regression, Naive Bayes, SVM, Random Forest, XGBoost (Classification)
  - Model Evaluation
  - Streamlit Deployment
"""

import os
import tempfile
from pathlib import Path

import streamlit as st
import pandas as pd
import numpy as np

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Smart Student Assistant",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── CSS ────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap');

html, body, [class*="css"] { font-family: 'Inter', sans-serif; }
.stApp { background: #f8f9fb; }
#MainMenu, footer, header { visibility: hidden; }
.block-container { padding: 2rem 2.5rem; max-width: 1300px; }

/* Sidebar */
section[data-testid="stSidebar"] {
    background: #0f1117 !important;
    border-right: 1px solid #1e2130;
}
section[data-testid="stSidebar"] label,
section[data-testid="stSidebar"] p,
section[data-testid="stSidebar"] span,
section[data-testid="stSidebar"] div { color: #c9d1e0 !important; font-size: 0.85rem; }
section[data-testid="stSidebar"] h1,
section[data-testid="stSidebar"] h2,
section[data-testid="stSidebar"] h3 { color: #ffffff !important; }

/* Buttons */
.stButton > button {
    background: #1d4ed8 !important;
    color: white !important;
    border: none !important;
    border-radius: 6px !important;
    font-weight: 600 !important;
    font-size: 0.875rem !important;
    padding: 0.5rem 1.2rem !important;
    width: 100%;
    transition: all 0.15s;
}
.stButton > button:hover { background: #1e40af !important; }

/* Cards */
.card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 10px;
}
.card:hover { box-shadow: 0 2px 16px rgba(0,0,0,0.06); }

/* Page result */
.page-number { font-size: 2rem; font-weight: 700; color: #111827; line-height: 1; }
.page-sub    { font-size: 0.7rem; color: #9ca3af; text-transform: uppercase;
               letter-spacing: 0.06em; margin-bottom: 4px; }
.score-pill  { display: inline-block; padding: 3px 10px; border-radius: 20px;
               font-size: 0.78rem; font-weight: 600; }
.pill-green  { background: #d1fae5; color: #065f46; }
.pill-blue   { background: #dbeafe; color: #1e3a8a; }
.pill-yellow { background: #fef9c3; color: #854d0e; }

.snippet {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: #6b7280;
    line-height: 1.7;
    border-left: 3px solid #e5e7eb;
    padding-left: 12px;
    margin-top: 10px;
}
.bar-bg   { background: #f3f4f6; border-radius: 4px; height: 4px; margin: 8px 0; }
.bar-fill { height: 4px; border-radius: 4px; }

/* Tags */
.tag {
    display: inline-block;
    background: #f3f4f6;
    color: #374151;
    font-size: 0.72rem;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    margin-right: 4px;
    margin-top: 4px;
}
.tag-difficulty-Easy   { background: #d1fae5; color: #065f46; }
.tag-difficulty-Medium { background: #fef9c3; color: #854d0e; }
.tag-difficulty-Hard   { background: #fee2e2; color: #991b1b; }
.tag-cluster { background: #e0e7ff; color: #3730a3; }
.tag-subject { background: #f0fdf4; color: #166534; }

/* Section heading */
.sec-head {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin-bottom: 8px;
}

/* Stat box */
.stat-box {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
}
.stat-val  { font-size: 1.6rem; font-weight: 700; color: #111827; }
.stat-lab  { font-size: 0.75rem; color: #9ca3af; margin-top: 2px; }

/* Model card */
.model-card {
    background: #f8f9fb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 8px;
}
.model-name { font-weight: 600; color: #111827; font-size: 0.9rem; }
.model-acc  { font-size: 0.8rem; color: #6b7280; }

/* Info box */
.info-box {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 0.82rem;
    color: #1e40af;
    margin-bottom: 12px;
}

/* Step box for build progress */
.step-box {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.85rem;
    color: #374151;
}

/* Chunk sample card */
.chunk-card {
    background: #f8faff;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 8px;
}
.chunk-meta {
    font-size: 0.72rem;
    color: #6b7280;
    margin-bottom: 6px;
}
.chunk-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.76rem;
    color: #1e3a8a;
    line-height: 1.6;
}

/* Nav tabs override */
.stTabs [data-baseweb="tab-list"] { gap: 4px; background: transparent; }
.stTabs [data-baseweb="tab"] {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    color: #6b7280;
    padding: 6px 16px;
}
.stTabs [aria-selected="true"] {
    background: #1d4ed8 !important;
    color: white !important;
    border-color: #1d4ed8 !important;
}
</style>
""", unsafe_allow_html=True)


# ── Imports ────────────────────────────────────────────────────────────────────
from core.pdf_reader import extract_pages
from core.ocr import image_to_text
from core.chunker import chunk_pages
from core.preprocessor import clean_text
from models.vectorizer import build_tfidf, apply_pca
from models.similarity import knn_search
from models.clustering import cluster_chunks, get_cluster_label
from models.classifiers import train_classifiers, predict_chunk, assign_difficulty, assign_subject
from utils.store import save, load, exists, clear
from utils.eda import (chunks_to_df, plot_page_distribution,
                        plot_word_count_distribution, plot_difficulty_distribution,
                        plot_subject_distribution, get_summary_stats)

# ── Session state ──────────────────────────────────────────────────────────────
KEYS = ["chunks","tfidf_vec","tfidf_mat","svd","reduced_mat",
        "cluster_model","cluster_labels","classifiers","book_name","pages"]
for k in KEYS:
    if k not in st.session_state:
        st.session_state[k] = None
if "ready" not in st.session_state:
    st.session_state.ready = False

# Auto-load
if not st.session_state.ready and exists("chunks.pkl","tfidf_mat.pkl","vec.pkl"):
    try:
        st.session_state.chunks        = load("chunks.pkl")
        st.session_state.tfidf_mat     = load("tfidf_mat.pkl")
        st.session_state.tfidf_vec     = load("vec.pkl")
        st.session_state.svd           = load("svd.pkl")
        st.session_state.reduced_mat   = load("reduced.pkl")
        st.session_state.cluster_model = load("cluster_model.pkl")
        st.session_state.cluster_labels= load("cluster_labels.pkl")
        st.session_state.classifiers   = load("classifiers.pkl")
        st.session_state.book_name     = load("book_name.pkl")
        st.session_state.pages         = load("pages.pkl")
        st.session_state.ready         = True
    except Exception:
        pass


# ── Sidebar ────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## Smart Student Assistant")
    st.markdown("---")

    st.markdown("**Upload Book**")
    pdf_file = st.file_uploader("PDF textbook", type=["pdf"],
                                 label_visibility="collapsed")

    st.markdown("**Search Settings**")
    top_k      = st.slider("Max results", 1, 20, 8)
    n_clusters = 6

    st.markdown("---")
    build_btn = st.button("Build / Rebuild Index")
    if st.session_state.ready:
        st.success(f"Index ready — {st.session_state.book_name or 'Book'}")
    else:
        st.warning("No index. Upload a PDF and click Build.")

    if st.button("Clear Index"):
        clear()
        for k in KEYS:
            st.session_state[k] = None
        st.session_state.ready = False
        st.rerun()

    st.markdown("---")
    st.markdown("**ML Pipeline**")
    st.markdown("""
- TF-IDF Vectorization
- PCA / TruncatedSVD
- KNN Search
- K-Means Clustering
- Logistic Regression
- Naive Bayes
- SVM (LinearSVC)
- Random Forest
- XGBoost
""")


# ── Build index with step-by-step progress bar ─────────────────────────────────
if build_btn:
    if pdf_file is None:
        st.sidebar.error("Please upload a PDF first.")
    else:
        st.markdown("### Building Index")
        st.markdown("---")

        STEPS = [
            " Extracting text from PDF",
            "  Splitting pages into chunks",
            " Cleaning & preprocessing text",
            " TF-IDF vectorization (text → numbers)",
            " PCA dimensionality reduction",
            " K-Means clustering (grouping topics)",
            "  Assigning difficulty & subject labels",
            " Training ML classifiers",
            " Saving index to disk",
        ]
        total = len(STEPS)

        progress_bar = st.progress(0, text="Starting…")
        status_area  = st.empty()

        def update(step_idx, extra=""):
            frac = (step_idx) / total
            label = f"**Step {step_idx}/{total}** — {STEPS[step_idx-1]}"
            if extra:
                label += f"  `{extra}`"
            progress_bar.progress(frac, text=label)
            status_area.markdown(
                f'<div class="info-box">{STEPS[step_idx-1]}{(" — " + extra) if extra else ""}</div>',
                unsafe_allow_html=True
            )

        # ── Step 1: Extract pages ──────────────────────────────────────────────
        update(1)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        tmp.write(pdf_file.read()); tmp.flush()
        pages = extract_pages(tmp.name)
        os.unlink(tmp.name)
        update(1, f"{len(pages)} pages extracted")

        # ── Step 2: Chunk ──────────────────────────────────────────────────────
        update(2)
        chunks = chunk_pages(pages)
        update(2, f"{len(chunks)} chunks created")

        # ── Step 3: Clean text ─────────────────────────────────────────────────
        update(3)
        clean_texts = [clean_text(c["text"]) for c in chunks]
        for i, c in enumerate(chunks):
            c["clean_text"] = clean_texts[i]
        update(3, "Done")

        # ── Step 4: TF-IDF ────────────────────────────────────────────────────
        update(4)
        tfidf_vec, tfidf_mat = build_tfidf(clean_texts)
        update(4, f"Matrix: {tfidf_mat.shape[0]} × {tfidf_mat.shape[1]}")

        # ── Step 5: PCA ───────────────────────────────────────────────────────
        update(5)
        svd, reduced_mat, explained_var = apply_pca(tfidf_mat, n_components=100)
        update(5, f"{tfidf_mat.shape[1]} → {reduced_mat.shape[1]} dims  |  {explained_var*100:.1f}% variance kept")

        # ── Step 6: Clustering ────────────────────────────────────────────────
        update(6)
        cluster_model, cluster_labels = cluster_chunks(reduced_mat, n_clusters=n_clusters)
        for i, c in enumerate(chunks):
            c["cluster"] = int(cluster_labels[i])
        update(6, f"{n_clusters} topic clusters found")

        # ── Step 7: Labels ────────────────────────────────────────────────────
        update(7)
        for c in chunks:
            c["difficulty"] = assign_difficulty(c)
            c["subject"]    = assign_subject(c)
        update(7, "Difficulty + Subject labels assigned")

        # ── Step 8: Classifiers ───────────────────────────────────────────────
        update(8)
        classifiers = train_classifiers(tfidf_mat, chunks)
        update(8, f"{len(classifiers)} classifiers trained")

        # ── Step 9: Save ──────────────────────────────────────────────────────
        update(9)
        save(chunks,         "chunks.pkl")
        save(tfidf_mat,      "tfidf_mat.pkl")
        save(tfidf_vec,      "vec.pkl")
        save(svd,            "svd.pkl")
        save(reduced_mat,    "reduced.pkl")
        save(cluster_model,  "cluster_model.pkl")
        save(cluster_labels, "cluster_labels.pkl")
        save(classifiers,    "classifiers.pkl")
        save(pdf_file.name,  "book_name.pkl")
        save(pages,          "pages.pkl")
        update(9, "All data saved")

        # Final complete bar
        progress_bar.progress(1.0, text=" Index built successfully!")
        status_area.empty()

        st.session_state.chunks         = chunks
        st.session_state.tfidf_mat      = tfidf_mat
        st.session_state.tfidf_vec      = tfidf_vec
        st.session_state.svd            = svd
        st.session_state.reduced_mat    = reduced_mat
        st.session_state.cluster_model  = cluster_model
        st.session_state.cluster_labels = cluster_labels
        st.session_state.classifiers    = classifiers
        st.session_state.book_name      = pdf_file.name
        st.session_state.pages          = pages
        st.session_state.ready          = True

        st.success(f"Done! Indexed **{len(pages)} pages** into **{len(chunks)} chunks** across **{n_clusters} topic clusters**.")

        # ── Chunk sample preview ──────────────────────────────────────────────
        st.markdown("### Sample Chunks — How Your Book Was Split")
        st.markdown(
            '<div class="info-box">Each page is split into overlapping sentence windows called <b>chunks</b>. '
            'The ML models (TF-IDF, KNN, clustering) all operate on these chunks. '
            'Below are 10 randomly sampled chunks so you can see what the pipeline is working with.</div>',
            unsafe_allow_html=True
        )

        import random
        sample = random.sample(chunks, min(10, len(chunks)))
        for ch in sample:
            diff_color = {"Easy": "#d1fae5", "Medium": "#fef9c3", "Hard": "#fee2e2"}.get(ch["difficulty"], "#f3f4f6")
            diff_fg    = {"Easy": "#065f46", "Medium": "#854d0e", "Hard": "#991b1b"}.get(ch["difficulty"], "#374151")
            st.markdown(f"""
<div class="chunk-card">
  <div class="chunk-meta">
    📄 <b>Page {ch['page']}</b> &nbsp;|&nbsp;
    {ch['word_count']} words &nbsp;|&nbsp;
    <span style="background:{diff_color};color:{diff_fg};padding:1px 7px;border-radius:4px;font-size:0.72rem;font-weight:600">{ch['difficulty']}</span> &nbsp;
    <span style="background:#f0fdf4;color:#166534;padding:1px 7px;border-radius:4px;font-size:0.72rem;font-weight:600">{ch['subject']}</span> &nbsp;
    <span style="background:#e0e7ff;color:#3730a3;padding:1px 7px;border-radius:4px;font-size:0.72rem;font-weight:600">Topic {ch['cluster']+1}</span>
  </div>
  <div class="chunk-text">{ch['text'][:280]}{'…' if len(ch['text'])>280 else ''}</div>
</div>""", unsafe_allow_html=True)

        st.markdown("---")
        st.info("Scroll up or click the **Search Questions** tab to start searching your book.")
        st.rerun()


# ── Main tabs ──────────────────────────────────────────────────────────────────
tab_search, tab_eda, tab_models = st.tabs([
    "Search Questions",
    "Book Analysis (EDA)",
    "ML Models",
])


# ══════════════════════════════════════════════════════════════════════════════
# TAB 1: SEARCH
# ══════════════════════════════════════════════════════════════════════════════
with tab_search:
    st.markdown("### Find Similar Questions in Your Book")
    st.markdown('<p class="sec-head">Input — upload images or type a question</p>',
                unsafe_allow_html=True)

    col_left, col_right = st.columns([1, 1], gap="large")

    with col_left:
        uploaded_imgs = st.file_uploader(
            "Question Images",
            type=["jpg","jpeg","png","bmp","tiff","webp"],
            accept_multiple_files=True,
        )
        if uploaded_imgs:
            img_cols = st.columns(min(3, len(uploaded_imgs)))
            for i, f in enumerate(uploaded_imgs):
                img_cols[i % 3].image(f, use_container_width=True, caption=f.name)

    with col_right:
        manual_q = st.text_area(
            "Or type / paste your question",
            height=130,
            placeholder="Type a question here…",
        )

    search_clicked = st.button("Search in Book", key="search_btn")

    if search_clicked:
        if not st.session_state.ready:
            st.error("Please build the index first using the sidebar.")
        elif not uploaded_imgs and not manual_q.strip():
            st.warning("Add an image or type a question.")
        else:
            queries = []

            if uploaded_imgs:
                with st.spinner("Running OCR on images…"):
                    for f in uploaded_imgs:
                        tmp = tempfile.NamedTemporaryFile(
                            delete=False, suffix=Path(f.name).suffix)
                        tmp.write(f.read()); tmp.flush()
                        try:
                            text = image_to_text(tmp.name)
                            queries.append((f.name, text.strip() or None))
                        except Exception:
                            queries.append((f.name, None))
                        finally:
                            os.unlink(tmp.name)

            if manual_q.strip():
                queries.append(("Typed question", manual_q.strip()))

            st.markdown("---")

            for label, raw_text in queries:
                st.markdown(f"**Query — {label}**")

                if raw_text is None:
                    st.error("Could not extract text from this image.")
                    continue

                query_clean = clean_text(raw_text)

                if not query_clean.strip():
                    st.warning("Query text is too short or contains only common words.")
                    continue

                # Vectorize query
                qvec = st.session_state.tfidf_vec.transform([query_clean])

                # Predict with classifiers
                predictions = predict_chunk(qvec, st.session_state.classifiers)

                # Show query info
                q_diff    = assign_difficulty({"text": raw_text, "word_count": len(raw_text.split())})
                q_subject = assign_subject({"text": raw_text})

                info_col1, info_col2, info_col3 = st.columns(3)
                info_col1.markdown(f"""
                <div class="stat-box">
                    <div class="stat-val">{q_diff}</div>
                    <div class="stat-lab">Difficulty (Rule-based)</div>
                </div>""", unsafe_allow_html=True)
                info_col2.markdown(f"""
                <div class="stat-box">
                    <div class="stat-val" style="font-size:1.1rem">{q_subject}</div>
                    <div class="stat-lab">Detected Subject</div>
                </div>""", unsafe_allow_html=True)
                info_col3.markdown(f"""
                <div class="stat-box">
                    <div class="stat-val">{len(raw_text.split())}</div>
                    <div class="stat-lab">Words in Query</div>
                </div>""", unsafe_allow_html=True)

                st.markdown("")

                # KNN Search
                q_reduced = st.session_state.svd.transform(qvec)
                results   = knn_search(q_reduced,
                                       st.session_state.reduced_mat,
                                       st.session_state.chunks, top_k)

                if not results:
                    st.info("No matching pages found. Try a different question.")
                else:
                    st.markdown(f'<p class="sec-head">{len(results)} matching page(s) — KNN Search</p>',
                                unsafe_allow_html=True)

                    for rank, r in enumerate(results, 1):
                        pct = int(r["score"] * 100)
                        pill = ("pill-green" if pct >= 50
                                else "pill-blue" if pct >= 25
                                else "pill-yellow")
                        bar_color = ("#10b981" if pct >= 50
                                     else "#2563eb" if pct >= 25
                                     else "#f59e0b")

                        chunk = next((c for c in st.session_state.chunks
                                      if c["page"] == r["page"]), {})
                        diff    = chunk.get("difficulty", "")
                        subject = chunk.get("subject", "")
                        cluster = chunk.get("cluster", 0)
                        snippet = r["snippet"].replace("<","&lt;").replace(">","&gt;")

                        diff_tag    = f'<span class="tag tag-difficulty-{diff}">{diff}</span>' if diff else ""
                        subject_tag = f'<span class="tag tag-subject">{subject}</span>' if subject else ""
                        cluster_tag = f'<span class="tag tag-cluster">Topic {cluster+1}</span>'

                        st.markdown(f"""
<div class="card">
  <div style="display:flex;align-items:flex-start;justify-content:space-between">
    <div>
      <div class="page-sub">Page</div>
      <div class="page-number">{r['page']}</div>
    </div>
    <div style="text-align:right">
      <span class="score-pill {pill}">{pct}% match</span>
      <div style="font-size:0.75rem;color:#9ca3af;margin-top:4px">Rank #{rank}</div>
    </div>
  </div>
  <div class="bar-bg">
    <div class="bar-fill" style="width:{pct}%;background:{bar_color}"></div>
  </div>
  <div>{diff_tag}{subject_tag}{cluster_tag}</div>
  <div class="snippet">{snippet}…</div>
</div>""", unsafe_allow_html=True)

                st.markdown("---")


# ══════════════════════════════════════════════════════════════════════════════
# TAB 2: EDA
# ══════════════════════════════════════════════════════════════════════════════
with tab_eda:
    if not st.session_state.ready:
        st.info("Build the index first to see book analysis.")
    else:
        chunks = st.session_state.chunks
        pages  = st.session_state.pages
        df     = chunks_to_df(chunks)
        stats  = get_summary_stats(df, pages)

        st.markdown("### Book Analysis — Exploratory Data Analysis")
        st.markdown('<div class="info-box">EDA means understanding your data before applying ML. These charts show what is inside the book.</div>',
                    unsafe_allow_html=True)

        # Stats row
        s1,s2,s3,s4,s5 = st.columns(5)
        for col, val, lab in [
            (s1, stats["total_pages"],  "Total Pages"),
            (s2, stats["total_chunks"], "Total Chunks"),
            (s3, stats["total_words"],  "Total Words"),
            (s4, stats["avg_words"],    "Avg Words/Chunk"),
            (s5, stats["max_words"],    "Max Words/Chunk"),
        ]:
            col.markdown(f"""
            <div class="stat-box">
                <div class="stat-val">{val}</div>
                <div class="stat-lab">{lab}</div>
            </div>""", unsafe_allow_html=True)

        st.markdown("")

        # Charts
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("**Content distribution across pages**")
            st.image(plot_page_distribution(df), use_container_width=True)

        with c2:
            st.markdown("**Word count distribution per chunk**")
            st.image(plot_word_count_distribution(df), use_container_width=True)

        c3, c4 = st.columns(2)
        with c3:
            st.markdown("**Difficulty distribution (heuristic labels)**")
            st.image(plot_difficulty_distribution(chunks), use_container_width=True)

        with c4:
            st.markdown("**Subject distribution across the book**")
            st.image(plot_subject_distribution(chunks), use_container_width=True)

        # Data table
        st.markdown("**Sample chunk data (first 20 rows)**")
        show_df = df[["page","word_count","char_count","difficulty","subject","cluster"]].head(20)
        st.dataframe(show_df, use_container_width=True, hide_index=True)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 3: ML MODELS
# ══════════════════════════════════════════════════════════════════════════════
with tab_models:
    if not st.session_state.ready:
        st.info("Build the index first to see model details.")
    else:
        st.markdown("### ML Models — What is Running Under the Hood")

        classifiers = st.session_state.classifiers

        st.markdown('<div class="info-box">This is the full ML pipeline running in this project.</div>',
                    unsafe_allow_html=True)

        pipeline_steps = [
            ("1. PDF / Image Input",   "Data Collection",              "#e0e7ff","#3730a3"),
            ("2. OCR (Tesseract)",     "Image → Text",                 "#f0fdf4","#166534"),
            ("3. Text Preprocessing", "Lowercase, Remove stopwords",  "#fef9c3","#854d0e"),
            ("4. TF-IDF",             "Text → Numbers (Vectors)",     "#dbeafe","#1e3a8a"),
            ("5. PCA / TruncatedSVD", "5000 dims → 100 dims",         "#fce7f3","#831843"),
            ("6. K-Means Clustering", "Group chunks into topics",     "#ecfdf5","#065f46"),
            ("7. KNN Search",         "Find similar pages",           "#eff6ff","#1e40af"),
            ("8. Classifiers",        "Predict difficulty + subject", "#fff7ed","#92400e"),
            ("9. Streamlit UI",       "Show results to user",         "#f3f4f6","#374151"),
        ]

        cols = st.columns(3)
        for i, (title, desc, bg, fg) in enumerate(pipeline_steps):
            cols[i % 3].markdown(f"""
            <div style="background:{bg};border-radius:8px;padding:12px 14px;margin-bottom:10px">
                <div style="font-weight:600;font-size:0.85rem;color:{fg}">{title}</div>
                <div style="font-size:0.78rem;color:#6b7280;margin-top:3px">{desc}</div>
            </div>""", unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("### Trained Classifier Results")

        if not classifiers:
            st.warning("Not enough data to train classifiers. Try a larger PDF.")
        else:
            diff_models = {k:v for k,v in classifiers.items() if v["task"]=="difficulty"}
            subj_models = {k:v for k,v in classifiers.items() if v["task"]=="subject"}

            c1, c2 = st.columns(2)

            with c1:
                st.markdown("**Difficulty Classifiers**")
                st.caption("Predict if a page is Easy / Medium / Hard")
                for name, info in diff_models.items():
                    st.markdown(f"""
                    <div class="model-card">
                        <div class="model-name">{name}</div>
                        <div class="model-acc">
                            Accuracy: <b>{info['accuracy']*100:.1f}%</b>
                            &nbsp; F1 Score: <b>{info['f1']:.3f}</b>
                        </div>
                    </div>""", unsafe_allow_html=True)

            with c2:
                st.markdown("**Subject Classifiers**")
                st.caption("Predict the subject of a page")
                for name, info in subj_models.items():
                    st.markdown(f"""
                    <div class="model-card">
                        <div class="model-name">{name}</div>
                        <div class="model-acc">
                            Accuracy: <b>{info['accuracy']*100:.1f}%</b>
                            &nbsp; F1 Score: <b>{info['f1']:.3f}</b>
                        </div>
                    </div>""", unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("### What Each Algorithm Does")

        explanations = {
            "TF-IDF": "Converts each chunk of text into a vector of numbers. Words that appear often in a chunk but rarely across the whole book get higher scores. This is Feature Engineering.",
            "PCA (TruncatedSVD)": "The TF-IDF matrix has thousands of dimensions. PCA reduces it to 100 dimensions while keeping 80%+ of the information. This speeds up KNN search significantly.",
            "KNN (K-Nearest Neighbors)": "Finds the K book chunks that are geometrically closest to your question vector in the PCA-reduced space. Uses cosine distance — chunks pointing in the same direction as your query are returned as matches.",
            "K-Means Clustering": "Automatically groups all book chunks into N clusters. Each cluster represents a different topic or theme in the book. No labels needed — this is Unsupervised Learning.",
            "Logistic Regression": "A linear classifier that predicts probability of Easy/Medium/Hard. Uses the TF-IDF features as input. Fast and interpretable.",
            "Naive Bayes": "Applies Bayes theorem assuming all features are independent. Great for text classification. Used here to predict the subject of a page.",
            "SVM (LinearSVC)": "Finds the best hyperplane that separates subjects in the high-dimensional feature space. Usually beats Naive Bayes on text tasks.",
            "Random Forest": "An ensemble of Decision Trees. Each tree votes, the majority wins. More accurate than a single tree, handles overfitting better.",
            "XGBoost": "Gradient Boosted Trees — the most powerful classical ML algorithm. Builds trees sequentially, each correcting the errors of the previous. State-of-the-art accuracy.",
        }

        for algo, explanation in explanations.items():
            with st.expander(algo):
                st.markdown(explanation)
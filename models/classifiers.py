"""
Classifiers
  - Logistic Regression  → Difficulty: Easy / Medium / Hard
  - Naive Bayes          → Subject classifier
  - SVM                  → Better subject classifier
  - Random Forest        → Ensemble difficulty classifier
  - XGBoost              → Best accuracy classifier
  - Model Evaluation     → Accuracy, F1 score

NOTE: Since we don't have labeled training data from the user's book,
we use heuristic-based rules to assign labels, then train the classifiers.
This demonstrates the full ML pipeline on real extracted text.
"""
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.pipeline import Pipeline

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False


# ── Heuristic label generators ────────────────────────────────────────────────

def assign_difficulty(chunk: dict) -> str:
    """
    Rule-based difficulty labeling using text features.
    Long, complex chunks → Hard
    Medium length        → Medium
    Short, simple        → Easy
    """
    wc = chunk["word_count"]
    text = chunk["text"].lower()

    hard_keywords = ["derive", "prove", "theorem", "complex", "integral",
                     "differential", "analysis", "quantum", "hypothesis",
                     "calculate", "advanced", "equation"]
    easy_keywords = ["define", "what is", "list", "name", "simple",
                     "basic", "introduction", "example", "describe"]

    hard_hits = sum(1 for k in hard_keywords if k in text)
    easy_hits = sum(1 for k in easy_keywords if k in text)

    if wc > 120 or hard_hits >= 2:
        return "Hard"
    elif wc < 50 or easy_hits >= 2:
        return "Easy"
    else:
        return "Medium"


def assign_subject(chunk: dict) -> str:
    """Keyword-based subject detection"""
    text = chunk["text"].lower()
    subjects = {
        "Mathematics":  ["equation","matrix","vector","calculus","algebra","geometry","probability","statistics","theorem","integral","derivative","polynomial"],
        "Physics":      ["force","motion","energy","velocity","acceleration","quantum","wave","particle","thermodynamics","electric","magnetic","newton"],
        "Chemistry":    ["molecule","atom","reaction","element","compound","acid","base","bond","organic","periodic","electron","valence"],
        "Biology":      ["cell","organism","dna","gene","protein","evolution","photosynthesis","mitosis","enzyme","chromosome","ecosystem"],
        "Computer Sci": ["algorithm","data structure","program","code","function","loop","array","binary","network","database","class","object"],
        "History":      ["war","revolution","empire","century","civilization","king","queen","battle","treaty","independence","colonial"],
        "Geography":    ["continent","ocean","climate","river","mountain","country","population","latitude","longitude","earthquake","rainfall"],
    }
    scores = {subj: sum(1 for kw in kws if kw in text) for subj, kws in subjects.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "General"


# ── Train classifiers ─────────────────────────────────────────────────────────

def train_classifiers(tfidf_matrix, chunks: list[dict]):
    """
    Train all classifiers using heuristic labels.
    Returns trained models + evaluation metrics.
    """
    # Generate labels
    difficulty_labels = [assign_difficulty(c) for c in chunks]
    subject_labels    = [assign_subject(c)    for c in chunks]

    # Encode labels
    diff_enc = LabelEncoder()
    subj_enc = LabelEncoder()
    y_diff = diff_enc.fit_transform(difficulty_labels)
    y_subj = subj_enc.fit_transform(subject_labels)

    # Use dense matrix for tree models
    X = tfidf_matrix

    results = {}

    # ── Difficulty classifiers ────────────────────────────────────────────────
    if len(set(y_diff)) >= 2 and X.shape[0] > 10:
        X_tr, X_te, yd_tr, yd_te = train_test_split(
            X, y_diff, test_size=0.2, random_state=42, stratify=y_diff
            if min(np.bincount(y_diff)) > 1 else None)

        # Logistic Regression
        lr = LogisticRegression(max_iter=500, random_state=42, C=1.0)
        lr.fit(X_tr, yd_tr)
        lr_pred = lr.predict(X_te)
        results["Logistic Regression"] = {
            "model": lr, "encoder": diff_enc, "task": "difficulty",
            "accuracy": round(accuracy_score(yd_te, lr_pred), 3),
            "f1": round(f1_score(yd_te, lr_pred, average="weighted", zero_division=0), 3),
        }

        # Random Forest
        rf = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
        rf.fit(X_tr, yd_tr)
        rf_pred = rf.predict(X_te)
        results["Random Forest"] = {
            "model": rf, "encoder": diff_enc, "task": "difficulty",
            "accuracy": round(accuracy_score(yd_te, rf_pred), 3),
            "f1": round(f1_score(yd_te, rf_pred, average="weighted", zero_division=0), 3),
        }

        # XGBoost
        if HAS_XGB:
            xgb = XGBClassifier(n_estimators=50, random_state=42,
                                 verbosity=0, use_label_encoder=False,
                                 eval_metric="mlogloss")
            xgb.fit(X_tr.toarray(), yd_tr)
            xgb_pred = xgb.predict(X_te.toarray())
            results["XGBoost"] = {
                "model": xgb, "encoder": diff_enc, "task": "difficulty",
                "accuracy": round(accuracy_score(yd_te, xgb_pred), 3),
                "f1": round(f1_score(yd_te, xgb_pred, average="weighted", zero_division=0), 3),
                "needs_dense": True,
            }

    # ── Subject classifiers ───────────────────────────────────────────────────
    if len(set(y_subj)) >= 2 and X.shape[0] > 10:
        X_tr2, X_te2, ys_tr, ys_te = train_test_split(
            X, y_subj, test_size=0.2, random_state=42)

        # Naive Bayes (needs non-negative, use MinMaxScaler)
        scaler = MinMaxScaler()
        X_tr_nb = scaler.fit_transform(X_tr2.toarray())
        X_te_nb = scaler.transform(X_te2.toarray())
        nb = MultinomialNB()
        nb.fit(X_tr_nb, ys_tr)
        nb_pred = nb.predict(X_te_nb)
        results["Naive Bayes"] = {
            "model": nb, "encoder": subj_enc, "task": "subject",
            "scaler": scaler,
            "accuracy": round(accuracy_score(ys_te, nb_pred), 3),
            "f1": round(f1_score(ys_te, nb_pred, average="weighted", zero_division=0), 3),
            "needs_dense": True,
        }

        # SVM
        svm = LinearSVC(max_iter=1000, random_state=42)
        svm.fit(X_tr2, ys_tr)
        svm_pred = svm.predict(X_te2)
        results["SVM"] = {
            "model": svm, "encoder": subj_enc, "task": "subject",
            "accuracy": round(accuracy_score(ys_te, svm_pred), 3),
            "f1": round(f1_score(ys_te, svm_pred, average="weighted", zero_division=0), 3),
        }

    return results


def predict_chunk(chunk_vec, classifiers: dict) -> dict:
    """Run all classifiers on a query chunk"""
    predictions = {}
    for name, info in classifiers.items():
        try:
            X = chunk_vec.toarray() if info.get("needs_dense") else chunk_vec
            if "scaler" in info:
                X = info["scaler"].transform(X)
            label_id = info["model"].predict(X)[0]
            label = info["encoder"].inverse_transform([label_id])[0]
            predictions[name] = {"task": info["task"], "prediction": label,
                                  "accuracy": info["accuracy"]}
        except Exception:
            pass
    return predictions

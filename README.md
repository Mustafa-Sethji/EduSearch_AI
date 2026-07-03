# EduSearch AI — MERN Stack + MySQL + ML

A full-stack Smart Student Assistant with a **3D React UI**, **Express + MySQL** backend, and **Python ML microservice** for PDF indexing, OCR search, and machine learning analytics.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  React Client   │────▶│  Express Server  │────▶│  Python ML Service  │
│  Three.js 3D UI │     │  MySQL (Sequelize)│     │  FastAPI + sklearn  │
│  Port 5173      │     │  Port 5000       │     │  Port 8000          │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                              │
                        ┌─────▼─────┐
                        │   MySQL   │
                        │ Port 3306 │
                        └───────────┘
```

## Features

### Core (from original Streamlit app)
- PDF textbook upload & text extraction
- TF-IDF → PCA → K-Means → KNN search pipeline
- OCR image search (Tesseract)
- ML classifiers: Logistic Regression, Naive Bayes, SVM, Random Forest, XGBoost
- EDA analytics with interactive charts

### Advanced (new in MERN version)
- JWT authentication & user accounts
- Multi-book library per user
- Real-time index build progress (Socket.io)
- Search history & AI study recommendations
- Bookmarks with notes
- Study streak tracking
- 3D animated UI with glassmorphism theme
- Dark mode design system

## Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL 8.0 (or Docker)
- Tesseract OCR (`brew install tesseract` on macOS)
- libomp for XGBoost (`brew install libomp` on macOS)

## Quick Start

### 1. Start MySQL

```bash
docker compose up -d mysql
```

Or use a local MySQL instance and create database `edusearch`.

### 2. Install dependencies

```bash
npm run install:all
pip install -r ml-service/requirements.txt
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your MySQL credentials
```

### 4. Run all services

```bash
# Terminal 1 — ML Service
cd ml-service && uvicorn main:app --reload --port 8000

# Terminal 2 — Express Server
cd server && npm run dev

# Terminal 3 — React Client
cd client && npm run dev
```

Or run everything at once (requires concurrently):

```bash
npm run dev
```

### 5. Open the app

Visit **http://localhost:5173**

## Project Structure

```
EduSearch_AI/
├── client/           # React + Vite + Three.js frontend
├── server/           # Express + MySQL API
├── ml-service/       # Python FastAPI ML microservice
├── core/             # Shared ML modules (PDF, OCR, preprocessing)
├── models/           # ML models (vectorizer, classifiers, etc.)
├── utils/            # Storage & EDA utilities
├── database/         # MySQL init scripts
├── app.py            # Legacy Streamlit app (still available)
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/books` | List user's books |
| POST | `/api/books/upload` | Upload PDF & build index |
| POST | `/api/search/text` | Text search |
| POST | `/api/search/ocr` | OCR image search |
| GET | `/api/search/analytics/:bookId` | Book analytics |
| GET | `/api/search/metrics/:bookId` | ML model metrics |
| GET | `/api/search/recommendations` | AI study recommendations |

## Legacy Streamlit App

The original Streamlit app is still available:

```bash
streamlit run app.py
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Three.js, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express, Sequelize, Socket.io, JWT |
| Database | MySQL 8 |
| ML Service | Python, FastAPI, scikit-learn, XGBoost, pdfplumber, Tesseract |

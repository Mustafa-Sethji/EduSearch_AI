import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle } from 'lucide-react';
import { booksAPI, searchAPI } from '../api/client';

const PIPELINE = [
  'PDF Extraction', 'Text Chunking', 'Preprocessing', 'TF-IDF Vectorization',
  'PCA (TruncatedSVD)', 'K-Means Clustering', 'Heuristic Labeling',
  'Classifier Training', 'Index Persistence',
];

const MODEL_INFO = {
  'Logistic Regression': 'Linear model for difficulty classification (Easy/Medium/Hard).',
  'Random Forest': 'Ensemble of decision trees for robust difficulty prediction.',
  'XGBoost': 'Gradient boosted trees — highest accuracy for difficulty.',
  'Naive Bayes': 'Probabilistic classifier for subject detection.',
  'SVM': 'Support Vector Machine with linear kernel for subject classification.',
};

export default function MLModels() {
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState('');
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    booksAPI.list().then(({ data }) => {
      const ready = data.books.filter((b) => b.status === 'ready');
      setBooks(ready);
      if (ready.length) setBookId(String(ready[0].id));
    });
  }, []);

  useEffect(() => {
    if (!bookId) return;
    searchAPI.metrics(bookId).then(({ data }) => setMetrics(data.metrics)).catch(() => setMetrics([]));
  }, [bookId]);

  const difficultyModels = metrics.filter((m) => m.task === 'difficulty');
  const subjectModels = metrics.filter((m) => m.task === 'subject');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">ML Models</h1>
          <p className="text-gray-400 mt-1">Full machine learning pipeline & classifier performance</p>
        </div>
        <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="input-field w-full sm:w-64">
          {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
      </div>

      <div className="glass p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2"><Brain size={20} className="text-primary-400" /> ML Pipeline</h3>
        <div className="flex flex-wrap gap-2">
          {PIPELINE.map((step, i) => (
            <motion.div key={step} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm">
              <span className="w-6 h-6 rounded-full bg-primary-600/30 text-primary-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              {step}
              {i < PIPELINE.length - 1 && <span className="text-gray-600 ml-1">→</span>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-semibold mb-4">Difficulty Classifiers</h3>
          <div className="space-y-3">
            {difficultyModels.map((m) => (
              <ModelCard key={m.id} metric={m} />
            ))}
            {!difficultyModels.length && <p className="text-gray-500 text-sm">No models trained yet.</p>}
          </div>
        </div>
        <div className="glass p-6">
          <h3 className="font-semibold mb-4">Subject Classifiers</h3>
          <div className="space-y-3">
            {subjectModels.map((m) => (
              <ModelCard key={m.id} metric={m} />
            ))}
            {!subjectModels.length && <p className="text-gray-500 text-sm">No models trained yet.</p>}
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <h3 className="font-semibold mb-4">Algorithm Reference</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(MODEL_INFO).map(([name, desc]) => (
            <div key={name} className="p-4 rounded-xl bg-white/5">
              <h4 className="font-medium text-primary-400">{name}</h4>
              <p className="text-sm text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelCard({ metric }) {
  const accPct = Math.round(metric.accuracy * 100);
  const f1Pct = Math.round(metric.f1Score * 100);
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">{metric.modelName}</span>
        <CheckCircle size={16} className="text-green-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-gray-500">Accuracy</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${accPct}%` }} />
            </div>
            <span className="text-sm font-bold">{accPct}%</span>
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-500">F1 Score</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${f1Pct}%` }} />
            </div>
            <span className="text-sm font-bold">{f1Pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

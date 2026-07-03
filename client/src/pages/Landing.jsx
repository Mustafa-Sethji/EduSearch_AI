import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Brain, BarChart3, Sparkles, ArrowRight, BookOpen, Zap } from 'lucide-react';
import Scene3D from '../components/3d/Scene3D';

const features = [
  { icon: Search, title: 'AI-Powered Search', desc: 'Find similar questions in your textbook using TF-IDF, PCA & KNN.' },
  { icon: Brain, title: 'ML Classifiers', desc: 'Logistic Regression, SVM, Random Forest & XGBoost for difficulty & subject detection.' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Visualize page distribution, word counts, clusters & model performance.' },
  { icon: Sparkles, title: 'OCR Search', desc: 'Upload question photos — Tesseract OCR extracts text automatically.' },
  { icon: BookOpen, title: 'Multi-Book Library', desc: 'Manage multiple textbooks with per-book ML indexes.' },
  { icon: Zap, title: 'Study Streaks', desc: 'Track your daily study habits and get AI recommendations.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Scene3D />
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold">E</div>
            <span className="font-display font-bold text-xl">EduSearch AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-primary-400 mb-6">
              MERN Stack + MySQL + ML Pipeline
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Your <span className="gradient-text">Smart</span> Student<br />Assistant
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Upload textbooks, search questions with AI, analyze content with ML classifiers,
              and discover similar pages — all in a stunning 3D interface.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="btn-primary flex items-center gap-2">
                Start Learning <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-ghost border border-white/10 px-6 py-3">Sign In</Link>
            </div>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-8 pb-32">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Advanced Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="glass-hover p-6">
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center mb-4">
                  <Icon className="text-primary-400" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

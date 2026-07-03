import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, Flame, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { booksAPI, searchAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    booksAPI.list().then(({ data }) => setBooks(data.books)).catch(() => {});
    searchAPI.recommendations().then(({ data }) => setRecommendations(data.recommendations)).catch(() => {});
    searchAPI.history({ limit: 5 }).then(({ data }) => setRecentSearches(data.history)).catch(() => {});
  }, []);

  const readyBooks = books.filter((b) => b.status === 'ready');

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 mt-1">Your AI-powered study command center</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Books', value: books.length, icon: BookOpen, color: 'text-blue-400' },
          { label: 'Ready Indexes', value: readyBooks.length, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Study Streak', value: `${user?.studyStreak || 0}d`, icon: Flame, color: 'text-orange-400' },
          { label: 'Recent Searches', value: recentSearches.length, icon: Search, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <span className="text-3xl font-bold">{value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Sparkles size={20} className="text-primary-400" /> AI Recommendations</h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs uppercase tracking-wider text-primary-400">{rec.type}</span>
                <h3 className="font-medium mt-1">{rec.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
              </div>
            ))}
            {!recommendations.length && <p className="text-gray-500 text-sm">Start searching to get personalized recommendations.</p>}
          </div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Searches</h2>
            <Link to="/search" className="text-primary-400 text-sm flex items-center gap-1 hover:underline">
              Search now <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentSearches.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="truncate flex-1 mr-4">
                  <p className="text-sm truncate">{s.queryText}</p>
                  <p className="text-xs text-gray-500">{s.book?.title} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-600/20 text-primary-400">{s.resultCount} hits</span>
              </div>
            ))}
            {!recentSearches.length && <p className="text-gray-500 text-sm">No searches yet.</p>}
          </div>
        </div>
      </div>

      {readyBooks.length > 0 && (
        <div className="glass p-6">
          <h2 className="font-semibold text-lg mb-4">Your Books</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyBooks.slice(0, 3).map((book) => (
              <div key={book.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h3 className="font-medium truncate">{book.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{book.totalPages} pages · {book.totalChunks} chunks</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

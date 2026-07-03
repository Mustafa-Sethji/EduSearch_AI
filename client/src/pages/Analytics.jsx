import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { booksAPI, searchAPI } from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export default function Analytics() {
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    booksAPI.list().then(({ data: d }) => {
      const ready = d.books.filter((b) => b.status === 'ready');
      setBooks(ready);
      if (ready.length) setBookId(String(ready[0].id));
    });
  }, []);

  useEffect(() => {
    if (!bookId) return;
    searchAPI.analytics(bookId).then(({ data: d }) => setData(d)).catch(() => setData(null));
  }, [bookId]);

  const toChart = (obj) => Object.entries(obj || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Book Analytics</h1>
          <p className="text-gray-400 mt-1">Explore your textbook data with interactive charts</p>
        </div>
        <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="input-field w-full sm:w-64">
          {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
      </div>

      {data && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Pages', value: data.summary.totalPages },
              { label: 'Total Chunks', value: data.summary.totalChunks },
              { label: 'Total Words', value: data.summary.totalWords?.toLocaleString() },
              { label: 'Avg Words/Chunk', value: data.summary.avgWordsPerChunk },
            ].map(({ label, value }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="stat-card">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-3xl font-bold">{value}</span>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass p-6">
              <h3 className="font-semibold mb-4">Difficulty Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={toChart(data.difficultyDist)}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass p-6">
              <h3 className="font-semibold mb-4">Subject Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={toChart(data.subjectDist)} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {toChart(data.subjectDist).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass p-6">
              <h3 className="font-semibold mb-4">Word Count Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={toChart(data.wordCountDistribution)}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass p-6">
              <h3 className="font-semibold mb-4">Topic Clusters</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={toChart(data.clusterDist)}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {!data && books.length === 0 && (
        <div className="glass p-12 text-center text-gray-500">Upload and index a book to see analytics.</div>
      )}
    </div>
  );
}

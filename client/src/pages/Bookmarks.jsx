import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Trash2 } from 'lucide-react';
import { searchAPI } from '../api/client';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  const fetch = () => {
    searchAPI.bookmarks().then(({ data }) => setBookmarks(data.bookmarks)).catch(() => {});
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    await searchAPI.deleteBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Bookmarks</h1>
        <p className="text-gray-400 mt-1">Saved pages from your searches</p>
      </div>

      <div className="space-y-4">
        {bookmarks.map((bm, i) => (
          <motion.div key={bm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="glass p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${bm.color}20` }}>
              <Bookmark size={20} style={{ color: bm.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">Page {bm.page}</span>
                <span className="text-xs text-gray-500">· {bm.book?.title}</span>
              </div>
              {bm.snippet && <p className="text-sm text-gray-400 truncate">{bm.snippet}</p>}
              {bm.note && <p className="text-sm text-gray-300 mt-2 italic">"{bm.note}"</p>}
              <p className="text-xs text-gray-600 mt-2">{new Date(bm.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={() => handleDelete(bm.id)} className="btn-ghost text-red-400 shrink-0">
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}
        {!bookmarks.length && (
          <div className="glass p-12 text-center text-gray-500">
            <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
            <p>No bookmarks yet. Save pages while searching.</p>
          </div>
        )}
      </div>
    </div>
  );
}

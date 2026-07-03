import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Camera, Bookmark, Loader2, ImagePlus } from 'lucide-react';
import { booksAPI, searchAPI } from '../api/client';
import { useBookStore } from '../store/authStore';

export default function SearchPage() {
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState('');
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(8);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState(null);
  const imageRef = useRef();
  const { activeBook, setActiveBook } = useBookStore();

  useEffect(() => {
    booksAPI.list().then(({ data }) => {
      const ready = data.books.filter((b) => b.status === 'ready');
      setBooks(ready);
      if (activeBook) setBookId(String(activeBook.id));
      else if (ready.length) setBookId(String(ready[0].id));
    });
  }, []);

  const handleTextSearch = async () => {
    if (!bookId || !query.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const { data } = await searchAPI.text({ bookId: parseInt(bookId), query, topK });
      setResults(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOcrSearch = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !bookId) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResults(null);
    const form = new FormData();
    form.append('image', file);
    form.append('bookId', bookId);
    form.append('topK', topK);
    try {
      const { data } = await searchAPI.ocr(form);
      setResults(data);
      if (data.extractedText) setQuery(data.extractedText);
    } catch (err) {
      alert(err.response?.data?.error || 'OCR search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (result) => {
    await searchAPI.createBookmark({
      bookId: parseInt(bookId),
      page: result.page,
      snippet: result.snippet,
    });
    alert('Bookmarked!');
  };

  const scoreColor = (score) => {
    const pct = score * 100;
    if (pct >= 50) return 'text-green-400 bg-green-400/10';
    if (pct >= 25) return 'text-blue-400 bg-blue-400/10';
    return 'text-yellow-400 bg-yellow-400/10';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Search Questions</h1>
        <p className="text-gray-400 mt-1">Find similar content in your textbook using AI</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Book</label>
            <select value={bookId} onChange={(e) => { setBookId(e.target.value); setActiveBook(books.find((b) => b.id === parseInt(e.target.value))); }} className="input-field">
              {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Upload Question Image (OCR)</label>
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary-500/50 transition-colors">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full object-contain rounded-lg" />
              ) : (
                <>
                  <ImagePlus size={32} className="text-gray-500 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                </>
              )}
              <input ref={imageRef} type="file" accept="image/*" onChange={handleOcrSearch} className="hidden" />
            </label>
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Type or paste question</label>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={5} placeholder="Enter your question here..." className="input-field resize-none" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-1 block">Max results: {topK}</label>
              <input type="range" min={1} max={20} value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full accent-primary-500" />
            </div>
          </div>
          <button onClick={handleTextSearch} disabled={loading || !bookId} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Search in Book'}
          </button>
        </div>
      </div>

      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {results.queryMeta && (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="stat-card"><span className="text-gray-400 text-sm">Difficulty</span><span className="text-xl font-bold">{results.queryMeta.difficulty}</span></div>
              <div className="stat-card"><span className="text-gray-400 text-sm">Subject</span><span className="text-xl font-bold">{results.queryMeta.subject}</span></div>
              <div className="stat-card"><span className="text-gray-400 text-sm">Results</span><span className="text-xl font-bold">{results.results?.length || 0}</span></div>
            </div>
          )}

          <div className="space-y-4">
            {results.results?.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} className="glass p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold">Page {r.page}</span>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${scoreColor(r.score)}`}>
                        {Math.round(r.score * 100)}% match
                      </span>
                      <span className="text-xs text-gray-500">#{i + 1}</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {r.difficulty && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{r.difficulty}</span>}
                      {r.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{r.subject}</span>}
                      {r.cluster !== undefined && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">Topic {r.cluster + 1}</span>}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{r.snippet}...</p>
                  </div>
                  <button onClick={() => handleBookmark(r)} className="btn-ghost shrink-0">
                    <Bookmark size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
            {!results.results?.length && (
              <div className="glass p-8 text-center text-gray-500">No matching pages found. Try a different question.</div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

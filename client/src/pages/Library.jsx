import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, RefreshCw, BookOpen, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { booksAPI } from '../api/client';
import { useBookStore } from '../store/authStore';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const fileRef = useRef();
  const { setBooks: setStoreBooks } = useBookStore();

  const fetchBooks = () => {
    booksAPI.list().then(({ data }) => {
      setBooks(data.books);
      setStoreBooks(data.books);
    }).catch(() => {});
  };

  useEffect(() => { fetchBooks(); }, []);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('/', { path: '/socket.io' });
    socketRef.current = socket;

    socket.on('build-progress', (data) => {
      setBooks((prev) => prev.map((b) =>
        b.id === data.bookId ? { ...b, progress: data.progress, progressStep: data.step, status: data.status || b.status } : b
      ));
      if (data.status === 'ready' || data.status === 'failed') fetchBooks();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || books.length === 0) return;
    books.forEach((book) => {
      if (book.status === 'uploading' || book.status === 'processing') {
        socketRef.current.emit('join-book', book.id);
      }
    });
  }, [books]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('pdf', file);
    if (title) form.append('title', title);
    try {
      const { data } = await booksAPI.upload(form);
      setBooks((prev) => [data.book, ...prev]);
      setTitle('');
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book and its index?')) return;
    await booksAPI.delete(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const statusIcon = (status) => {
    if (status === 'ready') return <CheckCircle size={16} className="text-green-400" />;
    if (status === 'failed') return <XCircle size={16} className="text-red-400" />;
    return <Loader2 size={16} className="text-primary-400 animate-spin" />;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Book Library</h1>
        <p className="text-gray-400 mt-1">Upload PDF textbooks and build ML search indexes</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-2 block">Book Title (optional)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics Textbook" className="input-field" />
          </div>
          <label className="btn-primary cursor-pointer flex items-center gap-2">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Uploading...' : 'Upload PDF'}
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </motion.div>

      <div className="grid gap-4">
        {books.map((book, i) => (
          <motion.div key={book.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }} className="glass p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center shrink-0">
              <BookOpen className="text-primary-400" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{book.title}</h3>
                {statusIcon(book.status)}
              </div>
              <p className="text-sm text-gray-500">{book.filename}</p>
              {book.status === 'processing' && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{book.progressStep}</span>
                    <span>{book.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-600 to-purple-500 rounded-full transition-all" style={{ width: `${book.progress}%` }} />
                  </div>
                </div>
              )}
              {book.status === 'ready' && (
                <p className="text-xs text-gray-500 mt-1">{book.totalPages} pages · {book.totalChunks} chunks · {book.totalWords?.toLocaleString()} words</p>
              )}
              {book.status === 'failed' && (
                <p className="text-xs text-red-400 mt-1">{book.errorMessage || 'Build failed'}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {book.status === 'ready' && (
                <button onClick={() => booksAPI.rebuild(book.id).then(fetchBooks)} className="btn-ghost flex items-center gap-1">
                  <RefreshCw size={16} /> Rebuild
                </button>
              )}
              <button onClick={() => handleDelete(book.id)} className="btn-ghost text-red-400 hover:text-red-300 flex items-center gap-1">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
        {!books.length && (
          <div className="glass p-12 text-center text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p>No books yet. Upload a PDF to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

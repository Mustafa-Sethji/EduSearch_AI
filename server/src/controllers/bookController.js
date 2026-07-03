import fs from 'fs';
import path from 'path';
import { Book, Chunk, ModelMetric } from '../models/index.js';
import { mlClient } from '../services/mlClient.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['filePath', 'artifactPath'] },
    });
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, userId: req.user.id },
      attributes: { exclude: ['filePath'] },
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ book });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadBook = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });

    const book = await Book.create({
      userId: req.user.id,
      title: req.body.title || req.file.originalname.replace('.pdf', ''),
      filename: req.file.originalname,
      filePath: req.file.path,
      status: 'processing',
      progress: 0,
      progressStep: 'Starting...',
    });

    res.status(201).json({ book, message: 'Upload successful. Index building started.' });

    buildIndexAsync(book, req.app.get('io'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function buildIndexAsync(book, io) {
  const emit = (data) => io?.to(`book-${book.id}`).emit('build-progress', data);

  try {
    emit({ bookId: book.id, progress: 5, step: 'Extracting PDF pages...' });
    await book.update({ progress: 5, progressStep: 'Extracting PDF pages...' });

    const result = await mlClient.buildIndex(book.id, book.filePath);

    emit({ bookId: book.id, progress: 90, step: 'Saving to database...' });
    await book.update({ progress: 90, progressStep: 'Saving to database...' });

    if (result.chunks?.length) {
      await Chunk.bulkCreate(
        result.chunks.map((c) => ({ bookId: book.id, ...c }))
      );
    }

    if (result.metrics?.length) {
      await ModelMetric.bulkCreate(
        result.metrics.map((m) => ({ bookId: book.id, ...m }))
      );
    }

    await book.update({
      status: 'ready',
      progress: 100,
      progressStep: 'Complete',
      totalPages: result.totalPages || 0,
      totalChunks: result.totalChunks || 0,
      totalWords: result.totalWords || 0,
      artifactPath: result.artifactPath || null,
    });

    emit({ bookId: book.id, progress: 100, step: 'Complete', status: 'ready' });
  } catch (err) {
    await book.update({
      status: 'failed',
      errorMessage: err.message,
      progressStep: 'Failed',
    });
    emit({ bookId: book.id, progress: 0, step: 'Failed', status: 'failed', error: err.message });
  }
}

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    try { await mlClient.deleteIndex(book.id); } catch { /* ignore */ }
    if (book.filePath && fs.existsSync(book.filePath)) fs.unlinkSync(book.filePath);

    await Chunk.destroy({ where: { bookId: book.id } });
    await ModelMetric.destroy({ where: { bookId: book.id } });
    await book.destroy();

    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rebuildBook = async (req, res) => {
  try {
    const book = await Book.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    await Chunk.destroy({ where: { bookId: book.id } });
    await ModelMetric.destroy({ where: { bookId: book.id } });
    await book.update({ status: 'processing', progress: 0, progressStep: 'Rebuilding...' });

    res.json({ message: 'Rebuild started' });
    buildIndexAsync(book, req.app.get('io'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const ensureUploadDir = () => {
  const dir = path.resolve(UPLOAD_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

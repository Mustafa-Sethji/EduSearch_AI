import fs from 'fs';
import { SearchHistory, Bookmark, Book, Chunk } from '../models/index.js';
import { mlClient } from '../services/mlClient.js';

export const searchText = async (req, res) => {
  try {
    const { bookId, query, topK = 8 } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: 'Query is required' });

    const book = await Book.findOne({ where: { id: bookId, userId: req.user.id, status: 'ready' } });
    if (!book) return res.status(404).json({ error: 'Book not found or not ready' });

    const result = await mlClient.search(bookId, query.trim(), topK);

    const history = await SearchHistory.create({
      userId: req.user.id,
      bookId,
      queryText: query.trim(),
      querySource: 'text',
      difficulty: result.queryMeta?.difficulty,
      subject: result.queryMeta?.subject,
      resultCount: result.results?.length || 0,
    });

    res.json({ ...result, searchId: history.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchOcr = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file required' });
    const bookId = req.body.bookId;
    const topK = parseInt(req.body.topK || '8', 10);

    const book = await Book.findOne({ where: { id: bookId, userId: req.user.id, status: 'ready' } });
    if (!book) return res.status(404).json({ error: 'Book not found or not ready' });

    const result = await mlClient.ocrSearch(bookId, req.file.path, topK);

    const history = await SearchHistory.create({
      userId: req.user.id,
      bookId,
      queryText: result.extractedText || '[OCR Image]',
      querySource: 'ocr',
      difficulty: result.queryMeta?.difficulty,
      subject: result.queryMeta?.subject,
      resultCount: result.results?.length || 0,
    });

    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json({ ...result, searchId: history.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSearchHistory = async (req, res) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.bookId) where.bookId = req.query.bookId;

    const history = await SearchHistory.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(req.query.limit || '50', 10),
      include: [{ model: Book, as: 'book', attributes: ['id', 'title'] }],
    });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: Book, as: 'book', attributes: ['id', 'title'] }],
    });
    res.json({ bookmarks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBookmark = async (req, res) => {
  try {
    const { bookId, page, snippet, note, color } = req.body;
    const bookmark = await Bookmark.create({
      userId: req.user.id,
      bookId,
      page,
      snippet: snippet || '',
      note: note || '',
      color: color || '#6366f1',
    });
    res.status(201).json({ bookmark });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    await bookmark.destroy();
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const book = await Book.findOne({ where: { id: req.params.bookId, userId: req.user.id } });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const chunks = await Chunk.findAll({ where: { bookId: book.id } });
    let mlAnalytics = {};
    try { mlAnalytics = await mlClient.getAnalytics(book.id); } catch { /* fallback to DB */ }

    const difficultyDist = {};
    const subjectDist = {};
    const clusterDist = {};
    chunks.forEach((c) => {
      difficultyDist[c.difficulty] = (difficultyDist[c.difficulty] || 0) + 1;
      subjectDist[c.subject] = (subjectDist[c.subject] || 0) + 1;
      clusterDist[`Topic ${c.cluster + 1}`] = (clusterDist[`Topic ${c.cluster + 1}`] || 0) + 1;
    });

    res.json({
      summary: {
        totalPages: book.totalPages,
        totalChunks: book.totalChunks,
        totalWords: book.totalWords,
        avgWordsPerChunk: chunks.length
          ? Math.round(chunks.reduce((s, c) => s + c.wordCount, 0) / chunks.length)
          : 0,
      },
      difficultyDist,
      subjectDist,
      clusterDist,
      pageDistribution: mlAnalytics.pageDistribution || {},
      wordCountDistribution: mlAnalytics.wordCountDistribution || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getModelMetrics = async (req, res) => {
  try {
    const book = await Book.findOne({ where: { id: req.params.bookId, userId: req.user.id } });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const metrics = await ModelMetric.findAll({ where: { bookId: book.id } });
    res.json({ metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const recentSearches = await SearchHistory.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    const subjectCounts = {};
    const difficultyCounts = {};
    recentSearches.forEach((s) => {
      if (s.subject) subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
      if (s.difficulty) difficultyCounts[s.difficulty] = (difficultyCounts[s.difficulty] || 0) + 1;
    });

    const topSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
    const topDifficulty = Object.entries(difficultyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Medium';

    const recommendations = [
      { type: 'focus', title: `Focus on ${topSubject}`, description: `You've been searching mostly ${topSubject} topics. Review related chapters.` },
      { type: 'challenge', title: `Try ${topDifficulty === 'Easy' ? 'Hard' : 'Medium'} questions`, description: 'Mix up difficulty levels to improve retention.' },
      { type: 'streak', title: 'Keep your streak alive', description: 'Search at least one question today to maintain your study streak.' },
    ];

    res.json({ recommendations, stats: { subjectCounts, difficultyCounts, totalSearches: recentSearches.length } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

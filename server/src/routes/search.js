import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth.js';
import {
  searchText, searchOcr, getSearchHistory, getBookmarks,
  createBookmark, deleteBookmark, getAnalytics, getModelMetrics, getRecommendations,
} from '../controllers/searchController.js';
import { ensureUploadDir } from '../controllers/bookController.js';

const router = Router();
const uploadDir = ensureUploadDir();

const imageUpload = multer({
  dest: path.join(uploadDir, 'images'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

router.post('/text', auth, searchText);
router.post('/ocr', auth, imageUpload.single('image'), searchOcr);
router.get('/history', auth, getSearchHistory);
router.get('/bookmarks', auth, getBookmarks);
router.post('/bookmarks', auth, createBookmark);
router.delete('/bookmarks/:id', auth, deleteBookmark);
router.get('/analytics/:bookId', auth, getAnalytics);
router.get('/metrics/:bookId', auth, getModelMetrics);
router.get('/recommendations', auth, getRecommendations);

export default router;

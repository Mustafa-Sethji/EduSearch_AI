import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth.js';
import {
  getBooks, getBook, uploadBook, deleteBook, rebuildBook, ensureUploadDir,
} from '../controllers/bookController.js';

const router = Router();
const uploadDir = ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
});

router.get('/', auth, getBooks);
router.get('/:id', auth, getBook);
router.post('/upload', auth, upload.single('pdf'), uploadBook);
router.delete('/:id', auth, deleteBook);
router.post('/:id/rebuild', auth, rebuildBook);

export default router;

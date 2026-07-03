import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const ML = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const mlClient = {
  async buildIndex(bookId, pdfPath, onProgress) {
    const form = new FormData();
    form.append('book_id', String(bookId));
    form.append('pdf', fs.createReadStream(pdfPath));

    const { data } = await axios.post(`${ML}/api/build`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 600000,
    });
    return data;
  },

  async search(bookId, query, topK = 8) {
    const { data } = await axios.post(`${ML}/api/search`, {
      book_id: bookId,
      query,
      top_k: topK,
    });
    return data;
  },

  async ocrSearch(bookId, imagePath, topK = 8) {
    const form = new FormData();
    form.append('book_id', String(bookId));
    form.append('top_k', String(topK));
    form.append('image', fs.createReadStream(imagePath));
    const { data } = await axios.post(`${ML}/api/search/ocr`, form, {
      headers: form.getHeaders(),
      timeout: 120000,
    });
    return data;
  },

  async getAnalytics(bookId) {
    const { data } = await axios.get(`${ML}/api/analytics/${bookId}`);
    return data;
  },

  async deleteIndex(bookId) {
    await axios.delete(`${ML}/api/index/${bookId}`);
  },

  async healthCheck() {
    const { data } = await axios.get(`${ML}/health`, { timeout: 5000 });
    return data;
  },
};

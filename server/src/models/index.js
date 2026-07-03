import User from './User.js';
import Book from './Book.js';
import Chunk from './Chunk.js';
import SearchHistory from './SearchHistory.js';
import Bookmark from './Bookmark.js';
import ModelMetric from './ModelMetric.js';

User.hasMany(Book, { foreignKey: 'userId', as: 'books' });
Book.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Book.hasMany(Chunk, { foreignKey: 'bookId', as: 'chunks' });
Chunk.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

User.hasMany(SearchHistory, { foreignKey: 'userId', as: 'searches' });
SearchHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Book.hasMany(SearchHistory, { foreignKey: 'bookId', as: 'searches' });
SearchHistory.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

User.hasMany(Bookmark, { foreignKey: 'userId', as: 'bookmarks' });
Bookmark.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Book.hasMany(Bookmark, { foreignKey: 'bookId', as: 'bookmarks' });
Bookmark.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

Book.hasMany(ModelMetric, { foreignKey: 'bookId', as: 'metrics' });
ModelMetric.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

export { User, Book, Chunk, SearchHistory, Bookmark, ModelMetric };
